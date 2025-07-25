from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from .service import generate_card_text 

router = APIRouter()

class CardInfo(BaseModel):
    title: str
    effect: str

class CardTextGenerateRequest(BaseModel):
    plan_id: int
    game_concept: str 
    cards: List[CardInfo]

class CardText(BaseModel):
    title: str
    effect: str
    text: str

class CardTextGenerateResponse(BaseModel):
    generated_texts: List[CardText]

@router.post("/api/content/generate-text", response_model=CardTextGenerateResponse)
def generate_card_texts(request: CardTextGenerateRequest):
    results = []
    for card in request.cards:
        content = generate_card_text(card.title, card.effect, request.game_concept)
        results.append(CardText(title=card.title, effect=card.effect, text=content))
    return {"generated_texts": results}
