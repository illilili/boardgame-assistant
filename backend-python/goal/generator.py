import json
from utils.openai_utils import call_openai

#임시 데이터로(concept_store) 수정필요
concept_store = {
    5566: {
        "theme": "요리경쟁",
        "playerCount": "2명",
        "averageWeight": 2.3,
        "ideaText": "플레이어는 주어진 재료를 활용하여 레시피를 완성하고 심사위원들의 평가를 받는 요리 대회를 펼칩니다.",
        "mechanics": "재료 수집, 레시피 완성, 심사 평가",
        "storyline": "세계적인 요리 대회에 참가한 플레이어들이 최고의 요리를 만들어서 우승을 차지하기 위해 경쟁합니다."
    }
}

def generate_goal(concept_id: int) -> dict:
    # 컨셉 조회
    concept_data = concept_store.get(concept_id)
    if concept_data is None:
        return {
            "error": "존재하지 않는 conceptId입니다.",
            "hint": f"conceptId {concept_id} 에 해당하는 컨셉이 없습니다."
        }
    
    prompt = f"""
컨셉 정보를 기반으로 보드게임의 상세 설계 요소를 생성해주세요.

컨셉 정보:
- 테마: {concept_data['theme']}
- 아이디어: {concept_data['ideaText']}
- 메커닉: {concept_data['mechanics']}
- 스토리라인: {concept_data['storyline']}


응답은 반드시 아래 형식을 따라야 합니다.
JSON 외에는 아무 문장도 포함하지 마세요.

예시:
{{
  "mainGoal": "플레이어는 유물을 3개 먼저 수집하는 팀이 승리합니다.",
  "subGoals": [
    "매 턴 자원을 일정량 모으면 보너스 점수 획득",
    "특정 지역을 2턴 연속 점령 시 보너스 카드 획득"
  ],
  "winConditionType": "목표 달성형",  // or 생존형, 점수 경쟁형 등
  "designNote": "초보자도 쉽게 이해할 수 있도록 단계별 보조 목표를 통해 자연스럽게 메인 목표로 유도합니다."
}}
"""
    response = call_openai(prompt)
    # print("LLM 응답:", response)

    try:
        # 응답에서 JSON만 추출 (앞뒤에 문장이 붙을 수 있음)
        json_start = response.find('{')
        json_end = response.rfind('}') + 1
        json_text = response[json_start:json_end]
        parsed = json.loads(json_text)

        #키가 빈 경우
        parsed.setdefault("mainGoal", "")
        parsed.setdefault("subGoals", [])
        parsed.setdefault("winConditionType", "")
        parsed.setdefault("designNote", "")

        return json.loads(json_text)
    
    except Exception as e:
        print("JSON 파싱 실패:", e)
        return {
            "error": "LLM 응답 파싱 실패",
            "hint": str(e),
            "raw": response
        }