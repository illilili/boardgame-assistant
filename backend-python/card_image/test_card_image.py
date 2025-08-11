import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from card_image.service import generate_card_image_korean

if __name__ == "__main__":
    name = "불의 검"
    effect = "적에게 불 속성 피해 2를 입힌다."
    description = "전설 속 불꽃이 깃든 검입니다."
    theme = "중세 판타지"
    storyline = "용과 마법이 공존하는 세계에서 악의 제국과 싸우는 모험"

    image_url = generate_card_image_korean(
        name=name,
        effect=effect,
        description=description,
        theme=theme,
        storyline=storyline
    )

    print(f"\n[{name} 이미지 URL]\n→ {image_url}")
