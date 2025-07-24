from pydantic import BaseModel
from typing import List
from datetime import datetime

# dto
class ConceptGenerateRequest(BaseModel):
    theme: str
    playerCount: str
    averageWeight: float

class ConceptGenerateResponse(BaseModel):
    conceptId: int
    planId: int
    theme: str
    playerCount: str
    averageWeight: float
    ideaText: str
    mechanics: str
    storyline: str
    createdAt: datetime

# 재생성
class ConceptRegenerateRequest(BaseModel):
    conceptId: int
    planId: int
    feedback: str

# 컨셉기반요소생성
class ConceptExpansionRequest(BaseModel):
    conceptId: int
    focus: str
    detailLevel: str

class ConceptExpansionResponse(BaseModel):
    interactions: List[str]
    resources: List[str]
    flow: List[str]
    designTips: List[str]
