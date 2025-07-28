# -*- coding: utf-8 -*-
"""
게임 구성요소 텍스트를 입력받아 3D 모델을 생성하는 전체 로직을 담당하는 모듈.
- OpenAI: 입력 텍스트를 3D 모델링에 적합한 시각적 프롬프트로 변환합니다.
- MeshyClient: Meshy AI API와 통신하여 3D 모델의 초안 생성 및 정교화를 수행합니다.
"""

# service.py

import os
import requests
import time
import logging
from dotenv import load_dotenv
from typing import Optional, Dict, Any
from openai import OpenAI

# --- 1. 로깅 및 전역 클라이언트 설정 ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
load_dotenv()
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# --- 2. OpenAI 프롬프트 생성 기능 ---
def create_visual_prompt(item_name: str, item_description: str, art_style: str) -> Optional[str]:
    """OpenAI를 사용해 3D 모델링을 위한 시각적 묘사 프롬프트를 생성합니다."""
    logging.info(f"[OpenAI] '{item_name}'의 시각적 프롬프트 생성을 시작합니다.")
    try:
        system_prompt = (
           "You are a creative prompt engineer for a text-to-3D AI. "
           "Your task is to create a concise but detailed visual description in English for a **board game piece miniature**, "
           "based on a game item's name, its role, and desired art style. "
           "The model should be suitable as a **physical, tabletop game component,** focusing on a **clear silhouette** and recognizable features. "
           "Describe materials, shape, and key features. "
           "IMPORTANT: The entire description must be under 500 characters."
        )
        user_prompt = (
            f"Game Item Name: {item_name}\n"
            f"Item's Role/Description: {item_description}\n"
            f"Art Style: {art_style}"
        )
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        visual_prompt = response.choices[0].message.content
        logging.info(f"[OpenAI] 생성된 프롬프트: {visual_prompt}")
        return visual_prompt
    except Exception as e:
        logging.error(f"[OpenAI] 프롬프트 생성 실패: {e}")
        return None
# --- 3. Meshy AI 클라이언트 클래스  ---
class MeshyClient:
    """Meshy AI API와의 통신을 담당하는 최적화된 클라이언트 클래스."""
    def __init__(self, api_key: Optional[str]):
        if not api_key:
            raise ValueError("Meshy API 키가 .env 파일에 설정되지 않았습니다.")
        self.base_url = "https://api.meshy.ai/openapi/v2/text-to-3d"
        self.headers = {"Authorization": f"Bearer {api_key}"}

    def _poll_task_status(self, task_id: str, task_name: str) -> Optional[Dict[str, Any]]:
        """Helper 메서드: 작업 상태를 확인하고, 완료되면 결과 데이터를 반환합니다."""
        logging.info(f"[{task_name}] 작업({task_id})의 완료를 기다립니다...")
        while True:
            try:
                response = requests.get(f"{self.base_url}/{task_id}", headers=self.headers)
                response.raise_for_status()
                data = response.json()
                status = data.get("status")
                
                if status == "SUCCEEDED":
                    logging.info(f"✅ [{task_name}] 작업({task_id}) 성공!")
                    return data
                elif status == "FAILED":
                    error_msg = data.get("task_error", {}).get("message", "알 수 없는 오류")
                    logging.error(f"❌ [{task_name}] 작업({task_id}) 실패. 원인: {error_msg}")
                    return None
                
                time.sleep(10)
            except requests.exceptions.RequestException as e:
                logging.error(f"❌ [{task_name}] 상태 확인 중 오류 발생: {e}")
                return None


    # 👇 generate_model 함수를 다시 추가합니다.
    def generate_model(self, prompt: str, art_style: str = "realistic") -> Optional[Dict[str, Any]]:
        """[통합 기능] Preview와 Refine을 모두 실행하고 최종 결과 딕셔너리를 반환합니다."""
        # 1단계: Preview Task 생성
        logging.info(f"[Meshy] Preview Task 생성을 시작합니다.")
        preview_payload = {"mode": "preview", "prompt": prompt, "art_style": art_style}
        try:
            response = requests.post(self.base_url, headers=self.headers, json=preview_payload)
            response.raise_for_status()
            preview_id = response.json().get("result")
        except requests.exceptions.RequestException as e:
            logging.error(f"[Meshy] Preview Task 생성 요청 실패: {e}")
            return None
        
        preview_result = self._poll_task_status(preview_id, "Preview")
        if not preview_result: return None

        # 2단계: Refine Task 생성
        logging.info(f"[Meshy] Refine Task 생성을 시작합니다.")
        refine_payload = {"mode": "refine", "preview_task_id": preview_id}
        try:
            response = requests.post(self.base_url, headers=self.headers, json=refine_payload)
            response.raise_for_status()
            refine_id = response.json().get("result")
        except requests.exceptions.RequestException as e:
            logging.error(f"[Meshy] Refine Task 생성 요청 실패: {e}")
            return None

        refine_result = self._poll_task_status(refine_id, "Refine")
        if not refine_result: return None

        # 3단계: 최종 결과 반환
        return {
            "preview_id": preview_id,
            "refine_id": refine_id,
            "preview_url": preview_result.get("model_urls", {}).get("glb"),
            "refined_url": refine_result.get("model_urls", {}).get("glb")
        }

# --- 4. 메인 테스트 로직 ---
if __name__ == '__main__':
    meshy_client = MeshyClient(api_key=os.getenv("MESHY_API_KEY"))
    test_component = {"name": "불의 검", "description": "적에게 불타는 피해 2를 가한다.", "style": "realistic"}
    
    visual_prompt = create_visual_prompt(
        item_name=test_component["name"],
        item_description=test_component["description"],
        art_style=test_component["style"]
    )

    if visual_prompt:
        # 이 부분에서 generate_model을 정상적으로 호출할 수 있습니다.
        final_result = meshy_client.generate_model(prompt=visual_prompt, art_style=test_component["style"])
        
        if final_result:
            logging.info("--- ✅ 최종 작업 성공 ---")
            logging.info(f"  - 초안 모델 링크: {final_result.get('preview_url')}")
            logging.info(f"  - 최종 모델 링크: {final_result.get('refined_url')}")
        else:
            logging.error("--- ❌ 최종 작업 실패 ---")