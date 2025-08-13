from thumbnail.prompt_generator import translate_to_thumbnail_prompt
from thumbnail.openai_adapter import call_dalle_image
from utils.s3_utils import upload_image_bytes_to_s3
import requests
import uuid

def generate_thumbnail_image(request) -> str:
    # 1. 한글 기획 정보 → 영어 프롬프트 생성
    translated_prompt = translate_to_thumbnail_prompt(
        title=request.projectTitle,
        theme=request.theme,
        storyline=request.storyline
    )

    # 2. 이미지 생성
    temporary_url = call_dalle_image(translated_prompt)

    # 3. 이미지 다운로드 → S3 업로드
    response = requests.get(temporary_url)
    if response.status_code != 200:
        raise Exception("이미지 다운로드 실패")

    filename = f"thumbnails/{uuid.uuid4().hex}.png"
    return upload_image_bytes_to_s3(filename, response.content)
