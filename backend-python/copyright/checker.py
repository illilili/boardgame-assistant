from openai_utils import call_openai
from typing import Dict, List
import json
import logging

logger = logging.getLogger(__name__)

class FaissGameAnalyzer:
    """Faiss용 게임 기획서 분석기 - OpenAI 최적화"""
    
    def extract_game_elements(self, game_plan: str, plan_title: str) -> Dict[str, str]:
        """기획서에서 Faiss 검색에 최적화된 요소 추출"""
        
        prompt = f"""
다음 보드게임 기획서를 분석하여 유사도 검색에 최적화된 핵심 요소들을 추출해주세요.

게임 제목: {plan_title}

기획서 내용:
{game_plan}

아래 JSON 형태로 정확히 반환해주세요:

{{
  "title": "게임의 실제 제목",
  "search_query": "유사도 검색에 최적화된 통합 쿼리 텍스트 (영어 키워드 포함)",
  "theme_keywords": "핵심 테마 키워드들 (space exploration, medieval fantasy, economic development 등)",
  "mechanic_keywords": "핵심 메커닉 키워드들 (deck building, worker placement, resource management 등)",
  "description": "게임의 핵심 컨셉을 간결하게 요약",
  "target_players": "예상 플레이어 수 (예: 2-4)",
  "estimated_complexity": "예상 복잡도 수준 (1-5 사이의 숫자)"
}}

중요 지침:
- search_query는 Faiss 검색용 통합 텍스트 (모든 정보를 자연스럽게 결합)
- 영어 키워드 우선 사용 (국제적 표준)
- BGG 데이터베이스에 있을 법한 용어 사용
- 너무 구체적이지 않게, 적당한 추상화 수준 유지
"""
        
        try:
            print(f"1단계: '{plan_title}' 기획서 분석 중...")
            response = call_openai(prompt, max_tokens=500, temperature=0.3)
            
            # JSON 추출
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start == -1:
                raise ValueError("JSON을 찾을 수 없습니다")
            
            json_text = response[json_start:json_end]
            parsed = json.loads(json_text)
            
            # 결과 검증 및 기본값 설정
            result = {
                'title': parsed.get('title', plan_title),
                'search_query': parsed.get('search_query', ''),
                'theme_keywords': parsed.get('theme_keywords', ''),
                'mechanic_keywords': parsed.get('mechanic_keywords', ''),
                'description': parsed.get('description', ''),
                'target_players': parsed.get('target_players', '2-4'),
                'estimated_complexity': parsed.get('estimated_complexity', '3')
            }
            
            # 검색 쿼리가 비어있으면 다른 필드들로 생성
            if not result['search_query']:
                result['search_query'] = f"{result['title']} {result['description']} {result['theme_keywords']} {result['mechanic_keywords']}"
            
            print(f"  ✓ 분석 완료")
            print(f"  ✓ 검색 쿼리: {result['search_query'][:100]}...")
            return result
            
        except Exception as e:
            print(f"  ✗ 기획서 분석 오류: {e}")
            # 폴백: 기본적인 검색 쿼리 생성
            return {
                'title': plan_title,
                'search_query': f"{plan_title} {game_plan[:200]}",
                'theme_keywords': 'analysis failed',
                'mechanic_keywords': 'analysis failed',
                'description': game_plan[:200] + "..." if len(game_plan) > 200 else game_plan,
                'target_players': '2-4',
                'estimated_complexity': '3'
            }
    
    def generate_search_variations(self, game_elements: Dict[str, str]) -> List[str]:
        """검색 정확도 향상을 위한 다양한 검색 쿼리 생성"""
        
        queries = []
        
        # 1. 메인 검색 쿼리
        queries.append(game_elements['search_query'])
        
        # 2. 테마 중심 쿼리
        if game_elements['theme_keywords']:
            queries.append(f"{game_elements['theme_keywords']} {game_elements['mechanic_keywords']}")
        
        # 3. 메커닉 중심 쿼리
        if game_elements['mechanic_keywords']:
            queries.append(f"{game_elements['mechanic_keywords']} game board")
        
        # 4. 간단한 설명 기반 쿼리
        if game_elements['description']:
            queries.append(game_elements['description'])
        
        # 중복 제거
        unique_queries = []
        for query in queries:
            if query and query not in unique_queries:
                unique_queries.append(query)
        
        return unique_queries[:3]  # 최대 3개만 사용
    
