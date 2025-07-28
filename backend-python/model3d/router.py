# model3d/router.py

import os
from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool # 비동기 처리를 위해 import
from pydantic import BaseModel
from typing import Optional


# mesh_generator 모듈에서 핵심 기능들을 가져옵니다.
from .service import MeshyClient, create_visual_prompt

# --- 1. 라우터 및 클라이언트 초기화 ---
router = APIRouter()

meshy_client = MeshyClient(api_key=os.getenv("MESHY_API_KEY"))


# --- 2. API 데이터 형식(DTO) 정의 ---

# Generate3DModelRequest DTO
class Generate3DModelRequest(BaseModel):
    planId: int
    planElementId: int
    elementName: str
    description: str  # DTO에 description으로 되어있어 role 대신 사용
    style: str

# Generate3DModelResponse DTO
class Generate3DModelResponse(BaseModel):
    modelId: str  # Meshy Task ID는 문자열
    previewUrl: Optional[str]
    refinedUrl: Optional[str]
    status: str


# --- API 엔드포인트 구현 (최적화 버전) ---
@router.post("/generate-3d", response_model=Generate3DModelResponse, tags=["3D Model"])
async def api_generate_3d_model(request: Generate3DModelRequest):
    """
    (최적화) 시간이 오래 걸리는 작업을 별도 스레드에서 처리하여 서버 블로킹을 방지합니다.
    """
    try:
        # 1단계: OpenAI 프롬프트 생성 (별도 스레드에서 실행)
        visual_prompt = await run_in_threadpool(
            create_visual_prompt,
            item_name=request.elementName,
            item_description=request.description,
            art_style=request.style
        )
        if not visual_prompt:
            raise HTTPException(status_code=500, detail="OpenAI 프롬프트 생성에 실패했습니다.")

        # 2단계: Meshy AI 모델링 프로세스 실행 (별도 스레드에서 실행)
        result_data = await run_in_threadpool(
            meshy_client.generate_model,
            prompt=visual_prompt,
            art_style=request.style
        )
        
        if result_data:
            return Generate3DModelResponse(
                modelId=result_data["refine_id"],
                previewUrl=result_data["preview_url"],
                refinedUrl=result_data["refined_url"],
                status="completed"
            )
        else:
            raise HTTPException(status_code=500, detail="3D 모델 생성에 실패했습니다.")

    except Exception as e:
        # HTTPException이 아닌 다른 예외 발생 시 처리
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

       
