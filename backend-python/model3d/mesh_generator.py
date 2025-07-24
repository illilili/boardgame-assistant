# -*- coding: utf-8 -*-
"""
Meshy AI API를 사용하여 텍스트 프롬프트로부터 3D 모델을 생성하는 모듈.
1. Preview Task 생성 -> 2. Refine Task 생성 -> 3. 최종 모델 URL 반환의 과정을 수행.
"""

import os
import requests
import time
from dotenv import load_dotenv
from typing import Optional, Dict, Any

# --- 1. 설정 및 상수 정의 ---
load_dotenv()
MESHY_API_KEY = os.getenv("MESHY_API_KEY")
BASE_URL = "https://api.meshy.ai/openapi/v2/text-to-3d"
HEADERS = {
    "Authorization": f"Bearer {MESHY_API_KEY}"
}

# 다른 AI가 생성할 것으로 예상되는 텍스트 결과물 (임시 데이터)
DUMMY_GAME_COMPONENTS = [
    {
        "name": "드워프 초기 조율자 카드",
        "description": "A sturdy granite card representing the Dwarf coordinator, with a golden hammer and anvil emblem carved in the center, rugged and tough texture"
    }
]

# --- 2. 핵심 기능 함수 구현 ---

def _poll_task_status(task_id: str) -> Optional[Dict[str, Any]]:
    """Helper 함수: 지정된 ID의 작업 상태를 확인하고, 완료되면 결과 데이터를 반환합니다."""
    while True:
        try:
            response = requests.get(f"{BASE_URL}/{task_id}", headers=HEADERS)
            response.raise_for_status()  # HTTP 오류 발생 시 예외 처리
            data = response.json()
            
            status = data.get("status")
            progress = data.get("progress", 0)
            print(f"   - 작업 ID({task_id}) 상태: {status}, 진행률: {progress}%")

            if status == "SUCCEEDED":
                return data  # 성공 시 전체 데이터 반환
            elif status == "FAILED":
                error_message = data.get("task_error", {}).get("message", "알 수 없는 오류")
                print(f"❌ 작업 ID({task_id}) 실패. 원인: {error_message}")
                return None
            
            time.sleep(10)  # 10초 대기 후 다시 확인
        except requests.exceptions.RequestException as e:
            print(f"❌ 상태 확인 중 네트워크 오류 발생: {e}")
            return None

def generate_3d_model(prompt: str, art_style: str = "realistic") -> Optional[str]:
    """텍스트 프롬프트로 3D 모델을 생성하는 전체 과정을 총괄하는 메인 함수."""
    
    # 1단계: Preview Task 생성
    print(f"\n1. '{prompt}' 프롬프트로 Preview Task 생성을 시작합니다.")
    preview_payload = {"mode": "preview", "prompt": prompt, "art_style": art_style}
    
    try:
        response = requests.post(BASE_URL, headers=HEADERS, json=preview_payload)
        response.raise_for_status()
        preview_id = response.json().get("result")
        print(f"✅ Preview Task 생성 성공! ID: {preview_id}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Preview Task 생성 실패: {e}")
        return None
    
    preview_result = _poll_task_status(preview_id)
    if not preview_result: return None

    # 2단계: Refine Task 생성
    print(f"\n2. Preview ID({preview_id})로 Refine Task 생성을 시작합니다.")
    refine_payload = {"mode": "refine", "preview_task_id": preview_id}
    
    try:
        response = requests.post(BASE_URL, headers=HEADERS, json=refine_payload)
        response.raise_for_status()
        refine_id = response.json().get("result")
        print(f"✅ Refine Task 생성 성공! ID: {refine_id}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Refine Task 생성 실패: {e}")
        return None

    refine_result = _poll_task_status(refine_id)
    if not refine_result: return None

    # 3단계: 최종 결과에서 모델 URL 추출
    model_urls = refine_result.get("model_urls", {})
    final_model_url = model_urls.get("glb") # .glb 형식의 모델 URL을 가져옴
    
    print(f"\n🎉 최종 모델 생성 완료! URL: {final_model_url}")
    return final_model_url

# --- 3. 이 파일을 직접 실행했을 때의 테스트 로직 ---
if __name__ == '__main__':
    print("--- ⚔️ 임시 데이터를 사용한 3D 모델 생성 테스트를 시작합니다. ⚔️ ---")
    
    for component in DUMMY_GAME_COMPONENTS:
        component_name = component.get("name")
        prompt_text = component.get("description")

        print(f"\n{'='*60}")
        print(f">>>> [{component_name}] 모델 생성을 시도합니다...")
        
        final_url = generate_3d_model(prompt_text)

        if final_url:
            print(f">>>> ✅ [{component_name}] 최종 성공! 모델 링크: {final_url}")
        else:
            print(f">>>> ❌ [{component_name}] 최종 실패.")
        print(f"{'='*60}")

    print("\n--- 🛡️ 모든 테스트가 완료되었습니다. 🛡️ ---")