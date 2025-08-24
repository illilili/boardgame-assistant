from utils.openai_utils import call_openai

# 카드 정보와 게임 컨셉을 영어로 자연스럽게 번역하고,
# 컨셉은 짧고 간결한 키워드 스타일로 요약
from utils.openai_utils import call_openai

def translate_prompt_kor_to_eng(title_ko: str, effect_ko: str, concept_ko: str) -> dict:
    prompt = (
        f"Translate the following Korean board game item information into natural and descriptive English.\n"
        f"- Avoid using violent, harmful, magical, or aggressive terms (e.g., destroy, curse, kill, seal, explode).\n"
        f"- Instead, use soft, abstract, or metaphorical words suitable for fantasy illustrations.\n"
        f"- Do not use the word 'card' in the title. Focus on the object/item itself.\n"
        f"For the concept, return a short keyword-style phrase (e.g., 'sci-fi exploration', 'post-apocalyptic fantasy').\n\n"
        f"- 오브젝트 이름 (Object Title): {title_ko}\n"
        f"- 효과 설명 (Effect Description): {effect_ko}\n"
        f"- 게임 컨셉 (Game Concept - keep short and keyword-style): {concept_ko}\n\n"
        f"Output format:\n"
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

    result["game_concept"] = result.pop("concept", "medieval fantasy")
    return result
