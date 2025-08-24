# -*- coding: utf-8 -*-
"""
게임 구성요소 텍스트를 입력받아 3D 모델을 생성하는 전체 로직을 담당하는 모듈.
- OpenAI: 입력 텍스트를 3D 모델링에 적합한 시각적 프롬프트로 변환합니다.
- MeshyClient: Meshy AI API와의 기본 통신 정보를 보관합니다.
"""

import os
import logging
from dotenv import load_dotenv
from typing import Optional
from openai import OpenAI

# --- 1. 로깅 및 전역 설정 ---
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
load_dotenv()
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# --- 2. OpenAI 프롬프트 생성 기능 ---
def create_visual_prompt(
    item_name: str,
    description: str,
    theme: Optional[str],
    component_info: Optional[str],
    art_style: str
) -> Optional[str]:
    """
    OpenAI를 사용해 3D 모델링을 위한 시각적 묘사 프롬프트를 생성합니다.
    - 아이템 이름, 설명, 테마, 컴포넌트 정보를 받아 500자 이하의 영어 설명으로 변환.
    """
    logging.info(f"[OpenAI] '{item_name}' 의 시각적 프롬프트 생성을 시작합니다.")
    try:
        system_prompt = (
            "You are an expert board game component designer, crafting prompts for a text-to-3D generator. "
            "Your goal is to translate a game item's concept into a vivid and plausible 3D model description in English. "
            "The 'Game Item Name' you receive will often include the component type (e.g., 'Dark Knight Player Marker', 'Crystal Resource Token'). "
            "**You MUST identify the component type from the name and adapt the 3D model's structure accordingly:** "
            "- If the name includes **'Player Marker'** or **'Unit Miniature'**, the model must have a **flat circular base** to stand on the board. "
            "- If the name includes **'Resource Token'**, it should be a **small, easy-to-handle, and possibly stackable object.** "
            "Focus on a clear silhouette suitable for a tabletop game. The entire description must be under 500 characters."
        )

        full_description = f"{description}. Theme: {theme or 'None'}. Component Info: {component_info or 'N/A'}"

        user_prompt = (
            f"Game Item Name: {item_name}\n"
            f"Item's Role/Description: {full_description}\n"
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


# --- 3. Meshy AI 클라이언트 클래스 ---
class MeshyClient:
    """
    Meshy AI API와의 통신 정보를 보관하는 클라이언트 클래스.
    - 실제 요청/응답 로직은 router_model3d.py에서 담당.
    """
    def __init__(self, api_key: Optional[str]):
        if not api_key:
            raise ValueError("Meshy API 키가 .env 파일에 설정되지 않았습니다.")
        self.base_url = "https://api.meshy.ai/openapi/v2/text-to-3d"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
