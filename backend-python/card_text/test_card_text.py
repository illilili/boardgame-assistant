import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from service import generate_card_text

if __name__ == "__main__":
    title = "불의 검"
    effect = "적에게 불 속성 피해 2를 입힌다."
    concept  = "중세 판타지"

    result = generate_card_text(title, effect, concept )
    print(f"[{title}]\n→ 생성된 문구: {result}")
