from card_image.openai_adapter import call_dalle_image
from card_image.translator import translate_prompt_kor_to_eng

def generate_card_image_prompt(title: str, effect: str, game_concept: str = "medieval fantasy") -> str:
    return (
        f"An illustration of '{title}', visually representing the concept: {effect}. "
        f"No text, no numbers, no letters, no icons, no borders, no card frame, no UI elements. "
        f"Only the central fantasy artwork. "
        f"Drawn in hand-painted, ink and watercolor illustration style. "
        f"Soft lighting, colorful, highly detailed. Style: {game_concept}."
    )

def generate_card_image_korean(title_ko: str, effect_ko: str, concept_ko: str = "중세 판타지") -> str:
    translated = translate_prompt_kor_to_eng(title_ko, effect_ko, concept_ko)
    return generate_card_image(**translated)

def generate_card_image(title: str, effect: str, game_concept: str = "medieval fantasy") -> str:
    prompt = generate_card_image_prompt(title, effect, game_concept)
    return call_dalle_image(prompt)