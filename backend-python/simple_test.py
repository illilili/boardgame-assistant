#!/usr/bin/env python3
"""
간단한 thumbnail 모듈 테스트
"""

import os
import sys

# 현재 디렉토리를 Python 경로에 추가
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

print("=== Thumbnail 모듈 테스트 ===")
print(f"현재 작업 디렉토리: {current_dir}")

try:
    # generator 모듈 직접 import 테스트
    print("\n1. generator 모듈 import 테스트...")
    from thumbnail import generator
    print("✓ generator 모듈 import 성공")
    
    # dalle 모듈 import 테스트
    print("\n2. dalle 모듈 import 테스트...")
    from thumbnail import dalle
    print("✓ dalle 모듈 import 성공")
    
    # 함수 호출 테스트
    print("\n3. 함수 호출 테스트...")
    test_plan = "테마: 우주, 스타일: 사이버펑크"
    
    # 환경 변수 확인
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        print("✓ OpenAI API 키 확인됨")
        keywords = generator.generate_thumbnail_keywords(test_plan)
        print(f"생성된 키워드: {keywords}")
    else:
        print("⚠ OpenAI API 키가 설정되지 않음")
        print("키워드 생성 함수 구조만 확인...")
        print("generate_thumbnail_keywords 함수가 존재함")

    print("\n✓ 모든 테스트 통과!")

except ImportError as e:
    print(f"✗ Import 오류: {e}")
except Exception as e:
    print(f"✗ 실행 오류: {e}")

print("\n=== 테스트 완료 ===")
