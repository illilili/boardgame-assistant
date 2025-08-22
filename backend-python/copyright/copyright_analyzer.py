import os
import json
import time
import numpy as np
import pandas as pd
from typing import List
from pathlib import Path
from .schemas import TranslatedGameData, SimilarGame, PlanCopyrightCheckResponse, RiskLevel

# 임베딩이 없는 경우 폴백으로 사용할 간단 유사도
from .simple_similarity import compute_similarity_simple

# 선택한 모델키(인덱서와 동일 키여야 함). 환경변수로도 오버라이드 가능.
DEFAULT_MODEL_KEY = os.getenv("COPYRIGHT_MODEL_KEY", "mini12")

class CopyrightAnalyzer:
    def __init__(self, model_key: str = DEFAULT_MODEL_KEY):
        self.model_key = model_key
        self.use_transformer = True
        self.model = None

        # 캐시/리소스 로드
        self.cache_dir = Path(__file__).resolve().parent / "cache" / self.model_key
        self._load_cached_index()     # 임베딩/메타/후보텍스트
        self._load_model_for_query()  # 입력 1건 인코딩용(가벼움)

    # ---------- 캐시/모델 로딩 ----------
    def _load_cached_index(self):
        """오프라인 생성된 임베딩과 메타 정보를 로드."""
        try:
            emb_path = self.cache_dir / "embeddings.npy"
            cand_path = self.cache_dir / "candidates.json"
            meta_path = self.cache_dir / "meta.json"

            if not emb_path.exists() or not cand_path.exists() or not meta_path.exists():
                raise FileNotFoundError(
                    f"임베딩 캐시가 없습니다. 먼저 인덱스를 생성하세요: python -m copyright.indexer --model {self.model_key}"
                )

            # (N, D) normalized float32
            self.embeddings = np.load(emb_path)  # 이미 정규화되어 있음
            with open(cand_path, "r", encoding="utf-8") as f:
                self.candidate_texts = json.load(f)
            with open(meta_path, "r", encoding="utf-8") as f:
                self.meta = json.load(f)

            # 안전장치
            assert self.embeddings.shape[0] == len(self.candidate_texts) == len(self.meta)
            print(f"📦 캐시 로드 완료: {self.embeddings.shape[0]}개 항목")
        except Exception as e:
            # 캐시가 없으면 폴백으로 CSV 로드 + simple 유사도만 사용
            print(f"임베딩 캐시 로드 실패: {e}\n→ simple 유사도 모드로 동작합니다.")
            self.use_transformer = False
            self.embeddings = None
            self.meta = None
            # CSV를 읽어 후보텍스트만 만들어서 simple 비교에 사용
            csv_path = Path(__file__).resolve().parent.parent / "pricing" / "data" / "bgg_data.csv"
            df = pd.read_csv(csv_path, encoding="latin1")
            self.candidate_texts = [
                f"{str(r.get('category',''))} {str(r.get('mechanic',''))} {str(r.get('Description',''))}"
                for _, r in df.iterrows()
            ]
            self.meta = df.to_dict(orient="records")

    def _load_model_for_query(self):
        """입력 텍스트 1건을 임베딩하기 위한 모델(가볍게 한 번만 로드)."""
        if not self.use_transformer:
            self.model = None
            return
        try:
            from .model_loader import load_model
            self.model = load_model(self.model_key)  # sentence-transformers 이름 매핑 사용
            print("SentenceTransformer 로드 완료(입력 인코딩용).")
        except Exception as e:
            print(f"모델 로드 실패: {e} → simple 유사도 모드로 전환")
            self.use_transformer = False
            self.model = None

    # ---------- 유틸 ----------
    def _create_input_text(self, game_data: TranslatedGameData) -> str:
        return f"{game_data.theme}\n{', '.join(game_data.mechanics)}\n{game_data.description}"

    def _determine_risk_level(self, max_score: float) -> RiskLevel:
        if max_score >= 0.8: return RiskLevel.HIGH_RISK
        if max_score >= 0.6: return RiskLevel.CAUTION
        if max_score >= 0.4: return RiskLevel.LOW_RISK
        return RiskLevel.NO_RISK
    
    def _extract_overlapping_elements(self, game_data: TranslatedGameData, similar_game_data: dict) -> List[str]:
        """두 게임 간 중복되는 요소를 자세히 추출합니다."""
        overlapping = []
        
        # 1. 테마/카테고리 중복 검사
        game_theme_lower = game_data.theme.lower()
        similar_category = similar_game_data.get('category', '').lower()
        
        # 구체적인 테마 키워드들
        theme_keywords = {
            'fantasy': ['fantasy', 'magic', 'dragon', 'wizard', 'medieval'],
            'sci-fi': ['science', 'space', 'future', 'robot', 'alien'],
            'war': ['war', 'battle', 'military', 'combat', 'conflict'],
            'economic': ['economic', 'trade', 'business', 'money', 'market'],
            'adventure': ['adventure', 'exploration', 'quest', 'journey'],
            'horror': ['horror', 'zombie', 'monster', 'dark', 'evil'],
            'historical': ['ancient', 'historical', 'civilization', 'empire']
        }
        
        for theme_name, keywords in theme_keywords.items():
            game_has_theme = any(keyword in game_theme_lower for keyword in keywords)
            similar_has_theme = any(keyword in similar_category for keyword in keywords)
            if game_has_theme and similar_has_theme:
                matching_keywords = [kw for kw in keywords if kw in game_theme_lower and kw in similar_category]
                if matching_keywords:
                    overlapping.append(f"테마 유사성: {theme_name} 테마 (키워드: {', '.join(matching_keywords)})")
                else:
                    # 키워드가 직접 매칭되지 않았지만 카테고리적으로 유사한 경우
                    overlapping.append(f"테마 유사성: {theme_name} 계열 테마")
        
        # 2. 게임 규칙 중복 검사 (더 구체적으로)
        game_mechanics_text = ' '.join(game_data.mechanics).lower()
        similar_mechanic = similar_game_data.get('mechanic', '').lower()
        
        # 구체적인 규칙 카테고리들
        mechanic_categories = {
            '카드 게임': ['card', 'deck', 'hand', 'draw'],
            '타일 배치': ['tile', 'placement', 'grid', 'board'],
            '주사위': ['dice', 'roll', 'random'],
            '전략': ['strategy', 'tactical', 'planning'],
            '협력': ['cooperative', 'collaboration', 'team'],
            '경쟁': ['competitive', 'versus', 'against'],
            '자원 관리': ['resource', 'management', 'collect'],
            '영역 확장': ['area', 'territory', 'control', 'expansion'],
            '워커 플레이스먼트': ['worker', 'placement', 'action'],
            '덱 빌딩': ['deck', 'building', 'construct']
        }
        
        for mechanic_name, keywords in mechanic_categories.items():
            game_has_mechanic = any(keyword in game_mechanics_text for keyword in keywords)
            similar_has_mechanic = any(keyword in similar_mechanic for keyword in keywords)
            if game_has_mechanic and similar_has_mechanic:
                matching_keywords = [kw for kw in keywords if kw in game_mechanics_text and kw in similar_mechanic]
                if matching_keywords:
                    overlapping.append(f"규칙 유사성: {mechanic_name} (공통 키워드: {', '.join(matching_keywords)})")
                else:
                    overlapping.append(f"규칙 유사성: {mechanic_name} 계열")
        
        # 3. 게임 설명/목표 중복 검사
        game_description = game_data.description.lower()
        similar_description = similar_game_data.get('Description', '').lower()
        
        # 게임 목표나 플레이 스타일 키워드들
        gameplay_keywords = {
            '승리 조건': ['win', 'victory', 'goal', 'objective', 'points'],
            '플레이어 상호작용': ['player', 'opponent', 'interaction', 'compete'],
            '게임 진행': ['turn', 'round', 'phase', 'sequence'],
            '난이도': ['easy', 'simple', 'complex', 'difficult', 'strategy'],
            '시간': ['quick', 'fast', 'long', 'time', 'minutes']
        }
        
        for aspect_name, keywords in gameplay_keywords.items():
            game_has_aspect = any(keyword in game_description for keyword in keywords)
            similar_has_aspect = any(keyword in similar_description for keyword in keywords)
            if game_has_aspect and similar_has_aspect:
                matching_keywords = [kw for kw in keywords if kw in game_description and kw in similar_description]
                if matching_keywords:
                    overlapping.append(f"게임플레이 유사성: {aspect_name} (공통: {', '.join(matching_keywords)})")
        
        # 4. 특별한 게임 요소들
        special_elements = ['miniature', 'component', 'board', 'token', 'marker', 'piece']
        game_text = f"{game_theme_lower} {game_mechanics_text} {game_description}"
        similar_text = f"{similar_category} {similar_mechanic} {similar_description}"
        
        for element in special_elements:
            if element in game_text and element in similar_text:
                overlapping.append(f"구성 요소 유사성: {element}")
        
        return overlapping[:5]  # 최대 5개까지 반환 (더 자세한 정보 제공)
    def _generate_analysis_summary(self, risk_level: RiskLevel, similar_games: List[SimilarGame]) -> str:
        """상세한 분석 요약을 생성합니다."""
        if not similar_games:
            return "분석된 유사한 게임이 없습니다. 매우 독창적인 게임 아이디어로 보입니다."
        
        # 가장 유사한 게임과 유사도 점수
        top_game = similar_games[0]
        similarity_percentage = top_game.similarityScore
        
        # 공통 요소들 요약
        all_overlapping = []
        for game in similar_games[:2]:  # 상위 2개 게임의 공통 요소만 분석
            all_overlapping.extend(game.overlappingElements)
        
        # 유사성 카테고리별로 그룹화
        theme_similarities = [elem for elem in all_overlapping if '테마 유사성' in elem]
        mechanic_similarities = [elem for elem in all_overlapping if '규칙 유사성' in elem]
        gameplay_similarities = [elem for elem in all_overlapping if '게임플레이 유사성' in elem]
        component_similarities = [elem for elem in all_overlapping if '구성 요소 유사성' in elem]
        
        summary_parts = []
        
        if risk_level == RiskLevel.HIGH_RISK:
            summary_parts.append(f"**저작권 위험 높음** (최대 유사도: {similarity_percentage}%)")
            summary_parts.append(f"'{top_game.title}'와 매우 높은 유사성을 보입니다.")
        elif risk_level == RiskLevel.CAUTION:
            summary_parts.append(f"**저작권 위험 주의** (최대 유사도: {similarity_percentage}%)")
            summary_parts.append(f"'{top_game.title}' 등과 유사성을 보입니다.")
        elif risk_level == RiskLevel.LOW_RISK:
            summary_parts.append(f"**저작권 위험 낮음** (최대 유사도: {similarity_percentage}%)")
            summary_parts.append(f"'{top_game.title}' 등과 약간의 유사성을 보입니다.")
        else:
            summary_parts.append(f"**저작권 위험 없음** (최대 유사도: {similarity_percentage}%)")
            summary_parts.append("기존 게임들과 낮은 유사성을 보여 저작권 위협이 없고 독창적입니다.")
        
        # 상세 유사성 분석
        if theme_similarities:
            summary_parts.append(f"\n**테마적 유사성:** {len(theme_similarities)}개 발견")
            for similarity in theme_similarities[:5]:  # 최대 2개만
                summary_parts.append(f"  • {similarity}")
        
        if mechanic_similarities:
            summary_parts.append(f"\n**규칙 유사성:** {len(mechanic_similarities)}개 발견")
            for similarity in mechanic_similarities[:5]:  # 최대 2개만
                summary_parts.append(f"  • {similarity}")
        
        if gameplay_similarities:
            summary_parts.append(f"\n**게임플레이 유사성:** {len(gameplay_similarities)}개 발견")
            for similarity in gameplay_similarities[:5]:  # 최대 2개만
                summary_parts.append(f"  • {similarity}")
        
        if component_similarities:
            summary_parts.append(f"\n**구성요소 유사성:** {len(component_similarities)}개 발견")
        
        # 권장사항 - 구체적인 개선 방향 제시
        recommendations = []

        if risk_level == RiskLevel.HIGH_RISK:
            recommendations.append("**긴급 개선 필요:**")
            if theme_similarities:
                recommendations.append(f"- 테마 변경: 현재 {len(theme_similarities)}개의 테마 요소가 기존 게임과 중복됩니다")
                for sim in theme_similarities[:5]:
                    recommendations.append(f"  └ {sim}")
            if mechanic_similarities:
                recommendations.append(f"- 핵심 규칙 재설계: {len(mechanic_similarities)}개의 게임 규칙이 유사합니다")
                for sim in mechanic_similarities[:5]:
                    recommendations.append(f"  └ {sim}")
        elif risk_level == RiskLevel.CAUTION:
            recommendations.append("**개선 권장사항:**")
            if theme_similarities:
                recommendations.append(f"- 테마 차별화: 다음 {len(theme_similarities)}개 요소를 독창적으로 변경 고려")
                for sim in theme_similarities[:5]:
                    recommendations.append(f"  └ {sim} → 고유한 배경/설정으로 변경")
            if mechanic_similarities:
                recommendations.append(f"- 규칙 혁신: 다음 {len(mechanic_similarities)}개 규칙에 독창적 요소 추가")
                for sim in mechanic_similarities[:5]:
                    recommendations.append(f"  └ {sim} → 새로운 규칙이나 변형 도입")
            if gameplay_similarities:
                recommendations.append(f"- 게임플레이 개선: 다음 {len(gameplay_similarities)}개 요소 차별화")
                for sim in gameplay_similarities[:5]:
                    recommendations.append(f"  └ {sim} → 독특한 승리 조건이나 플레이 방식 도입")
        elif risk_level == RiskLevel.LOW_RISK:
            recommendations.append("**현재 상태 유지 권장:**")
            recommendations.append("- 현재의 독창적인 방향성을 계속 발전시키세요")
            if similar_games:
                recommendations.append(f"- 다만 '{top_game.title}'과의 미세한 유사점은 더욱 차별화할 수 있습니다")
        else:
            recommendations.append("**현재 상태 유지 권장:**")
            recommendations.append("- 현재의 독창적인 방향성을 계속 발전시키세요")
            if similar_games:
                recommendations.append(f"- 다만 '{top_game.title}'과의 미세한 유사점은 더욱 차별화할 수 있습니다")
        
        if recommendations:
            summary_parts.append(f"\n**구체적 개선 방향:**")
            summary_parts.extend(recommendations)
        
        return '\n'.join(summary_parts)

    def _compute_similarity_fast(self, input_text: str) -> List[float]:
        """
        캐시된 임베딩(정규화 완료)과 입력 1건 임베딩(정규화)을 dot-product로 빠르게 코사인 유사도 계산.
        """
        # 캐시/모델이 없으면 simple로
        if not (self.use_transformer and self.model and self.embeddings is not None):
            return compute_similarity_simple(input_text, self.candidate_texts)

        # 입력 1건을 벡터화 + 정규화
        q = self.model.encode([input_text], convert_to_numpy=True, normalize_embeddings=True)  # (1, D)
        # 코사인 유사도 = 정규화된 벡터 끼리 내적
        sims = np.dot(q, self.embeddings.T)[0]  # (N,)
        return sims.tolist()

    # ---------- 메인 ----------
    async def analyze_copyright(self, game_data: TranslatedGameData) -> PlanCopyrightCheckResponse:
        start_time = time.time()
        print(f"📊 저작권 분석 시작 - Plan ID: {game_data.planId}")

        # 1) 유사도 계산
        t0 = time.time()
        input_text = self._create_input_text(game_data)
        scores = self._compute_similarity_fast(input_text)
        print(f"⚡ 유사도 계산 완료: {time.time()-t0:.2f}초 (총 {len(scores)}개 비교)")

        # 2) 상위 3개 추출
        top_idx = np.argsort(scores)[::-1][:3]
        similar_games = []
        for i in top_idx:
            score = scores[i]
            if score <= 0.10:
                continue
            meta = self.meta[i]
            overlapping = self._extract_overlapping_elements(game_data, meta)
            similar_games.append(
                SimilarGame(
                    title=meta.get("title", "Unknown Game"),
                    similarityScore=round(float(score) * 100, 1),
                    overlappingElements=overlapping,
                    bggLink=f"https://boardgamegeek.com/boardgame/{meta.get('game_id','')}" if meta.get("game_id") else None
                )
            )

        max_score = float(scores[top_idx[0]]) if len(top_idx) else 0.0
        risk = self._determine_risk_level(max_score)
        summary = self._generate_analysis_summary(risk, similar_games)

        print(f"🔍 결과 분석 완료: {time.time()-t0:.2f}초 (유사 {len(similar_games)}개)")
        print(f"✅ 총 소요시간: {time.time()-start_time:.2f}초, 위험도: {risk.value}")

        return PlanCopyrightCheckResponse(
            planId=game_data.planId,
            riskLevel=risk,
            similarGames=similar_games,
            analysisSummary=summary
        )
