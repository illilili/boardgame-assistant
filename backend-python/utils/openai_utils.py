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
