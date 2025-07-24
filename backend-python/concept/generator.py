from datetime import datetime, timezone, timedelta
import random
import json
from utils.openai_utils import call_openai

def generate_concept(theme: str, player_count: str, average_weight: float) -> dict:
    prompt = f"""
다음 정보를 기반으로 보드게임 컨셉을 JSON 형식으로 생성해주세요.

- 장르 또는 분위기: {theme}
- 플레이어 수: {player_count}
- 게임 난이도: {average_weight}

응답은 반드시 아래 형식을 따라야 합니다.
JSON 외 문장은 절대 포함하지 말고, 모든 필드는 정확히 채워주세요.

예시:
{{
    "theme": "전략",
  "playerCount": "2~4명",
  "averageWeight": 3,
  "ideaText": "플레이어는 전략적인 지형을 활용해 상대를 견제하는 턴제 전투를 벌입니다.",
  "mechanics": "지역 점령, 카드 드래프트, 핸드 매니지먼트",
  "storyline": "고대 제국의 후예들이 전설의 유물을 차지하기 위해 맞붙는다."
}}
"""
    response = call_openai(prompt)
    # 터미널로그확인용
    print("LLM 응답:", response)

    try:
        json_start = response.find('{')
        json_end = response.rfind('}') + 1
        json_text = response[json_start:json_end]
        parsed = json.loads(json_text)

        # 시스템에서 직접 생성하는 값
        parsed["conceptId"] = random.randint(1000, 9999)
        parsed["planId"] = random.randint(1000, 9999)

        # KST 기준 createdAt
        kst = timezone(timedelta(hours=9))
        parsed["createdAt"] = datetime.now(kst).isoformat(timespec="seconds")

        return parsed

    except Exception as e:
        print("JSON 파싱 실패:", e)
        return {
            "error": "LLM 응답 파싱 실패",
            "hint": str(e),
            "raw": response
        }

# 재생성
def regenerate_concept(concept_id: int, feedback: str, planId: int) -> dict:
    prompt = f"""
기존 컨셉(conceptId: {concept_id})에 대해 다음 피드백을 반영해 새로운 아이디어를 제시해주세요.

- 피드백: "{feedback}"

응답은 반드시 JSON 형식으로만 반환하세요.  
모든 필드는 아래 예시처럼 완성된 내용으로 채워주세요.

예시:
{{
  "theme": "전략",
  "playerCount": "2~4명",
  "averageWeight": 2.5,
  "ideaText": "플레이어는 전략적인 지형을 활용해 상대를 견제하는 턴제 전투를 벌입니다.",
  "mechanics": "지역 점령, 카드 드래프트, 핸드 매니지먼트",
  "storyline": "고대 제국의 후예들이 전설의 유물을 차지하기 위해 맞붙는다."
}}
"""
    response = call_openai(prompt)

    try:
        # JSON 파싱 후 필드 보강
        json_start = response.find('{')
        json_end = response.rfind('}') + 1
        json_text = response[json_start:json_end]
        parsed = json.loads(json_text)

        parsed["conceptId"] = random.randint(1000, 9999)  # 새 컨셉 ID
        parsed["planId"] = planId #기존 아이디
        parsed["createdAt"] = datetime.now(timezone(timedelta(hours=9))).isoformat(timespec="seconds")

        return parsed

    except Exception as e:
        return {
            "error": "LLM 응답 파싱 실패",
            "hint": str(e),
            "raw": response
        }
    
# 컨셉 기반 요소 생성
# 컨셉 조회용 임시 데이터로(concept_store) 수정필요
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

def expand_concept(concept_id: int, focus: str, detailLevel: str) -> dict:
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

{focus}에 집중하며, {detailLevel} 수준으로 구체적으로 작성해주세요.

반드시 아래 구조의 JSON 하나로만 반환해주세요:

예시:
{{
  "interactions": ["동맹/배신", "비공개 행동"],
  "resources": ["자원 카드", "시간 토큰"],
  "flow": [
    "자원 수집",
    "행동 선택",
    "전투 또는 설득",
    "투표 및 평판 변화"
  ],
  "designTips": [
    "자원마다 희소성을 달리하여 전략성을 부여하세요.",
    "동맹 후 배신 시 보너스 or 패널티를 부여하여 심리전을 유도하세요."
  ]
}}
"""
    response = call_openai(prompt)

    try:
        # JSON 파싱 후 필드 보강
        json_start = response.find('{')
        json_end = response.rfind('}') + 1
        json_text = response[json_start:json_end]
        parsed = json.loads(json_text)

        # 혹시 키가 빈 경우
        for key in ["interactions", "resources", "flow", "designTips"]:
            if key not in parsed:
                parsed[key] = []

        return parsed

    except Exception as e:
        return {
            "error": "LLM 응답 파싱 실패",
            "hint": str(e),
            "raw": response
        }