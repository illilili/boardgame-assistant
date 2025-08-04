# model3d/router.py

import os
import logging
import requests
from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from typing import Optional
from utils.s3_utils import upload_model3d_to_s3
import tempfile



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
    try:
        visual_prompt = await run_in_threadpool(
            create_visual_prompt,
            item_name=request.elementName,
            item_description=request.description,
            art_style=request.style
        )
        if not visual_prompt:
            raise HTTPException(status_code=500, detail="OpenAI 프롬프트 생성에 실패했습니다.")

        result_data = await run_in_threadpool(
            meshy_client.generate_model,
            prompt=visual_prompt,
            art_style="realistic"
        )

        if not result_data:
            raise HTTPException(status_code=500, detail="3D 모델 생성에 실패했습니다.")

        refined_url = result_data["refined_url"]
        logging.info(f"Refined URL: {refined_url}")

        if not refined_url:
            raise HTTPException(status_code=500, detail="refined_url이 유효하지 않습니다.")

        # 안전한 temp 파일 경로 생성
        temp_dir = tempfile.gettempdir()
        local_path = os.path.join(temp_dir, f"{request.planId}_{request.planElementId}.glb")
        os.makedirs(temp_dir, exist_ok=True)

        try:
            with requests.get(refined_url, stream=True) as r:
                r.raise_for_status()
                with open(local_path, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
        except Exception as e:
            logging.error(f"모델 다운로드 실패: {e}")
            raise HTTPException(status_code=500, detail=f"모델 다운로드 실패: {str(e)}")

        try:
            s3_url = upload_model3d_to_s3(local_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"S3 업로드 실패: {str(e)}")

        return Generate3DModelResponse(
            modelId=result_data["refine_id"],
            previewUrl=result_data["preview_url"],
            refinedUrl=s3_url,
            status="completed"
        )

    except Exception as e:
        logging.error(f"예상치 못한 오류: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


