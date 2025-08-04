from card_image.openai_adapter import call_dalle_image
from card_image.translator import translate_prompt_kor_to_eng

import requests
import uuid
from utils.s3_utils import upload_image_bytes_to_s3

# 영어 프롬프트 생성 함수 (DALL·E용)
def generate_card_image_prompt(title: str, effect: str, game_concept: str) -> str:
    return (
        f"A single object fantasy illustration of a magical item called '{title}', "
        f"inspired by the concept: {effect}. "
        f"Theme: {game_concept}.\n\n"
        f"Do not include any text, numbers, card frame, UI, borders, labels, or symbols.\n"
        f"Do not show characters, monsters, or scenes.\n"
        f"Only draw the object itself, centered, isolated, on a soft abstract background.\n"
        f"Style: watercolor, painterly, richly colored, softly lit."
    )

# 한글 기반 요청 → 영어 번역 → 이미지 생성
def generate_card_image_korean(name: str, effect: str, description: str, theme: str, storyline: str) -> str:
    # 컨셉 구성
    game_concept = f"{theme} 컨셉의 보드게임 - {storyline}"
    effect_full = f"{effect} {description}"

    translated = translate_prompt_kor_to_eng(name, effect_full, game_concept)

    return generate_card_image(**translated)

# 영어 기반 이미지 생성
def generate_card_image(title: str, effect: str, game_concept: str = "medieval fantasy") -> str:
    prompt = generate_card_image_prompt(title, effect, game_concept)

    # 1. 일시적 DALL·E 이미지 URL 받기
    temporary_url = call_dalle_image(prompt)  # returns presigned image URL

    # 2. 해당 URL로 이미지 다운로드 (bytes)
    response = requests.get(temporary_url)
    if response.status_code != 200:
        raise Exception("이미지 다운로드 실패")

    image_bytes = response.content

    # 3. 파일 이름 설정 (중복 방지용 UUID)
    filename = f"card_images/{uuid.uuid4().hex}.png"

    # 4. S3 업로드
    return upload_image_bytes_to_s3(filename, image_bytes)
