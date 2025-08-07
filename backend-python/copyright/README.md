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






