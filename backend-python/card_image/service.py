from card_image.openai_adapter import call_dalle_image
from card_image.translator import translate_prompt_kor_to_eng

# 영어 프롬프트 생성 함수 (DALL·E용)
def generate_card_image_prompt(title: str, effect: str, game_concept: str) -> str:
    return (
        f"A detailed watercolor and ink fantasy illustration inspired by the concept: {effect}, "
        f"from a {game_concept} themed board game. The artwork should visually suggest the idea of '{title}'. "
        f"No text, no numbers, no UI, no card frame, no icons. Only a clean central image that could be used inside a card. "
        f"Soft lighting, painterly, richly colored, and highly detailed."
    )

# 한글 기반 요청 → 영어 번역 → 이미지 생성
def generate_card_image_korean(name: str, effect: str, theme: str, storyline: str) -> str:
    # 컨셉을 theme + storyline으로 구성
    game_concept = f"{theme} 컨셉의 보드게임 - {storyline}"
    
    # 번역 (name, effect, game_concept)
    translated = translate_prompt_kor_to_eng(name, effect, game_concept)

    # 이미지 생성
    return generate_card_image(**translated)

# 번역된 영문 프롬프트로 이미지 생성
def generate_card_image(title: str, effect: str, game_concept: str = "medieval fantasy") -> str:
    prompt = generate_card_image_prompt(title, effect, game_concept)
    return call_dalle_image(prompt)
