import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_goal(concept_id: str) -> dict:
    # TODO: concept_id 기반 DB 연동 (현재는 하드코딩)
    concept_summary = "테마: 마법 숲 / 메커니즘: 협력 / 배경: 정령이 깨어난 세계"

    prompt = f"""
    아래 보드게임 컨셉을 바탕으로 게임의 메인 목표, 보조 목표, 승리 조건 유형을 설계해줘.

    [컨셉 요약]
    {concept_summary}

    [출력 형식]
    - 메인 목표:
    - 보조 목표:
    - 승리 조건 유형:
    """
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    return {"type": "goal", "result": response.choices[0].message.content.strip()}
