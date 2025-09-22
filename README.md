# Boardgame Assistant (BOARD.CO)

AI 기반 보드게임 기획·개발·출판 어시스턴스 플랫폼입니다.
기획자, 개발자, 퍼블리셔, 관리자의 역할을 나누어 보드게임 제작 전 과정을 효율적으로 지원합니다.
AI를 활용해 기획안 생성, 카드·룰북·3D 모델 제작, 번역 및 가격 산정까지 자동화하여, 반복 작업 부담을 줄이고 제작 효율성을 높입니다.

### 주요 기능

- 기획자: 트렌드 분석, 기획안 작성, 규칙/스토리/구성 요소 정의

- 개발자: 카드, 룰북, 3D 모델, 썸네일 자동 생성 및 관리

- 퍼블리셔: AI 기반 번역, 가격 산정, 출시 전 검수 및 파일 업로드

- 관리자: 프로젝트 승인/반려 및 전체 워크플로우 관리

### 시스템 아키텍처

- Backend (Spring Boot): 사용자/프로젝트/기획안/개발/출판 도메인 관리

- Backend (FastAPI + LangChain): AI 기반 콘텐츠 생성 (텍스트, 이미지, 3D 모델)

- Frontend (React): 사용자 인터페이스 (기획·개발·출판 워크플로우 지원)

- Database: MariaDB (정형 데이터), S3 (이미지/파일 저장)

- DevOps/Infra: Docker, AWS (EC2, S3, CloudFront), GitHub Actions

### 기술 스택

- Back-End: Java, Spring Boot, FastAPI, LangChain, OpenAI API, Meshy AI, DALL·E

- Front-End: React

- Database/Storage: MariaDB, AWS S3

---

## 설치 및 실행 가이드

### 프로젝트 클론

```bash
git clone https://github.com/illilili/boardgame-assistant.git
cd boardgame-assistant
```

---

### Python 백엔드 (FastAPI)

```bash
cd backend-python
python -m venv venv                # 가상환경 생성
source venv/Scripts/activate       # (Mac/Linux는 source venv/bin/activate)
pip install -r requirements.txt    # 필요 패키지 설치

uvicorn app:app --reload --port 8000 #FastAPI 서버 실행
```

> `.venv`는 Git에 포함되지 않으므로 반드시 직접 생성해야 합니다.

---

### Spring Boot 백엔드 (Java)

```bash
cd backend-spring
./gradlew bootRun
```

> 데이터베이스 설정은 `application.properties`에 명시되어 있으며,  
> 로컬 MariaDB 사용 시 사용자/비밀번호/포트 확인 필요

---

### React 프론트엔드

```bash
cd frontend
npm install
npm start
```

