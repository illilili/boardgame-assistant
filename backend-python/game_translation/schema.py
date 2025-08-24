from pydantic import BaseModel
from typing import List, Optional


class GameTranslationRequest(BaseModel):
    """게임 번역 요청 스키마"""
    categories: Optional[List[str]] = None
    mechanics: Optional[List[str]] = None
    description: Optional[str] = None
    

class GameTranslationResponse(BaseModel):
    """게임 번역 응답 스키마"""
    categories: Optional[List[str]] = None
    mechanics: Optional[List[str]] = None
    description: Optional[str] = None
    success: bool
    message: str


class BatchTranslationRequest(BaseModel):
    """배치 번역 요청 스키마"""
    games: List[GameTranslationRequest]
    

class BatchTranslationResponse(BaseModel):
    """배치 번역 응답 스키마"""
    translations: List[GameTranslationResponse]
    total_processed: int
    success_count: int
    failure_count: int
    success: bool