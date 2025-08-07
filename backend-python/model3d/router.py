from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field
from typing import Optional
import os
import logging
import requests
import tempfile

from utils.s3_utils import upload_model3d_to_s3
from .service import MeshyClient, create_visual_prompt

router = APIRouter()
meshy_client = MeshyClient(api_key=os.getenv("MESHY_API_KEY"))

# 요청 DTO
class Model3DGenerateRequest(BaseModel):
    content_id: Optional[int] = Field(None, alias="contentId")
    name: str
    description: str
    component_info: Optional[str] = None
    theme: str
    storyline: str
    style: str

    class Config:
        populate_by_name = True
        validate_by_name = True

# 응답 DTO
class Model3DGenerateResponse(BaseModel):
    content_id: Optional[int] = Field(None, alias="contentId")
    name: str
    preview_url: Optional[str]
    refined_url: Optional[str]
    status: str

    class Config:
        populate_by_name = True
        validate_by_name = True

# API 엔드포인트
@router.post("/api/content/generate-3d", response_model=Model3DGenerateResponse, tags=["3D Model"])
async def api_generate_3d_model(request: Model3DGenerateRequest):
    try:
        visual_prompt = await run_in_threadpool(
            create_visual_prompt,
            item_name=request.name,
            description=f"{request.description}. Theme: {request.theme}. Storyline: {request.storyline}. Component Info: {request.component_info}",
            theme=request.theme,
            component_info=request.component_info,
            art_style=request.style
        )

        if not visual_prompt:
            return Model3DGenerateResponse(
                content_id=request.content_id,
                name=request.name,
                preview_url=None,
                refined_url=None,
                status="prompt_failed"
            )

        result_data = await run_in_threadpool(
            meshy_client.generate_model,
            prompt=visual_prompt,
            art_style=request.style
        )

        if not result_data or not result_data.get("refined_url"):
            return Model3DGenerateResponse(
                content_id=request.content_id,
                name=request.name,
                preview_url=None,
                refined_url=None,
                status="generation_failed"
            )

        # refined 파일 다운로드 및 S3 업로드
        temp_dir = tempfile.gettempdir()
        local_path = os.path.join(temp_dir, f"{request.content_id}.glb")
        try:
            with requests.get(result_data["refined_url"], stream=True) as r:
                r.raise_for_status()
                with open(local_path, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
        except Exception as e:
            logging.error(f"모델 다운로드 실패: {e}")
            return Model3DGenerateResponse(
                content_id=request.content_id,
                name=request.name,
                preview_url=result_data["preview_url"],
                refined_url=None,
                status="download_failed"
            )

        try:
            s3_url = upload_model3d_to_s3(local_path)
        except Exception as e:
            logging.error(f"S3 업로드 실패: {e}")
            return Model3DGenerateResponse(
                content_id=request.content_id,
                name=request.name,
                preview_url=result_data["preview_url"],
                refined_url=None,
                status="upload_failed"
            )

        return Model3DGenerateResponse(
            content_id=request.content_id,
            name=request.name,
            preview_url=result_data["preview_url"],
            refined_url=s3_url,
            status="completed"
        )

    except Exception as e:
        logging.error(f"예상치 못한 오류: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
