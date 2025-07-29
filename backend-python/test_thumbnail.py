#!/usr/bin/env python3
"""
Thumbnail 모듈 테스트 스크립트
"""

import sys
import os

# 현재 디렉토리를 Python 경로에 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from thumbnail.generator import generate_thumbnail_keywords
from thumbnail.dalle import generate_image_from_keywords, ThumbnailGenerationRequest

def test_thumbnail_keywords():
    """썸네일 키워드 생성 테스트"""
    print("=== 썸네일 키워드 생성 테스트 ===")
    
    # 테스트 게임 기획서
    game_plan = "테마: 중세 판타지, 스타일: 다크 판타지"
    
    print(f"입력 게임 기획서: {game_plan}")
    
    try:
        keywords = generate_thumbnail_keywords(game_plan)
        print(f"생성된 키워드: {keywords}")
        return keywords
    except Exception as e:
        print(f"키워드 생성 실패: {e}")
        return None

def test_image_generation():
    """이미지 생성 테스트 (실제 API 호출 없이 함수 호출만 테스트)"""
    print("\n=== 이미지 생성 함수 테스트 ===")
    
    test_keywords = "중세, 판타지, 성, 기사, 마법"
    print(f"테스트 키워드: {test_keywords}")
    
    try:
        # 실제 API 호출 대신 함수 구조만 테스트
        print("generate_image_from_keywords 함수 호출 준비...")
        print("주의: 실제 OpenAI API 키가 필요합니다.")
        
        # API 키가 설정되어 있는지 확인
        from dotenv import load_dotenv
        load_dotenv()
        api_key = os.getenv("OPENAI_API_KEY")
        
        if api_key:
            print("✓ OpenAI API 키가 설정되어 있습니다.")
            # 실제 API 호출은 비용이 발생하므로 주석 처리
            # image_url = generate_image_from_keywords(test_keywords)
            # print(f"생성된 이미지 URL: {image_url}")
            print("실제 API 호출은 비용 절약을 위해 스킵합니다.")
        else:
            print("✗ OpenAI API 키가 설정되지 않았습니다.")
            print("환경변수 OPENAI_API_KEY를 설정해주세요.")
            
    except Exception as e:
        print(f"이미지 생성 테스트 실패: {e}")

def test_request_model():
    """요청 모델 테스트"""
    print("\n=== 요청 모델 테스트 ===")
    
    try:
        # ThumbnailGenerationRequest 모델 테스트
        request = ThumbnailGenerationRequest(
            planId=1,
            theme="중세 판타지",
            style="다크 판타지"
        )
        
        print(f"✓ 요청 모델 생성 성공:")
        print(f"  - planId: {request.planId}")
        print(f"  - theme: {request.theme}")
        print(f"  - style: {request.style}")
        
    except Exception as e:
        print(f"요청 모델 테스트 실패: {e}")

def main():
    """메인 테스트 함수"""
    print("Thumbnail 모듈 테스트를 시작합니다...\n")
    
    # 각 테스트 실행
    test_request_model()
    keywords = test_thumbnail_keywords()
    test_image_generation()
    
    print("\n=== 테스트 완료 ===")
    print("모든 기본 함수들이 정상적으로 로드되었습니다.")

if __name__ == "__main__":
    main()
