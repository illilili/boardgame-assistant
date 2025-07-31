import boto3
import os
from dotenv import load_dotenv
from botocore.client import Config

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
    config=Config(
        signature_version='s3v4',
        s3={'addressing_style': 'virtual'}
    )
)

def list_s3_objects():
    response = s3_client.list_objects_v2(Bucket=AWS_S3_BUCKET)
    contents = response.get("Contents", [])
    for obj in contents:
        print("📦", obj["Key"])
    return [obj["Key"] for obj in contents]


def upload_test_file():
    local_path = "test.txt"
    s3_key = "test/test.txt"
    s3_client.upload_file(
        local_path,
        AWS_S3_BUCKET,
        s3_key,
        ExtraArgs={"ContentType": "text/plai; charset=utf-8"} # 이 줄 빼면 링크 눌렀을 때 파일 저장되는 링크로 바뀜
    )
    print(f"업로드 완료: {s3_key}")

def generate_presigned_url(key, expires_in=3600):
    url = s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": AWS_S3_BUCKET, "Key": key},
        ExpiresIn=expires_in
    )
    return url