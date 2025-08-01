import json
import numpy as np
import faiss
from typing import List, Dict, Optional
from dataclasses import dataclass
import pickle
import os
from sentence_transformers import SentenceTransformer
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class GameData:
    """게임 데이터 클래스"""
    game_id: int
    name: str
    description: str
    categories: List[str]
    mechanisms: List[str]
    min_players: float
    max_players: float
    min_age: str
    complexity: float
    geek_rating: float
    average_rating: float
    amazon_price: str = ""
    image_url: str = ""
    
    def to_embedding_text(self) -> str:
        """임베딩용 텍스트 생성"""
        categories_text = " ".join(self.categories) if self.categories else ""
        mechanisms_text = " ".join(self.mechanisms) if self.mechanisms else ""
        
        # 복잡도와 인원수 정보도 텍스트로 포함
        player_info = f"players {int(self.min_players)} to {int(self.max_players)}"
        complexity_info = f"complexity {self.complexity:.1f}"
        
        return f"{self.name} {self.description} {categories_text} {mechanisms_text} {player_info} {complexity_info}"

class FaissGameDatabase:
    """Faiss 기반 게임 데이터베이스"""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        초기화
        Args:
            model_name: SentenceTransformer 모델명
        """
        self.model = SentenceTransformer(model_name)
        self.dimension = self.model.get_sentence_embedding_dimension()
        self.index = None
        self.games: List[GameData] = []
        self.game_id_to_index: Dict[int, int] = {}
        
        logger.info(f"임베딩 모델 로드 완료: {model_name} (차원: {self.dimension})")
    
    def load_games_from_json(self, json_file_path: str) -> None:
        """JSON 파일에서 게임 데이터 로드"""
        logger.info(f"게임 데이터 로드 시작: {json_file_path}")
        
        with open(json_file_path, 'r', encoding='utf-8') as f:
            games_data = json.load(f)
        
        self.games = []
        for game_data in games_data:
            try:
                # JSON 데이터를 GameData 객체로 변환
                categories = eval(game_data.get('카테고리', '[]')) if isinstance(game_data.get('카테고리'), str) else game_data.get('카테고리', [])
                mechanisms = eval(game_data.get('메커니즘', '[]')) if isinstance(game_data.get('메커니즘'), str) else game_data.get('메커니즘', [])
                
                game = GameData(
                    game_id=int(game_data['게임ID']),
                    name=game_data['이름'],
                    description=game_data.get('설명', ''),
                    categories=categories,
                    mechanisms=mechanisms,
                    min_players=float(game_data.get('최소인원', 1)),
                    max_players=float(game_data.get('최대인원', 4)),
                    min_age=game_data.get('최소나이', ''),
                    complexity=float(game_data.get('난이도', 0)),
                    geek_rating=float(game_data.get('Geek Rating', 0)),
                    average_rating=float(game_data.get('Average Rating', 0)),
                    amazon_price=game_data.get('amazon_price', ''),
                    image_url=game_data.get('이미지', '')
                )
                self.games.append(game)
                
            except Exception as e:
                logger.warning(f"게임 데이터 파싱 실패: {game_data.get('이름', 'Unknown')} - {e}")
                continue
        
        # 게임 ID to 인덱스 매핑 생성
        self.game_id_to_index = {game.game_id: idx for idx, game in enumerate(self.games)}
        
        logger.info(f"게임 데이터 로드 완료: {len(self.games)}개 게임")
    
    def build_faiss_index(self, save_path: Optional[str] = None) -> None:
        """Faiss 인덱스 구축"""
        if not self.games:
            raise ValueError("게임 데이터가 없습니다. 먼저 load_games_from_json을 호출하세요.")
        
        logger.info("임베딩 생성 시작...")
        
        # 모든 게임의 임베딩 텍스트 생성
        embedding_texts = [game.to_embedding_text() for game in self.games]
        
        # 임베딩 벡터 생성 (배치 처리로 효율성 향상)
        embeddings = self.model.encode(embedding_texts, show_progress_bar=True, batch_size=32)
        embeddings = embeddings.astype('float32')  # Faiss는 float32 선호
        
        # Faiss 인덱스 생성 (Inner Product 사용)
        self.index = faiss.IndexFlatIP(self.dimension)
        
        # 벡터 정규화 (코사인 유사도를 위해)
        faiss.normalize_L2(embeddings)
        
        # 인덱스에 임베딩 추가
        self.index.add(embeddings)
        
        logger.info(f"Faiss 인덱스 구축 완료: {self.index.ntotal}개 벡터")
        
        # 인덱스 저장
        if save_path:
            self.save_index(save_path)
    
    def save_index(self, save_path: str) -> None:
        """인덱스와 게임 데이터 저장"""
        os.makedirs(os.path.dirname(save_path) if os.path.dirname(save_path) else '.', exist_ok=True)
        
        # Faiss 인덱스 저장
        faiss.write_index(self.index, f"{save_path}.faiss")
        
        # 게임 데이터 저장
        with open(f"{save_path}.pkl", 'wb') as f:
            pickle.dump({
                'games': self.games,
                'game_id_to_index': self.game_id_to_index,
                'dimension': self.dimension
            }, f)
        
        logger.info(f"인덱스 저장 완료: {save_path}")
    
    def load_index(self, save_path: str) -> None:
        """저장된 인덱스와 게임 데이터 로드"""
        # Faiss 인덱스 로드
        self.index = faiss.read_index(f"{save_path}.faiss")
        
        # 게임 데이터 로드
        with open(f"{save_path}.pkl", 'rb') as f:
            data = pickle.load(f)
            self.games = data['games']
            self.game_id_to_index = data['game_id_to_index']
            self.dimension = data['dimension']
        
        logger.info(f"인덱스 로드 완료: {len(self.games)}개 게임")
    
    def search_similar_games(self, query_text: str, k: int = 10, min_rating: float = 0.0) -> List[Dict]:
        """유사한 게임 검색"""
        if self.index is None:
            raise ValueError("인덱스가 구축되지 않았습니다.")
        
        # 쿼리 텍스트 임베딩
        query_embedding = self.model.encode([query_text])
        query_embedding = query_embedding.astype('float32')
        faiss.normalize_L2(query_embedding)
        
        # 유사도 검색
        similarities, indices = self.index.search(query_embedding, k * 2)  # 필터링을 위해 더 많이 검색
        
        results = []
        for similarity, idx in zip(similarities[0], indices[0]):
            if idx == -1:  # Faiss에서 유효하지 않은 인덱스
                continue
                
            game = self.games[idx]
            
            # 평점 필터링
            if game.geek_rating < min_rating:
                continue
            
            results.append({
                'game_id': game.game_id,
                'name': game.name,
                'similarity': float(similarity),
                'description': game.description,
                'categories': game.categories,
                'mechanisms': game.mechanisms,
                'complexity': game.complexity,
                'geek_rating': game.geek_rating,
                'average_rating': game.average_rating,
                'min_players': game.min_players,
                'max_players': game.max_players,
                'image_url': game.image_url
            })
            
            if len(results) >= k:
                break
        
        return results