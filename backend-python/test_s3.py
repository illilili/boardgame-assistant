from utils.s3_utils import list_s3_objects, upload_test_file, generate_presigned_url
import boto3
import os
from dotenv import load_dotenv

load_dotenv()

def s3_test():
    s3 = boto3.client("s3")
    response = s3.list_buckets()
    return [bucket["Name"] for bucket in response["Buckets"]]

if __name__ == "__main__":
    print("🪣 S3 버킷 목록:", boto3.client("s3").list_buckets()["Buckets"])

    upload_test_file()

    print("📦 S3 버킷의 객체 목록:")
    keys = list_s3_objects()
    print(keys)

    if keys:
        presigned = generate_presigned_url(keys[0])
        print("🔗 presigned URL:", presigned)
    
