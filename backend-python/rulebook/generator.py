from utils.openai_utils import call_openai
from rulebook.schema import RulebookStructuredRequest

def generate_rulebook_text(data):
    component_lines = [
        f"- {c.title} X {c.quantity}" for c in data.components
    ] if data.components else ["- 구성품 정보 없음"]

    components_text = "\n".join(component_lines)

    prompt = f"""
너는 전문 보드게임 디자이너이자 작가야.
아래 제공된 기획 정보를 바탕으로 보드게임의 **룰북 초안**을 작성해줘.

일부 항목이 비어 있을 수도 있지만, 그런 경우에도 일반적인 보드게임 기준을 참고하여 적절한 내용으로 보완해서 채워줘**.

---

🎮 [기획 정보]
- 게임 제목: {data.title} 
- 테마: {data.theme}
- 세계관: {data.storyline}
- 게임 아이디어: {data.idea}
- 턴 구조: {data.turnStructure}
- 행동 규칙: {", ".join(data.actionRules) if data.actionRules else "없음"}
- 페널티 규칙: {", ".join(data.penaltyRules) if data.penaltyRules else "없음"}
- 승리 조건: {data.victoryCondition}
- 디자인 노트: {data.designNote}
- 구성품 목록:
{components_text}

---

출력 형식은 다음과 같아:

1. 게임 제목 – {data.title} 
2. 게임 개요 – 세계관과 게임의 동기 부여 중심 5~7줄 분량  
3. 구성품 – "카드 42장", "토큰 15개"처럼 항목 + 수량 중심  
4. 적정 연령 – 누구나 이해할 수 있는 권장 연령대 (예: 만 8세 이상)  
5. 게임 준비 – 세팅, 플레이어 준비물 등 구체적 설명  
6. 게임 규칙 – 행동, 순서, 제약 조건 등 세부 규칙 설명  
7. 게임 진행 방식 – 턴 흐름, 라운드 방식 등  
8. 승리 조건 – 어떤 조건을 만족해야 승리하는지  
9. 턴 순서 – 플레이어가 어떤 순서로 행동하는지

각 항목 앞에는 **번호와 제목을 붙이고**, 게임 제목을 제외한 항목은 모두 제목 아래에 머릿글 기호를 사용해 내용을 구분하여 작성해줘.  
각 항목은 문단으로 나눠 자연스럽고 읽기 쉽게 구성하고, 서술은 간결하고 일관성 있게 작성해줘.


단어 선택은 너무 어린아이 같지 않게, **보드게임을 처음 접하는 성인, 어린이 모두 이해할 수 있도록** 해줘.
"""
    return call_openai(prompt)