from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from thumbnail.service import generate_thumbnail_image

router = APIRouter()

class ThumbnailGenerateRequest(BaseModel):
    contentId: int
    theme: Optional[str] = None
    storyline: Optional[str] = None
    projectTitle: Optional[str] = None

class ThumbnailGenerateResponse(BaseModel):
    contentId: int
    thumbnailUrl: str

@router.post("/api/content/generate-thumbnail", response_model=ThumbnailGenerateResponse)
def generate_thumbnail(request: ThumbnailGenerateRequest):
    thumbnail_url = generate_thumbnail_image(request)
    return ThumbnailGenerateResponse(
        contentId=request.contentId,
        thumbnailUrl=thumbnail_url
    )
