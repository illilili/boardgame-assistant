from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def call_dalle_image(prompt: str) -> str:
    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            n=1,
            size="1024x1024",
            quality="standard",
            style="vivid"
        )
        return response.data[0].url
    except Exception as e:
        print(f"[DALL·E Error] {e}")
        return "이미지 생성 실패"
