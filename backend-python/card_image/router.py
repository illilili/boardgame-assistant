from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from .service import generate_card_image_korean  # 한글 기반 → DALL·E 이미지 생성 함수

router = APIRouter()

# 카드 정보 모델
class CardInfo(BaseModel):
    name: str         # 카드 이름
    effect: str       # 카드 효과

# 요청 바디 모델
class CardImageRequest(BaseModel):
    theme: str             # 게임 테마 (예: "SF 탐험")
    storyline: str         # 게임 배경 설명 (예: "지구 연합 탐사대가 외계 문명과 조우...")
    cards: List[CardInfo]  # 생성할 카드 리스트

# 응답 모델
class CardImageResponse(BaseModel):
    image_urls: List[str]  # 생성된 이미지 URL 리스트

# 카드 이미지 생성 API 엔드포인트
@router.post("/api/content/generate-image", response_model=CardImageResponse)
def generate_images(request: CardImageRequest):
    urls = []

    # 각 카드별 이미지 생성 요청 처리
    for card in request.cards:
        image_url = generate_card_image_korean(
            name=card.name,
            effect=card.effect,
            theme=request.theme,
            storyline=request.storyline
        )
        urls.append(image_url)

    return {"image_urls": urls}
