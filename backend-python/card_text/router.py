from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional
from .service import generate_card_text

router = APIRouter()

# 카드 정보 모델
class CardInfo(BaseModel):
    content_id: Optional[int] = Field(None, alias="contentId")
    name: str
    effect: str
    description: str

    class Config:
        populate_by_name = True  # JSON → Python으로 매핑 시 alias 허용
        validate_by_name = True  # Pydantic v2 기준 설정

# 요청 바디 모델
class CardTextGenerateRequest(BaseModel):
    theme: str
    storyline: str
    cards: List[CardInfo]

    class Config:
        validate_by_name = True  # alias 기반 필드 이름 허용

# 응답 단일 항목 모델
class CardText(BaseModel):
    content_id: Optional[int] = Field(None, alias="contentId")
    name: str
    effect: str
    text: str

    class Config:
        populate_by_name = True
        validate_by_name = True
        json_schema_extra = {
            "examples": [
                {
                    "contentId": 7,
                    "name": "미래 카드",
                    "effect": "미래 정보를 제공하며 전략적 선택을 유도함",
                    "text": "\"미래 카드는 당신에게 전략의 길을 제시합니다.\""
                }
            ]
        }

# 응답 전체 구조
class CardTextGenerateResponse(BaseModel):
    generated_texts: List[CardText]

    class Config:
        populate_by_name = True
        validate_by_name = True
        json_schema_extra = {
            "example": {
                "generated_texts": [
                    {
                        "contentId": 7,
                        "name": "미래 카드",
                        "effect": "미래 정보를 제공하며 전략적 선택을 유도함",
                        "text": "\"미래를 예견하고 전략을 세워보세요.\""
                    }
                ]
            }
        }

# API 라우터
@router.post("/api/content/generate-text", response_model=CardTextGenerateResponse, response_model_by_alias=True)
def generate_card_texts(request: CardTextGenerateRequest):
    results = []
    for card in request.cards:
        text = generate_card_text(
            name=card.name,
            effect=card.effect,
            description=card.description,
            theme=request.theme,
            storyline=request.storyline
        )
        results.append(CardText(
            content_id=card.content_id,
            name=card.name,
            effect=card.effect,
            text=text
        ))

    print("✅ FastAPI Generated Results:", [r.dict(by_alias=True) for r in results])
    print("📥 Incoming cards:", [card.dict() for card in request.cards])
    return {"generated_texts": results}
