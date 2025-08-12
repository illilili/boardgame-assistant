from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class RiskLevel(str, Enum):
    NO_RISK = "NO_RISK"
    LOW_RISK = "LOW_RISK"
    CAUTION = "CAUTION"
    HIGH_RISK = "HIGH_RISK"

class PlanCopyrightCheckRequest(BaseModel):
    planId: int
    summaryText: str

class SimilarGame(BaseModel):
    title: str
    similarityScore: float
    overlappingElements: List[str]
    bggLink: Optional[str] = None

class PlanCopyrightCheckResponse(BaseModel):
    planId: int
    riskLevel: RiskLevel
    similarGames: List[SimilarGame]
    analysisSummary: str

class ExtractedGameData(BaseModel):
    planId: int
    title: str
    theme: str
    mechanics: List[str]
    description: str

class TranslatedGameData(BaseModel):
    planId: int
    title: str
    theme: str
    mechanics: List[str]
    description: str