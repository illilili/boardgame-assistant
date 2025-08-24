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


# === 1) 작업 시작 API ===
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

        # 🚩 프롬프트 정제 (Meshy API는 줄바꿈/마크다운에 민감)
        clean_prompt = visual_prompt.replace("\n", " ").replace("*", "").strip()

        # 2) Preview Task 생성
        preview_payload = {
            "mode": "preview",
            "prompt": clean_prompt,
            "art_style": request.style or "realistic",
            "enable_pbr": True,
            "enable_jpg": True,
            "negative_prompt": ""
        }
        preview_resp = requests.post(
            meshy_client.base_url,
            headers=meshy_client.headers,
            json=preview_payload
        )
        if preview_resp.status_code != 200:
            logging.error(f"[Meshy] Preview 실패: {preview_resp.text}")
        preview_resp.raise_for_status()
        preview_id = preview_resp.json().get("result")
        if not preview_id:
            raise HTTPException(status_code=500, detail="Preview Task 생성 실패")

        # 3) Refine Task 생성
        refine_payload = {
            "mode": "refine",
            "preview_task_id": preview_id,
            "enable_pbr": True,
            "enable_jpg": True
        }
        refine_resp = requests.post(
            meshy_client.base_url,
            headers=meshy_client.headers,
            json=refine_payload
        )
        if refine_resp.status_code != 200:
            logging.error(f"[Meshy] Refine 실패: {refine_resp.text}")
        refine_resp.raise_for_status()
        refine_id = refine_resp.json().get("result")
        if not refine_id:
            raise HTTPException(status_code=500, detail="Refine Task 생성 실패")

        # 4) 내부 taskId 저장
        task_id = str(uuid.uuid4())
        tasks[task_id] = {
            "status": "IN_PROGRESS",
            "refine_id": refine_id,
            "content_id": request.content_id,
            "name": request.name,
            "style": request.style
        }

        # 5) 즉시 응답 (비동기)
        return {"taskId": task_id, "status": "IN_PROGRESS"}

    except Exception as e:
        logging.error(f"3D 모델 작업 시작 실패: {e}")
        raise HTTPException(status_code=500, detail=f"3D 모델 작업 시작 실패: {str(e)}")


# === 2) 상태 확인 API ===
@router.get("/api/content/generate-3d/status/{task_id}")
async def get_3d_status(task_id: str):
    task = tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="잘못된 taskId")

    try:
        refine_id = task["refine_id"]
        resp = requests.get(f"{meshy_client.base_url}/{refine_id}", headers=meshy_client.headers)
        if resp.status_code != 200:
            logging.error(f"[Meshy] 상태 확인 실패: {resp.text}")
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
