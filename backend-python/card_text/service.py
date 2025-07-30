from utils.openai_utils import call_openai

def generate_card_text(name: str, effect: str, theme: str, storyline: str) -> str:
    game_concept = f"{theme} 컨셉의 보드게임 - {storyline}"

    prompt = (
        f"너는 보드게임 기획자야.\n\n"
        f"게임 컨셉은 다음과 같아:\n"
        f"- {game_concept}\n\n"
        f"카드 정보는 다음과 같아:\n"
        f"- 카드 이름: {name}\n"
        f"- 카드 효과: {effect}\n\n"
        f"이 정보를 바탕으로 보드게임 카드 앞면에 들어갈 문구를 작성해줘.\n"
        f"조건은 다음과 같아:\n"
        f"1. 문구는 1~2문장 이내로 짧고 명확해야 해.\n"
        f"2. 카드의 효과가 명확하게 드러나야 해.\n"
        f"3. 말투는 게임 컨셉에 어울리도록 하되, 직관적이고 기능 위주로 작성해.\n"
        f"4. 과장된 표현, 시적 표현, 중의적인 말은 피하고, 플레이어가 효과를 쉽게 이해할 수 있게 해.\n\n"
        f"예시: '차원 폭탄을 투하하여 모든 유닛에게 2의 피해를 준다.'\n\n"
    )
    return call_openai(prompt, model="gpt-3.5-turbo", temperature=0.6, max_tokens=150)

