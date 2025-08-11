import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_concept(keyword: str, genre: str) -> dict:
    prompt = f"""
    보드게임을 기획하려고 해. 키워드: {keyword}, 장르: {genre}
    아래 항목을 포함한 기획서를 작성해줘:
    - 게임 제목
    - 게임 배경 설정
    - 주요 메커니즘
    - 승리 조건
    """
    res = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    return {"type": "concept", "result": res.choices[0].message.content.strip()}

def expand_concept(base_concept: str) -> dict:
    prompt = f"""
    아래 게임 컨셉을 기반으로 더 구체적인 게임 요소(예: 플레이 흐름, 상호작용, 게임의 진행 방식 등)를 제안해줘.
    [기존 컨셉]
    {base_concept}

    [요청]
    - 주요 상호작용
    - 게임 진행 구조
    - 카드나 보드 구성 요소
    """
    res = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    return {"type": "expansion", "result": res.choices[0].message.content.strip()}

