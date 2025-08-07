# Copyright - 기획안 저작권 유사도 검사

## 기능 설명
- OpenAI GPT 기반 분석
- BGG 크롤링 데이터 기반 데이터베이스 유사도 판단
- 메커니즘(45%), 설명(25%), 테마(20%), 복잡도(10%)의 다중 기준 평가
- 유사도 25% 이상 시 자동 저작권 위험
- 가장 유사한 게임과의 항목별 비교 분석 제공

## 구현할 항목
- [x] 유사도 체크 로직 구현 (checker.py)
- [x] /api/plans/copyright-plan API 구현

🏗️ 프로젝트 구조
copyright-check/
├── app.py                   # FastAPI 서버 및 REST API 엔드포인트
├── service.py               # 저작권 검사 통합 서비스 로직
├── database.py              # Faiss 벡터 데이터베이스 및 게임 데이터 관리
├── checker.py               # OpenAI GPT 기반 게임 기획서 분석기
├── judge.py                 # 25% 기준 저작권 위험도 판정 로직
├── openai_utils.py          # OpenAI API 유틸리티 함수
└── data/
    └── faiss_game_index.*   # Faiss 인덱스 파일들 (자동 생성)

🗄️ 데이터베이스 스키마


📡 API 명세서
썸네일 생성 API
엔드포인트: /api/plans/copyright-plan

요청 (ThumbnailGenerationRequest):

{
  "planId": 1012,
  "projectTitle": "드래곤의 전설",
  "theme": "중세 판타지",
  "storyline": "용의 힘을 얻은 기사가 악의 마왕을 물리치는 모험"
}
응답 (ThumbnailGenerationResponse):

{
  "thumbnailId": 5007,
  "thumbnailUrl": "https://boardgame-ai.s3.amazonaws.com/thumbnails/5007.png"
}
필드 설명
필드	타입	필수	설명
planId	int	✅	기획서 ID
projectTitle	string	❌	프로젝트명
theme	string	❌	게임 테마
storyline	string	❌	게임 스토리라인
🛠️ 설치 및 설정
1. 의존성 설치
cd backend-python
pip install -r requirements.txt
2. 환경 변수 설정
.env 파일을 생성하고 다음 내용을 추가:

OPENAI_API_KEY=your_openai_api_key_here
3. 서버 실행
# FastAPI 서버 시작 (포트 8000)
uvicorn app:app --reload --port 8000
🧪 테스트 방법
1. Python 단독 테스트
cd backend-python
python test_new_thumbnail_spec.py
2. FastAPI 서버 테스트
# 서버 실행 후




