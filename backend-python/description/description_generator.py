# GPT 기반 스크립트 생성 로직
from utils.openai_utils import call_openai  # 필요시 경로 확인

def generate_description_script(rulebook_text: str) -> str:
    prompt = f"""
    아래는 보드게임 룰북 내용입니다. 이를 바탕으로 유튜브 영상 대본처럼 게임을 소개하는 스크립트를 작성해 주세요.

    룰북:
    {rulebook_text}

    대본:
    """
    return call_openai(prompt)