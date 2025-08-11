# Concept - 컨셉/테마 생성 및 요소 확장
이 디렉터리는 보드게임 컨셉 생성 및 확장 기능을 담당합니다.  
OpenAI GPT API를 활용해 키워드와 장르 기반의 게임 기획서, 그리고 기획서의 구체적 확장안을 자동으로 생성합니다.

## 기능 설명
- 주어진 키워드 또는 기획 초기 조건에 따라 게임 컨셉/테마 자동 생성
- 확장 요청 시 관련 아이디어 요소 추가 제안

## 주요 파일

- `generator.py`  
  - `generate_concept(keyword: str, genre: str)`:  
    키워드와 장르를 입력받아 보드게임 기획서를 생성합니다.
  - `expand_concept(base_concept: str)`:  
    기존 게임 컨셉을 기반으로 플레이 흐름, 상호작용, 구성 요소 등 구체적인 확장안을 생성합니다.
  - OpenAI API 키는 `.env` 파일의 `OPENAI_API_KEY` 환경변수를 통해 관리합니다.

- `schema.py`  
  - FastAPI 요청/응답을 위한 Pydantic 모델(`ConceptRequest`, `ExpansionRequest`)을 정의합니다.

## 구현할 항목
- [o] 컨셉 생성 로직 작성 (generator.py)
- [o] 컨셉 기반 요소 제안 로직 추가
- [0] /api/plans/generate-concept API 구현
- [0] /api/plans/regenerate-concept API 구현
- [0] /api/plans/expand-concept API 구현

# boardgame-assistant/backend-python/concept

## 환경 변수

- `.env` 파일에 아래와 같이 API 키를 설정하세요:
  ```
  OPENAI_API_KEY=your_openai_api_key
  ```

## 사용 예시

FastAPI 엔드포인트에서 아래와 같이 사용됩니다:
- `/api/plans/generate-concept` : 게임 컨셉 생성
- `/api/plans/expand-concept` : 컨셉 확장

## 의존성

- `openai`
- `python-dotenv`
- `pydantic`

설치:
```
pip install openai python-dotenv pydantic
```

## 참고

- OpenAI API 사용 시 요금이 발생할 수 있습니다.
- API 키는 외부에 노출금지