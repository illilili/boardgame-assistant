from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from .service import generate_card_image_korean

router = APIRouter()

# 요청 바디용 모델
class CardInfo(BaseModel):
    name: str
    effect: str
    description: str  # 🔧 추가

class CardImageRequest(BaseModel):
    theme: str
    storyline: str
    cards: List[CardInfo]

# 응답 모델
class CardImageResponse(BaseModel):
    image_urls: List[str]

# API 엔드포인트
@router.post("/api/content/generate-image", response_model=CardImageResponse)
def generate_images(request: CardImageRequest):
    urls = []
    for card in request.cards:
        image_url = generate_card_image_korean(
            name=card.name,
            effect=card.effect,
            description=card.description,
            theme=request.theme,
            storyline=request.storyline
        )
        urls.append(image_url)

    return {"image_urls": urls}
