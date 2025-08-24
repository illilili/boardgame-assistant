import os
import asyncio
import logging
from typing import List, Optional, Dict, Any
from openai import AsyncOpenAI
import json

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GameTranslationService:
    """OpenAI GPT-3.5-turbo를 사용한 게임 정보 번역 서비스"""
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY 환경 변수가 설정되지 않았습니다")
        
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = "gpt-3.5-turbo"
        
    async def translate_batch_categories_and_mechanics(
        self, 
        all_categories: List[str], 
        all_mechanics: List[str]
    ) -> Dict[str, str]:
        """카테고리와 메카닉을 한 번에 배치 번역 (중복 제거)"""
        if not all_categories and not all_mechanics:
            return {}
            
        try:
            # 중복 제거
            unique_categories = list(set(all_categories))
            unique_mechanics = list(set(all_mechanics))
            
            # 통합 번역 요청
            all_terms = unique_categories + unique_mechanics
            terms_str = ", ".join(all_terms)
            
            prompt = f"""
            다음은 보드게임의 카테고리와 메카닉들입니다. 각각을 한국어로 번역해주세요.
            번역 시 다음 규칙을 따라주세요:
            1. 보드게임 용어로 적절하게 번역
            2. 간결하고 이해하기 쉽게  
            3. 기존 한국 보드게임 커뮤니티에서 사용하는 용어 우선
            
            용어들: {terms_str}
            
            응답은 다음 JSON 형식으로만 해주세요:
            {{"translations": {{"원본용어1": "번역1", "원본용어2": "번역2"}}}}
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "당신은 보드게임 전문 번역가입니다. 정확하고 자연스러운 한국어로 번역해주세요."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            result_text = response.choices[0].message.content.strip()
            logger.info(f"배치 번역 응답: {result_text[:200]}...")
            
            # JSON 파싱
            try:
                result_json = json.loads(result_text)
                return result_json.get("translations", {})
            except json.JSONDecodeError as e:
                logger.error(f"배치 번역 JSON 파싱 오류: {e}")
                logger.error(f"응답 내용: {result_text}")
                return {}
                
        except Exception as e:
            logger.error(f"배치 번역 실패: {e}")
            return {}
        
    async def translate_categories(self, categories: List[str]) -> List[str]:
        """카테고리 목록을 한국어로 번역"""
        if not categories:
            return []
            
        try:
            categories_str = ", ".join(categories)
            
            prompt = f"""
            다음은 보드게임의 카테고리들입니다. 각 카테고리를 한국어로 번역해주세요.
            번역 시 다음 규칙을 따라주세요:
            1. 보드게임 용어로 적절하게 번역
            2. 간결하고 이해하기 쉽게
            3. 기존 한국 보드게임 커뮤니티에서 사용하는 용어 우선
            
            카테고리들: {categories_str}
            
            응답은 다음 JSON 형식으로만 해주세요:
            {{"translated": ["번역1", "번역2", "번역3"]}}
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "당신은 보드게임 전문 번역가입니다. 정확하고 자연스러운 한국어로 번역해주세요."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            content = response.choices[0].message.content.strip()
            logger.info(f"카테고리 번역 응답: {content}")
            
            # JSON 파싱 시도
            try:
                result = json.loads(content)
                if "translated" in result and isinstance(result["translated"], list):
                    return result["translated"]
            except json.JSONDecodeError:
                logger.error(f"JSON 파싱 실패: {content}")
            
            # JSON 파싱 실패 시 기본 처리
            return categories
            
        except Exception as e:
            logger.error(f"카테고리 번역 실패: {e}")
            return categories
    
    async def translate_mechanics(self, mechanics: List[str]) -> List[str]:
        """메카닉 목록을 한국어로 번역"""
        if not mechanics:
            return []
            
        try:
            mechanics_str = ", ".join(mechanics)
            
            prompt = f"""
            다음은 보드게임의 메카닉들입니다. 각 메카닉을 한국어로 번역해주세요.
            번역 시 다음 규칙을 따라주세요:
            1. 보드게임 메카닉 용어로 정확하게 번역
            2. 한국 보드게임 커뮤니티에서 통용되는 용어 사용
            3. 게임 시스템을 명확하게 표현
            
            메카닉들: {mechanics_str}
            
            응답은 다음 JSON 형식으로만 해주세요:
            {{"translated": ["번역1", "번역2", "번역3"]}}
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "당신은 보드게임 메카닉 전문 번역가입니다. 게임 시스템을 정확히 표현하는 한국어로 번역해주세요."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            content = response.choices[0].message.content.strip()
            logger.info(f"메카닉 번역 응답: {content}")
            
            # JSON 파싱 시도
            try:
                result = json.loads(content)
                if "translated" in result and isinstance(result["translated"], list):
                    return result["translated"]
            except json.JSONDecodeError:
                logger.error(f"JSON 파싱 실패: {content}")
            
            # JSON 파싱 실패 시 기본 처리
            return mechanics
            
        except Exception as e:
            logger.error(f"메카닉 번역 실패: {e}")
            return mechanics
    
    async def translate_description(self, description: str) -> str:
        """게임 설명을 한국어로 번역"""
        if not description or description.strip() == "":
            return "게임 설명이 제공되지 않습니다."
            
        try:
            # HTML 태그 제거 및 기본 정리
            clean_desc = self._clean_description(description)
            
            if len(clean_desc) > 1000:
                clean_desc = clean_desc[:997] + "..."
            
            prompt = f"""
            다음 보드게임 설명을 자연스러운 한국어로 번역해주세요.
            번역 시 다음 규칙을 따라주세요:
            1. 게임의 핵심 내용과 재미 요소를 잘 전달
            2. 한국 독자가 이해하기 쉽고 자연스러운 문체
            3. 보드게임 용어는 한국에서 통용되는 표현 사용
            4. 과도하게 길지 않게 요약하되 중요 정보는 포함
            
            원문: {clean_desc}
            
            한국어 번역:
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "당신은 보드게임 전문 번역가입니다. 게임의 매력을 잘 전달하는 자연스러운 한국어로 번역해주세요."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                max_tokens=800
            )
            
            translated = response.choices[0].message.content.strip()
            logger.info(f"설명 번역 완료: {len(translated)} 글자")
            
            return translated if translated else "게임 설명 번역에 실패했습니다."
            
        except Exception as e:
            logger.error(f"설명 번역 실패: {e}")
            return "게임 설명 번역에 실패했습니다."
    
    def _clean_description(self, description: str) -> str:
        """HTML 태그 제거 및 텍스트 정리"""
        import re
        
        # HTML 태그 제거
        clean_text = re.sub(r'<[^>]+>', '', description)
        
        # HTML 엔티티 치환
        clean_text = clean_text.replace('&quot;', '"')
        clean_text = clean_text.replace('&amp;', '&')
        clean_text = clean_text.replace('&lt;', '<')
        clean_text = clean_text.replace('&gt;', '>')
        clean_text = clean_text.replace('&nbsp;', ' ')
        
        # 과도한 공백 제거
        clean_text = re.sub(r'\s+', ' ', clean_text)
        clean_text = clean_text.strip()
        
        return clean_text
    
    async def translate_game_data(
        self, 
        categories: Optional[List[str]] = None,
        mechanics: Optional[List[str]] = None,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """게임 데이터 전체 번역 (병렬 처리)"""
        
        tasks = []
        
        # 번역할 항목들을 병렬로 처리
        if categories:
            tasks.append(("categories", self.translate_categories(categories)))
        
        if mechanics:
            tasks.append(("mechanics", self.translate_mechanics(mechanics)))
        
        if description:
            tasks.append(("description", self.translate_description(description)))
        
        # 병렬 실행
        results = {}
        if tasks:
            try:
                task_results = await asyncio.gather(
                    *[task[1] for task in tasks], 
                    return_exceptions=True
                )
                
                for i, (key, _) in enumerate(tasks):
                    result = task_results[i]
                    if isinstance(result, Exception):
                        logger.error(f"{key} 번역 실패: {result}")
                        # 실패 시 원본 데이터 또는 기본값 설정
                        if key == "categories" and categories:
                            results[key] = categories
                        elif key == "mechanics" and mechanics:
                            results[key] = mechanics
                        elif key == "description":
                            results[key] = "번역 실패"
                    else:
                        results[key] = result
                        
            except Exception as e:
                logger.error(f"병렬 번역 처리 실패: {e}")
                # 실패 시 원본 데이터 반환
                if categories:
                    results["categories"] = categories
                if mechanics:
                    results["mechanics"] = mechanics
                if description:
                    results["description"] = "번역 실패"
        
        return results
    
    async def translate_batch(self, games_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """여러 게임 데이터 배치 번역"""
        
        translation_tasks = []
        
        for game_data in games_data:
            task = self.translate_game_data(
                categories=game_data.get("categories"),
                mechanics=game_data.get("mechanics"),
                description=game_data.get("description")
            )
            translation_tasks.append(task)
        
        # 배치 처리 (동시 실행 수 제한)
        batch_size = 5  # 동시에 5개씩 처리
        results = []
        
        for i in range(0, len(translation_tasks), batch_size):
            batch = translation_tasks[i:i + batch_size]
            
            try:
                batch_results = await asyncio.gather(*batch, return_exceptions=True)
                results.extend(batch_results)
                
                # API 레이트 리밋 고려한 지연
                if i + batch_size < len(translation_tasks):
                    await asyncio.sleep(1)  # 1초 대기
                    
            except Exception as e:
                logger.error(f"배치 번역 실패 (배치 {i//batch_size + 1}): {e}")
                # 실패한 배치에 대해 빈 결과 추가
                results.extend([{} for _ in batch])
        
        return results