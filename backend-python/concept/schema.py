from pydantic import BaseModel
# from typing import List
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
