import boto3
import os
import io
from dotenv import load_dotenv
from botocore.client import Config
import tempfile
from pathlib import Path
from uuid import uuid4

# .env 로드
load_dotenv()

# 환경 변수 로드
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")
AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET")

# S3 클라이언트 초기화
s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION,
    config=Config(signature_version='s3v4')
)

# 모든 S3 객체 목록 조회
def list_s3_objects():
    response = s3_client.list_objects_v2(Bucket=AWS_S3_BUCKET)
    contents = response.get("Contents", [])
    for obj in contents:
        print("📦", obj["Key"])
    return [obj["Key"] for obj in contents]

# 파일 업로드 함수
def upload_file_to_s3(local_path: str, s3_key: str, content_type: str = "application/octet-stream") -> str:
    """
    Args:
        local_path: 업로드할 로컬 파일 경로
        s3_key: S3 내부에 저장될 key (ex. thumbnails/thumbnail_123.png)
        content_type: MIME 타입 지정 (기본값은 binary)

    Returns:
        퍼블릭 URL (https://...s3.amazonaws.com/...)
    """
    s3_client.upload_file(
        Filename=local_path,
        Bucket=AWS_S3_BUCKET,
        Key=s3_key,
        ExtraArgs={"ContentType": content_type}
    )

    public_url = f"https://{AWS_S3_BUCKET}.s3.amazonaws.com/{s3_key}"
    return public_url

# presigned URL 생성 (제한 시간 있음)
def generate_presigned_url(key: str, expires_in: int = 3600) -> str:
    url = s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": AWS_S3_BUCKET, "Key": key},
        ExpiresIn=expires_in
    )
    return url

def upload_image_bytes_to_s3(key: str, image_bytes: bytes) -> str:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
        tmp.write(image_bytes)
        tmp.flush()
        local_path = tmp.name  # 실제 파일 경로

    # 실제 업로드 (upload_file을 재사용)
    return upload_file_to_s3(local_path, s3_key=key, content_type="image/png")


def upload_model3d_to_s3(local_path: str) -> str:
    file_name = os.path.basename(local_path)
    s3_key = f"model3d/{uuid4().hex}_{file_name}"
    return upload_file_to_s3(local_path, s3_key=s3_key, content_type="model/gltf-binary")