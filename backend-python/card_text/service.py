from utils.openai_utils import call_openai

def generate_card_text(title: str, effect: str, game_concept: str = "중세 판타지") -> str:
    prompt = (
        f"너는 보드게임 기획자야. 다음은 카드 정보야:\n\n"
        f"카드 이름: {title}\n"
        f"카드 효과: {effect}\n"
        f"게임 컨셉/말투 톤: {game_concept}\n\n"
        f"이 정보를 바탕으로 보드게임 카드 앞면에 적힐 짧은 문구를 작성해줘.\n"
        f"문구는 1~2문장 정도로 간결하고, 카드 효과가 명확히 드러나야 해.\n"
        f"게임 컨셉에 맞는 말투를 사용하되 과장하거나 시적인 표현은 피하고,\n"
        f"플레이어가 효과를 직관적으로 이해할 수 있어야 해.\n"
        f"카드 설명 예시처럼 써줘: '불의 검을 휘둘러 적에게 피해 2를 준다.'"
    )
    return call_openai(prompt, model="gpt-4", temperature=0.6, max_tokens=150)
