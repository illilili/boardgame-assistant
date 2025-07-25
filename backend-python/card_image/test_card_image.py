import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from service import generate_card_image_korean

if __name__ == "__main__":
    title = "불의 검"
    effect = "적에게 불 속성 피해 2를 입힌다."
    game_concept = "중세 판타지"

    image_url = generate_card_image_korean(title, effect, game_concept)
    print(f"\n[{title} 이미지 URL]\n→ {image_url}")
