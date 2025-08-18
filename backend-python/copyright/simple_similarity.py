from typing import List
import re
from difflib import SequenceMatcher

def simple_similarity(text1: str, text2: str) -> float:
    """간단한 텍스트 유사도 계산 (0~1)"""
    return SequenceMatcher(None, text1.lower(), text2.lower()).ratio()

def keyword_similarity(text1: str, text2: str) -> float:
    """키워드 기반 유사도 계산"""
    # 단어 추출 (영어와 한국어 모두 지원)
    words1 = set(re.findall(r'\w+', text1.lower()))
    words2 = set(re.findall(r'\w+', text2.lower()))
    
    if not words1 or not words2:
        return 0.0
    
    # 자카드 유사도
    intersection = len(words1.intersection(words2))
    union = len(words1.union(words2))
    
    return intersection / union if union > 0 else 0.0

def compute_similarity_simple(input_text: str, candidate_texts: List[str]) -> List[float]:
    """
    간단한 유사도 계산 함수
    sentence-transformers 대신 사용
    """
    scores = []
    for candidate in candidate_texts:
        # 두 가지 유사도의 평균
        text_sim = simple_similarity(input_text, candidate)
        keyword_sim = keyword_similarity(input_text, candidate)
        
        # 가중 평균 (텍스트 유사도 70%, 키워드 유사도 30%)
        combined_score = (text_sim * 0.7) + (keyword_sim * 0.3)
        scores.append(combined_score)
    
    return scores