from utils.s3_utils import list_s3_objects, upload_test_file
import boto3
import os
from dotenv import load_dotenv

load_dotenv()

def s3_test():
    s3 = boto3.client("s3")
    response = s3.list_buckets()
    return [bucket["Name"] for bucket in response["Buckets"]]

if __name__ == "__main__":
    # 버킷 목록 출력
    print("S3 버킷 목록:", s3_test())

    # 파일 업로드 및 퍼블릭 URL 출력
    uploaded_url = upload_test_file()
    print(f"퍼블릭 URL: {uploaded_url}")

    # 객체 목록 출력
    print("S3 버킷의 객체 목록:")
    keys = list_s3_objects()
    print(keys)
