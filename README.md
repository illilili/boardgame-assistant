# Boardgame Assistant

AI 기반 보드게임 기획 및 저작권 어시스턴트 프로젝트  
- 백엔드: Java 17 / Gradle / Spring Boot 3.5.3
- 프론트엔드: React (CRA 기반)
- AI: GPT-4, LangChain, OpenAI API

- `backend-spring/`: Spring Boot 
- `backend-python/`: FastAPI + LangChain
- `frontend/`: React 기반 프론트엔드

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

