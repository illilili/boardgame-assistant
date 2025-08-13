import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def call_dalle_image(prompt: str, model="dall-e-3", size="1024x1024") -> str:
    try:
        response = client.images.generate(
            model=model,
            prompt=prompt,
            n=1,
            size=size
        )
        return response.data[0].url
    except Exception as e:
        print(f"[DALL·E Error] {e}")
        raise Exception("DALL·E 이미지 생성 실패")
