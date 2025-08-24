from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field
from typing import Optional, Dict
import os
import logging
import requests
import uuid

from utils.s3_utils import upload_model3d_to_s3
from .service import MeshyClient, create_visual_prompt

router = APIRouter()
meshy_client = MeshyClient(api_key=os.getenv("MESHY_API_KEY"))

# 임시 메모리 저장 (실제 운영은 DB/Redis 권장)
tasks: Dict[str, dict] = {}

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


# 작업 시작 API (== preview+refine 끝까지 실행)
@router.post("/api/content/generate-3d", tags=["3D Model"])
async def start_generate_3d_model(request: Model3DGenerateRequest):
    try:
        # 1) 프롬프트 생성
        visual_prompt = await run_in_threadpool(
            create_visual_prompt,
            item_name=request.name,
            description=f"{request.description}. Theme: {request.theme}. "
                        f"Storyline: {request.storyline}. Component Info: {request.component_info}",
            theme=request.theme,
            component_info=request.component_info,
            art_style=request.style
        )
        if not visual_prompt:
            raise HTTPException(status_code=500, detail="프롬프트 생성 실패")

        # 2) MeshyClient에서 preview+refine 동기 실행
        result = meshy_client.generate_model(prompt=visual_prompt, art_style=request.style)
        if not result or not result.get("refined_url"):
            raise HTTPException(status_code=500, detail="3D 모델 생성 실패")

        # 3) GLB → S3 업로드
        s3_url = upload_model3d_to_s3_from_url(result["refined_url"], request.content_id)

        # 4) task 저장 (이미 DONE 상태)
        task_id = str(uuid.uuid4())
        tasks[task_id] = {
            "status": "DONE",
            "glbUrl": s3_url,
            "content_id": request.content_id
        }

        # 5) 최종 응답
        return {
            "taskId": task_id,
            "status": "DONE",
            "glbUrl": s3_url,
            "contentId": request.content_id
        }

    except Exception as e:
        logging.error(f"3D 모델 작업 시작 실패: {e}")
        raise HTTPException(status_code=500, detail=f"3D 모델 작업 시작 실패: {str(e)}")


# 상태 확인 API (캐시 확인용)
@router.get("/api/content/generate-3d/status/{task_id}")
async def get_3d_status(task_id: str):
    task = tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="잘못된 taskId")
    return task


# S3 업로드 헬퍼
def upload_model3d_to_s3_from_url(glb_url: str, content_id: Optional[int]) -> str:
    import tempfile
    temp_dir = tempfile.gettempdir()
    local_path = os.path.join(temp_dir, f"{content_id or uuid.uuid4()}.glb")

    with requests.get(glb_url, stream=True) as r:
        r.raise_for_status()
        with open(local_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)

    return upload_model3d_to_s3(local_path)
