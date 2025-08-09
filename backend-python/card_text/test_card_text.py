import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from service import generate_card_text

if __name__ == "__main__":
    title = "불의 검"
    effect = "적에게 불 속성 피해 2를 입힌다."
    description = "불의 신이 깃든 전설의 검입니다."
    concept = "중세 판타지"
    storyline = "용과 마법이 지배하는 대륙에서 전설의 무기를 찾아 떠나는 여정"

    result = generate_card_text(
        name=title,
        effect=effect,
        description=description,
        theme=concept,
        storyline=storyline
    )
    print(f"[{title}]\n→ 생성된 문구: {result}")
