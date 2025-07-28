from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from thumbnail.generator import generate_thumbnail_keywords

import os
from openai import OpenAI
from dotenv import load_dotenv
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

router = APIRouter()

# 요청 및 응답
class ThumbnailGenerationRequest(BaseModel):
    planId: int
    theme: Optional[str] = None
    style: Optional[str] = None

class ThumbnailGenerationResponse(BaseModel):
    thumbnailId: int
    thumbnailUrl: str

@router.post("/api/content/generate-thumbnail", response_model=ThumbnailGenerationResponse)
def generate_thumbnail(req: ThumbnailGenerationRequest):
    game_plan = f"테마: {req.theme or ''}, 스타일: {req.style or ''}"
    keywords = generate_thumbnail_keywords(game_plan)
    image_url = generate_image_from_keywords(keywords)

    # 썸네일 ID 및 URL 생성 예시
    thumbnail_id = req.planId + 3995
    thumbnail_url = f"https://boardgame-ai.s3.amazonaws.com/thumbnails/{thumbnail_id}.png"

    return ThumbnailGenerationResponse(
        thumbnailId=thumbnail_id,
        thumbnailUrl=thumbnail_url
    )

def generate_image_from_keywords(keywords, model="dall-e-3", size="1024x1024"):
    prompt = f"키워드를 기반으로 보드게임 대표 이미지를 생성해줘: {keywords}"
    try:
        response = client.images.generate(
            model=model,
            prompt=prompt,
            n=1,
            size=size
        )
        image_url = response.data[0].url
        return image_url
    except Exception as e:
        print(f"[DALL·E Error] {e}")
        return None
