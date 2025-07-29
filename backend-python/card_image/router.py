from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from .service import generate_card_image  

router = APIRouter()

class CardText(BaseModel):
    title: str
    text: str

class CardImageRequest(BaseModel):
    game_concept: str = "중세 판타지"
    cards: List[CardText]

class CardImageResponse(BaseModel):
    image_urls: List[str]

@router.post("/api/content/generate-image", response_model=CardImageResponse)
def generate_images(request: CardImageRequest):
    urls = []
    for card in request.cards:
        image_url = generate_card_image(card.title, card.text, request.game_concept)
        urls.append(image_url)
    return {"image_urls": urls}
