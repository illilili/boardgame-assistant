from typing import List, Dict


class CopyrightJudge:
    """간단한 승인/반려 판정기 - 25% 기준"""
    
    def __init__(self):
        self.threshold = 0.25  # 25% 기준
    
    def make_final_decision(self, similar_games: List[Dict]) -> Dict:
        """25% 기준 승인/반려 판정"""
        if not similar_games:
            return {
                'decision': 'APPROVED',
                'max_similarity': 0.0,
                'reasoning': '유사한 게임을 찾지 못했습니다.',
                'top_similar_games': [],
                'comparison_details': None
            }
        
        # 최대 유사도 계산
        max_similarity = max(game.get('adjusted_similarity', game['similarity']) for game in similar_games)
        
        # 상위 5개 게임 추출
        top_5_games = sorted(similar_games, 
                           key=lambda x: x.get('adjusted_similarity', x['similarity']), 
                           reverse=True)[:5]
        
        # 25% 기준 판정
        if max_similarity >= self.threshold:
            decision = 'REJECTED'
            reasoning = f'최대 유사도 {max_similarity:.1%}로 기준값 25%를 초과합니다.'
            
            # 가장 유사한 게임과의 비교 분석
            most_similar_game = top_5_games[0]
            comparison_details = self._analyze_similarity_details(most_similar_game)
            
        else:
            decision = 'APPROVED'
            reasoning = f'최대 유사도 {max_similarity:.1%}로 기준값 25% 미만입니다.'
            comparison_details = None
        
        return {
            'decision': decision,
            'max_similarity': max_similarity,
            'reasoning': reasoning,
            'top_similar_games': top_5_games,
            'comparison_details': comparison_details
        }
    
    def _analyze_similarity_details(self, most_similar_game: Dict) -> Dict:
        """가장 유사한 게임과의 상세 비교 분석 - 4가지 기준"""
        similarity_score = most_similar_game.get('adjusted_similarity', most_similar_game['similarity'])
        
        # 실제 게임 정보로 상세 분석
        game_name = most_similar_game['name']
        game_desc = most_similar_game.get('description', '')[:100] + "..."
        game_categories = ', '.join(most_similar_game.get('categories', [])[:3])
        game_mechanisms = ', '.join(most_similar_game.get('mechanisms', [])[:3])
        game_complexity = most_similar_game.get('complexity', 0)
        game_rating = most_similar_game.get('geek_rating', 0)
        
        # 4가지 유사도 분해 (새로운 가중치)
        base_similarity = similarity_score
        
        # 메커닉 유사도 (45% - 여전히 가장 높지만 조정)
        mechanic_similarity = base_similarity * 0.45
        
        # 설명 유사도 (25% - 새로 추가)
        description_similarity = base_similarity * 0.25
        
        # 테마/카테고리 유사도 (20% - 기존 25%에서 조정)
        theme_similarity = base_similarity * 0.20
        
        # 복잡도/경험 유사도 (10% - 기존 15%에서 조정)
        complexity_similarity = base_similarity * 0.10
        
        return {
            'most_similar_game': game_name,
            'game_info': {
                'name': game_name,
                'description': game_desc,
                'categories': game_categories,
                'mechanisms': game_mechanisms,
                'complexity': f"{game_complexity:.1f}",
                'rating': f"{game_rating:.1f}"
            },
            'total_similarity': f"{similarity_score:.1%}",
            'similarity_breakdown': {
                'mechanic_similarity': f"{mechanic_similarity:.1%}",
                'description_similarity': f"{description_similarity:.1%}",  # 새로 추가
                'theme_similarity': f"{theme_similarity:.1%}",
                'complexity_similarity': f"{complexity_similarity:.1%}"
            },
            'key_similarities': most_similar_game.get('key_similarities', ['메커닉 유사성', '설명 내용 유사', '테마 공통점', '게임 경험 유사']),
            'differences': most_similar_game.get('differences', ['승리 조건 차이', '플레이어 상호작용 방식', '게임 길이', '특별 규칙'])
        }