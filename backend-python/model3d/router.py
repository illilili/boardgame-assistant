from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field
from typing import Optional, Dict
import os
import logging
import requests
import uuid
import tempfile

from utils.s3_utils import upload_model3d_to_s3
from .service import MeshyClient, create_visual_prompt

router = APIRouter()
meshy_client = MeshyClient(api_key=os.getenv("MESHY_API_KEY"))

# 메모리 캐시 (운영 시 Redis/DB 권장)
tasks: Dict[str, dict] = {}

# === 요청 DTO ===
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


# === 1) 작업 시작 API (Preview까지만) ===
@router.post("/api/content/generate-3d", tags=["3D Model"])
async def start_generate_3d_model(request: Model3DGenerateRequest):
    try:
        # 1) 프롬프트 생성 (OpenAI)
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

        clean_prompt = visual_prompt.replace("\n", " ").replace("*", "").strip()

        # 2) Preview Task 생성
        preview_payload = {
            "mode": "preview",
            "prompt": clean_prompt,
            "art_style": request.style or "realistic",
            "enable_pbr": True,
            "enable_jpg": True,
        }
        preview_resp = requests.post(
            meshy_client.base_url,
            headers=meshy_client.headers,
            json=preview_payload
        )
        preview_resp.raise_for_status()
        preview_id = preview_resp.json().get("result")

        if not preview_id:
            raise HTTPException(status_code=500, detail="Preview Task 생성 실패")

        # 3) taskId 발급 (Preview까지만 저장)
        task_id = str(uuid.uuid4())
        tasks[task_id] = {
            "status": "PREVIEWING",
            "preview_id": preview_id,
            "refine_id": None,
            "content_id": request.content_id,
            "name": request.name,
            "style": request.style
        }

        return {"taskId": task_id, "status": "IN_PROGRESS"}

    except Exception as e:
        logging.error(f"3D 모델 작업 시작 실패: {e}")
        raise HTTPException(status_code=500, detail=f"3D 모델 작업 시작 실패: {str(e)}")


# === 2) 상태 확인 API (Preview → Refine → Done) ===
@router.get("/api/content/generate-3d/status/{task_id}")
async def get_3d_status(task_id: str):
    task = tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="잘못된 taskId")

    try:
        # 1) 아직 Refine 전이면 → Preview 상태 확인
        if task["refine_id"] is None:
            preview_id = task["preview_id"]
            resp = requests.get(f"{meshy_client.base_url}/{preview_id}", headers=meshy_client.headers)
            resp.raise_for_status()
            data = resp.json()
            status = data.get("status")

            if status == "SUCCEEDED":
                # Preview 끝났으면 Refine 시작
                refine_payload = {"mode": "refine", "preview_task_id": preview_id, "enable_pbr": True, "enable_jpg": True}
                refine_resp = requests.post(meshy_client.base_url, headers=meshy_client.headers, json=refine_payload)
                refine_resp.raise_for_status()
                refine_id = refine_resp.json().get("result")

                task["refine_id"] = refine_id
                task["status"] = "REFINING"
                return {"status": "IN_PROGRESS"}

            elif status == "FAILED":
                task["status"] = "FAILED"
                return {"status": "FAILED"}

            return {"status": "IN_PROGRESS"}

        # 2) Refine 상태 확인
        refine_id = task["refine_id"]
        resp = requests.get(f"{meshy_client.base_url}/{refine_id}", headers=meshy_client.headers)
        resp.raise_for_status()
        data = resp.json()
        status = data.get("status")

        if status == "SUCCEEDED":
            glb_url = data.get("model_urls", {}).get("glb")
            if not glb_url:
                task["status"] = "FAILED"
                return {"status": "FAILED"}

            # GLB 다운로드 → S3 업로드
            try:
                s3_url = upload_model3d_to_s3_from_url(glb_url, task["content_id"])
            except Exception as e:
                logging.error(f"S3 업로드 실패: {e}")
                return {"status": "UPLOAD_FAILED"}

            task["status"] = "DONE"
            task["glbUrl"] = s3_url
            return {"status": "DONE", "glbUrl": s3_url, "contentId": task["content_id"]}

        elif status == "FAILED":
            task["status"] = "FAILED"
            return {"status": "FAILED"}

        return {"status": "IN_PROGRESS"}

    except Exception as e:
        logging.error(f"상태 확인 실패: {e}")
        raise HTTPException(status_code=500, detail=f"상태 확인 실패: {str(e)}")


# === 3) GLB → S3 업로드 헬퍼 ===
def upload_model3d_to_s3_from_url(glb_url: str, content_id: Optional[int]) -> str:
    temp_dir = tempfile.gettempdir()
    local_path = os.path.join(temp_dir, f"{content_id or uuid.uuid4()}.glb")

    with requests.get(glb_url, stream=True) as r:
        r.raise_for_status()
        with open(local_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)

    return upload_model3d_to_s3(local_path)
