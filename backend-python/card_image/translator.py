from utils.openai_utils import call_openai

def translate_prompt_kor_to_eng(title_ko: str, effect_ko: str, concept_ko: str = "중세 판타지") -> dict:
    prompt = (
        f"보드게임 카드 일러스트 생성을 위해 다음 정보를 영어로 자연스럽고 묘사적으로 번역해줘.\n"
        f"- 카드 이름: {title_ko}\n"
        f"- 카드 효과: {effect_ko}\n"
        f"- 게임 컨셉: {concept_ko}\n\n"
        f"각 항목을 아래 형식에 맞춰 영어로 출력해줘:\n"
        f"- title: ...\n"
        f"- effect: ...\n"
        f"- concept: ..."
    )
    response = call_openai(prompt, model="gpt-4")
    
    lines = response.strip().split("\n")
    result = {}
    for line in lines:
        if ":" in line:
            key, value = line.split(":", 1)
            key = key.strip().lstrip("-").strip().lower()
            result[key] = value.strip()

    # key 이름을 generate_card_image()에 맞게 통일
    result["game_concept"] = result.pop("concept", "medieval fantasy")
    return result
