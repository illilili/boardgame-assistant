from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional
from .service import generate_card_image_korean

router = APIRouter()

# 단일 카드 정보
class CardInfo(BaseModel):
    content_id: Optional[int] = Field(None, alias="contentId")
    name: str
    effect: str
    description: str

    class Config:
        populate_by_name = True
        validate_by_name = True

# 요청 바디 모델
class CardImageGenerateRequest(BaseModel):
    theme: str
    storyline: str
    cards: List[CardInfo]

    class Config:
        validate_by_name = True

# 응답 단일 항목
class CardImage(BaseModel):
    content_id: Optional[int] = Field(None, alias="contentId")
    image_url: str = Field(..., alias="imageUrl")

    class Config:
        populate_by_name = True
        validate_by_name = True

# 응답 전체 구조
class CardImageGenerateResponse(BaseModel):
    generated_images: List[CardImage]

    class Config:
        populate_by_name = True
        validate_by_name = True
        json_schema_extra = {
            "example": {
                "generated_images": [
                    {
                        "contentId": 7,
                        "imageUrl": "https://boardgame-assistant.s3.amazonaws.com/card_images/abc123.png"
                    }
                ]
            }
        }

# 라우터 등록
@router.post("/api/content/generate-image", response_model=CardImageGenerateResponse, response_model_by_alias=True)
def generate_card_images(request: CardImageGenerateRequest):
    results = []
    for card in request.cards:
        image_url = generate_card_image_korean(
            name=card.name,
            effect=card.effect,
            description=card.description,
            theme=request.theme,
            storyline=request.storyline
        )
        results.append(CardImage(
            content_id=card.content_id,
            image_url=image_url
        ))

    print("✅ FastAPI Generated Images:", [r.dict(by_alias=True) for r in results])
    return {"generated_images": results}
