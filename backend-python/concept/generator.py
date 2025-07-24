import json
from utils.openai_utils import call_openai

# 컨셉 자동 생성
def generate_concept(keywords: list[str], theme: str) -> dict:
    prompt = f"""
다음 키워드를 기반으로 보드게임 컨셉을 생성해주세요.

- 키워드: {", ".join(keywords)}
- 장르 또는 분위기: {theme}

응답은 반드시 아래 형식을 따라야 합니다.
JSON 외에는 아무 문장도 포함하지 마세요.

예시:
{{
  "concept": "우주 식민지를 배경으로 한 협동 심리전 보드게임",
  "theme": "자원 분배와 숨겨진 역할",
  "mechanism": ["턴제", "비밀투표", "협상"]
}}
"""
    response = call_openai(prompt)
    print("🔍 LLM 응답:", response)

    try:
        # 응답에서 JSON만 추출 (앞뒤에 문장이 붙을 수 있음)
        json_start = response.find('{')
        json_end = response.rfind('}') + 1
        json_text = response[json_start:json_end]

        return json.loads(json_text)
    except Exception as e:
        print("JSON 파싱 실패:", e)
        return {
            "error": "LLM 응답 파싱 실패",
            "hint": str(e),
            "raw": response
        }
