from database import FaissGameDatabase
from checker import FaissGameAnalyzer
from judge import CopyrightJudge  # 수정된 판정 로직 사용
from typing import Dict, List
import logging
import time

logger = logging.getLogger(__name__)

class FaissCopyrightCheckService:
    """Faiss 기반 고도화된 저작권 검사 서비스"""
    
    def __init__(self, index_path: str = "data/game_index"):
        """
        서비스 초기화
        Args:
            index_path: Faiss 인덱스 파일 경로
        """
        self.database = FaissGameDatabase()
        self.analyzer = FaissGameAnalyzer()
        self.judge = CopyrightJudge()
        self.index_path = index_path
        self.is_loaded = False
    
    def initialize_database(self, json_file_path: str, rebuild_index: bool = False) -> None:
        """
        데이터베이스 초기화 (최초 1회 또는 데이터 업데이트 시)
        Args:
            json_file_path: BGG 크롤링 JSON 데이터 파일 경로
            rebuild_index: 기존 인덱스가 있어도 재구축할지 여부
        """
        try:
            # 기존 인덱스 로드 시도
            if not rebuild_index:
                try:
                    self.database.load_index(self.index_path)
                    self.is_loaded = True
                    print(f"✅ 기존 인덱스 로드 완료: {len(self.database.games)}개 게임")
                    return
                except:
                    print("기존 인덱스를 찾을 수 없어 새로 구축합니다...")
            
            # 새 인덱스 구축
            print("🔄 Faiss 인덱스 구축 시작...")
            start_time = time.time()
            
            # 1. 게임 데이터 로드
            self.database.load_games_from_json(json_file_path)
            
            # 2. Faiss 인덱스 구축 및 저장
            self.database.build_faiss_index(self.index_path)
            
            build_time = time.time() - start_time
            print(f"✅ 인덱스 구축 완료: {build_time:.2f}초")
            
            self.is_loaded = True
            
        except Exception as e:
            logger.error(f"데이터베이스 초기화 실패: {e}")
            raise
    
    def check_copyright(self, game_plan: str, plan_title: str) -> Dict:
        """
        메인 저작권 검사 프로세스
        Args:
            game_plan: 게임 기획서 텍스트
            plan_title: 게임 제목
        Returns:
            저작권 검사 결과
        """
        if not self.is_loaded:
            raise ValueError("데이터베이스가 초기화되지 않았습니다. initialize_database()를 먼저 호출하세요.")
        
        print("="*60)
        print(f"🎲 Faiss 기반 저작권 검사 시작: '{plan_title}'")
        print("="*60)
        
        start_time = time.time()
        
        # 1단계: 기획서 분석 (OpenAI)
        game_elements = self.analyzer.extract_game_elements(game_plan, plan_title)
        
        # 2단계: 다중 검색 쿼리 생성
        search_queries = self.analyzer.generate_search_variations(game_elements)
        print(f"2단계: {len(search_queries)}개 검색 쿼리로 유사 게임 검색 중...")
        
        # 3단계: Faiss를 통한 초고속 유사도 검색
        all_similar_games = []
        seen_game_ids = set()
        
        for i, query in enumerate(search_queries):
            print(f"  검색 쿼리 {i+1}: {query[:50]}...")
            similar_games = self.database.search_similar_games(
                query_text=query,
                k=5,  # 쿼리당 5개씩
                min_rating=6.0  # 평점 6.0 이상만
            )
            
            # 중복 제거하면서 병합
            for game in similar_games:
                if game['game_id'] not in seen_game_ids:
                    seen_game_ids.add(game['game_id'])
                    all_similar_games.append(game)
        
        print(f"  ✓ 총 {len(all_similar_games)}개 유사 게임 발견")
        
        # 4단계: OpenAI를 통한 정밀 분석 (상위 결과만)
        print("3단계: OpenAI 정밀 분석...")
        enhanced_games = self.analyzer.enhance_search_with_openai(all_similar_games, game_elements)
        
        # 5단계: 최종 판정 (수정된 간단한 로직)
        print("4단계: 최종 위험도 판정...")
        final_decision = self.judge.make_final_decision(enhanced_games)
        
        # 검사 시간 계산
        total_time = time.time() - start_time
        
        # 최종 응답 생성 (간단한 형태로 수정)
        response = {
            'game_title': game_elements['title'],
            'decision': final_decision['decision'],  # APPROVED 또는 REJECTED
            'max_similarity_score': final_decision['max_similarity'],
            'reasoning': final_decision['reasoning'],
            
            # 상위 5개 유사 게임
            'top_similar_games': final_decision['top_similar_games'],
            
            # 반려시에만 포함되는 상세 비교 분석
            'comparison_details': final_decision.get('comparison_details'),
            
            # 기본 메타 정보
            'processing_time': f"{total_time:.2f}초",
            'total_games_checked': len(all_similar_games),
            'search_queries_used': len(search_queries),
            'data_source': f"Faiss Index ({len(self.database.games)}개 게임)",
            
            # 성능 정보
            'performance_stats': {
                'faiss_search_time': f"{total_time - 2:.2f}초",  # OpenAI 호출 시간 제외 추정
                'total_time': f"{total_time:.2f}초",
                'games_in_database': len(self.database.games),
                'unique_games_found': len(all_similar_games)
            }
        }
        
        print(f"✅ 저작권 검사 완료! (소요시간: {total_time:.2f}초)")
        print(f"   결정: {response['decision']} | 최대유사도: {response['max_similarity_score']:.1%}")
        
        return response
    
    def get_database_stats(self) -> Dict:
        """데이터베이스 통계 정보"""
        if not self.is_loaded:
            return {'status': 'not_loaded'}
        
        return {
            'status': 'loaded',
            'total_games': len(self.database.games),
            'index_dimension': self.database.dimension,
            'average_rating': sum(g.average_rating for g in self.database.games) / len(self.database.games),
            'top_categories': self._get_top_categories(),
            'complexity_distribution': self._get_complexity_distribution()
        }
    
    def _get_top_categories(self) -> List[Dict]:
        """상위 카테고리 통계"""
        category_counts = {}
        for game in self.database.games:
            for category in game.categories:
                category_counts[category] = category_counts.get(category, 0) + 1
        
        sorted_categories = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)
        return [{'category': cat, 'count': count} for cat, count in sorted_categories[:10]]
    
    def _get_complexity_distribution(self) -> Dict:
        """복잡도 분포"""
        complexity_ranges = {'1-2': 0, '2-3': 0, '3-4': 0, '4-5': 0}
        
        for game in self.database.games:
            complexity = game.complexity
            if complexity < 2:
                complexity_ranges['1-2'] += 1
            elif complexity < 3:
                complexity_ranges['2-3'] += 1
            elif complexity < 4:
                complexity_ranges['3-4'] += 1
            else:
                complexity_ranges['4-5'] += 1
        
        return complexity_ranges