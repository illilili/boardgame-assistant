from fastapi import APIRouter
from goal.schema import GoalGenerateRequest, GoalGenerateResponse
from goal.generator import generate_goal

router = APIRouter(prefix="/api/plans")

@router.post("/generate-goal", response_model=GoalGenerateResponse)
def generate_goal_api(req: GoalGenerateRequest):
    return generate_goal(req.conceptId)