def enhance_search_with_openai(self, similar_games: List[Dict], game_elements: Dict[str, str]) -> List[Dict]:
    """OpenAI를 사용한 검색 결과 정제 및 유사도 재평가 - 4가지 기준"""
    
    if not similar_games:
        return []
    
    # 상위 결과만 분석 (비용 절약)
    top_games = similar_games[:5]
    
    # 게임 정보를 OpenAI가 분석할 수 있는 형태로 변환
    games_info = []
    for i, game in enumerate(top_games):
        games_info.append(f"""
게임 {i+1}: {game['name']}
설명: {game['description']}
카테고리: {', '.join(game['categories'][:3])}
메커닉: {', '.join(game['mechanisms'][:3])}
복잡도: {game['complexity']:.1f}
평점: {game['geek_rating']:.1f}
""")
    
    prompt = f"""
다음 새 게임과 검색된 기존 게임들의 실제 유사도를 전문적으로 분석해주세요.

새 게임:
제목: {game_elements['title']}
설명: {game_elements['description']}
테마: {game_elements['theme_keywords']}
메커닉: {game_elements['mechanic_keywords']}

검색된 기존 게임들:
{''.join(games_info)}

각 기존 게임과 새 게임의 실제 유사도를 다음 4가지 기준으로 재평가해주세요:

1. 핵심 메커닉 유사도 (45%) - 게임 규칙, 시스템, 플레이 방식
2. 설명 유사도 (25%) - 게임 컨셉, 스토리, 전체적인 느낌  
3. 테마/설정 유사도 (20%) - 배경, 세계관, 장르
4. 게임 경험/복잡도 유사도 (10%) - 난이도, 플레이 시간, 타겟층

결과를 JSON 배열로 반환:
[
  {{
    "game_index": 0,
    "adjusted_similarity": 0.75,
    "risk_level": "medium",
    "key_similarities": ["핵심 메커닉 A 유사", "게임 설명 컨셉 유사", "테마 B 공통점", "복잡도 비슷"],
    "differences": ["승리 조건 다름", "스토리 전개 방식", "플레이어 상호작용 상이", "특별 규칙 차이"]
  }},
  ...
]

유사도 기준:
- 0.8+: 매우 유사 (저작권 위험)
- 0.6-0.8: 상당히 유사 (주의 필요)
- 0.4-0.6: 부분적 유사 (일반적)
- 0.4 미만: 낮은 유사도
"""
    
    try:
        print(f"  ✓ OpenAI로 상위 {len(top_games)}개 게임 정밀 분석 중... (4가지 기준)")
        response = call_openai(prompt, max_tokens=800, temperature=0.2)
        
        # JSON 파싱
        json_start = response.find('[')
        json_end = response.rfind(']') + 1
        
        if json_start != -1 and json_end > json_start:
            json_text = response[json_start:json_end]
            analysis_results = json.loads(json_text)
            
            # 결과를 원본 게임 정보와 결합
            enhanced_games = []
            for result in analysis_results:
                if result['game_index'] < len(top_games):
                    game = top_games[result['game_index']].copy()
                    game['adjusted_similarity'] = result['adjusted_similarity']
                    game['risk_level'] = result['risk_level']
                    game['key_similarities'] = result.get('key_similarities', [])
                    game['differences'] = result.get('differences', [])
                    enhanced_games.append(game)
            
            # 조정된 유사도로 정렬
            enhanced_games.sort(key=lambda x: x['adjusted_similarity'], reverse=True)
            
            print(f"  ✓ OpenAI 4가지 기준 정밀 분석 완료")
            return enhanced_games
        
    except Exception as e:
        print(f"  ✗ OpenAI 정밀 분석 실패: {e}")
    
    # 실패 시 원본 결과 반환
    return similar_games
    
    print("Hello from checker!")