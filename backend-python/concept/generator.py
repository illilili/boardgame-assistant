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
