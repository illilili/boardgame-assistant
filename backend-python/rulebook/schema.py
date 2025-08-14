from pydantic import BaseModel
from typing import List
from typing import Optional

class ComponentDto(BaseModel):
    type: str
    title: str
    quantity: str

class RulebookStructuredRequest(BaseModel):
    planId: int
    title: str
    contentId: int
    theme: str
    storyline: str
    idea: str
    turnStructure: str
    victoryCondition: str
    actionRules: List[str]
    penaltyRules: List[str]
    designNote: Optional[str] = None 
    components: List[ComponentDto]

class RulebookTextResponse(BaseModel):
    contentId: int
    rulebookText: str

