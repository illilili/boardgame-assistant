from fastapi import APIRouter, HTTPException
from .schemas import PlanCopyrightCheckRequest, PlanCopyrightCheckResponse
from .service import CopyrightService

router = APIRouter(prefix="/api/plans", tags=["plans"])

# 서비스 인스턴스 생성
copyright_service = CopyrightService()

@router.post("/copyright-plan", response_model=PlanCopyrightCheckResponse)
async def check_plan_copyright(request: PlanCopyrightCheckRequest):
    """
    보드게임 기획안의 저작권 위험도를 검사합니다.
    
    워크플로우:
    1. summaryText에서 게임 정보 추출
    2. GPT-4로 영어 번역
    3. MiniLM-L12-v2로 기존 게임과의 유사도 검사
    4. 위험도 및 유사한 게임 목록 반환
    """
    try:
        result = await copyright_service.check_plan_copyright(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"저작권 검사 중 오류 발생: {str(e)}")