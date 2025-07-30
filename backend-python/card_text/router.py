from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from .service import generate_card_text  # 수정된 서비스 함수 사용

router = APIRouter()

# 카드 요청용 모델
class CardInfo(BaseModel):
    name: str
    effect: str

# 요청 바디 모델
class CardTextGenerateRequest(BaseModel):
    plan_id: int
    theme: str            # 예: "SF 탐험"
    storyline: str        # 예: "지구 연합 탐사대는 새로운 행성에서 외계 문명과 마주친다..."
    cards: List[CardInfo]

# 응답용 모델
class CardText(BaseModel):
    name: str
    effect: str
    text: str

class CardTextGenerateResponse(BaseModel):
    generated_texts: List[CardText]

# 카드 텍스트 생성 API
@router.post("/api/content/generate-text", response_model=CardTextGenerateResponse)
def generate_card_texts(request: CardTextGenerateRequest):
    results = []
    for card in request.cards:
        text = generate_card_text(
            name=card.name,
            effect=card.effect,
            theme=request.theme,
            storyline=request.storyline
        )
        results.append(CardText(name=card.name, effect=card.effect, text=text))
    return {"generated_texts": results}
