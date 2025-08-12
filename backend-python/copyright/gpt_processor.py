import json
from openai import OpenAI
from typing import Dict, Any
from .schemas import ExtractedGameData, TranslatedGameData
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

class GameDataExtractor:
    def __init__(self):
        # OpenAI 클라이언트 초기화
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")
        self.client = OpenAI(api_key=api_key)
        
    async def extract_game_data(self, plan_id: int, summary_text: str) -> ExtractedGameData:
        """summaryText에서 구조화된 게임 데이터를 추출합니다."""
        
        prompt = f"""
다음 보드게임 기획서에서 필요한 정보를 추출해주세요.

기획서:
{summary_text}

아래 JSON 형식으로 정확히 반환해주세요:
{{
  "title": "게임 제목",
  "theme": "테마를 쉼표로 구분해서 나열 (예: 마법, 기술, 학교, 퍼즐, 협력)",
  "mechanics": ["메커닉1", "메커닉2", "메커닉3"],
  "description": "게임에 대한 상세한 설명"
}}
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "당신은 보드게임 기획서를 분석하여 구조화된 데이터를 추출하는 전문가입니다. 반드시 유효한 JSON 형식으로만 응답해주세요."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1
            )
            
            response_content = response.choices[0].message.content.strip()
            print(f"GPT 추출 응답: {response_content}")  # 디버깅용
            
            # JSON 응답 파싱 시도
            try:
                extracted_data = json.loads(response_content)
            except json.JSONDecodeError as e:
                print(f"JSON 파싱 오류: {e}")
                print(f"원본 응답: {response_content}")
                # JSON이 아닌 경우 기본값 반환
                raise Exception(f"GPT 응답이 유효한 JSON이 아닙니다: {response_content[:200]}...")
            
            return ExtractedGameData(
                planId=plan_id,
                title=extracted_data.get("title", "Unknown Game"),
                theme=extracted_data.get("theme", "게임, 보드게임"),
                mechanics=extracted_data.get("mechanics", ["턴 기반", "카드 플레이"]),
                description=extracted_data.get("description", "보드게임 설명이 없습니다.")
            )
            
        except Exception as e:
            raise Exception(f"데이터 추출 중 오류 발생: {str(e)}")

    async def translate_to_english(self, game_data: ExtractedGameData) -> TranslatedGameData:
        """추출된 게임 데이터를 영어로 번역합니다."""
        
        data_to_translate = {
            "title": game_data.title,
            "theme": game_data.theme,
            "mechanics": game_data.mechanics,
            "description": game_data.description
        }
        
        prompt = f"""
다음 보드게임 데이터를 영어로 번역해주세요. JSON 형식을 유지하면서 내용만 번역해주세요.

원본 데이터:
{json.dumps(data_to_translate, ensure_ascii=False, indent=2)}

번역 결과를 동일한 JSON 형식으로 반환해주세요.
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "당신은 보드게임 관련 내용을 정확하게 영어로 번역하는 전문 번역가입니다. 반드시 유효한 JSON 형식으로만 응답해주세요."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1
            )
            
            response_content = response.choices[0].message.content.strip()
            print(f"GPT 번역 응답: {response_content}")  # 디버깅용
            
            # JSON 응답 파싱 시도
            try:
                translated_data = json.loads(response_content)
            except json.JSONDecodeError as e:
                print(f"JSON 파싱 오류: {e}")
                print(f"원본 응답: {response_content}")
                # JSON이 아닌 경우 기본값 반환
                raise Exception(f"GPT 응답이 유효한 JSON이 아닙니다: {response_content[:200]}...")
            
            return TranslatedGameData(
                planId=game_data.planId,
                title=translated_data.get("title", game_data.title),
                theme=translated_data.get("theme", game_data.theme),
                mechanics=translated_data.get("mechanics", game_data.mechanics),
                description=translated_data.get("description", game_data.description)
            )
            
        except Exception as e:
            raise Exception(f"번역 중 오류 발생: {str(e)}")

    async def process_plan(self, plan_id: int, summary_text: str) -> TranslatedGameData:
        """전체 프로세스: 추출 + 번역"""
        extracted_data = await self.extract_game_data(plan_id, summary_text)
        translated_data = await self.translate_to_english(extracted_data)
        return translated_data