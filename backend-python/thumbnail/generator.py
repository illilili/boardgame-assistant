import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def call_openai(prompt, model="gpt-3.5-turbo", temperature=0.7, max_tokens=1000):
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "너는 보드게임 기획자야."},
                {"role": "user", "content": prompt},
            ],
            temperature=temperature,
            max_tokens=max_tokens
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"[OpenAI Error] {e}")
        return "OpenAI 호출 실패"

def generate_thumbnail_keywords(game_plan):
    prompt = (
        "아래 보드게임 기획서를 참고해서, 썸네일 이미지 생성에 적합한 핵심 키워드 5개를 한글로, 쉼표로 구분해서 짧게 출력해줘.\n"
        f"{game_plan}"
    )
    keywords = call_openai(prompt, model="gpt-3.5-turbo", temperature=0.5, max_tokens=50)
    return keywords