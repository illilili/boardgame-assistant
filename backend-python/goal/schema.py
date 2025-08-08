from pydantic import BaseModel
from typing import List

# dto
class GoalGenerateRequest(BaseModel):
   conceptId: int

class GoalGenerateResponse(BaseModel):
    mainGoal: str
    subGoals: List[str]
    winConditionType: str
    designNote: str