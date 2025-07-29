# Thumbnail - 썸네일 이미지 생성

AI 기반 보드게임 썸네일 자동 생성 모듈

## 📋 기능 설명
- 보드게임 기획서 정보를 기반으로 썸네일 이미지 자동 생성
- OpenAI GPT를 활용한 키워드 추출
- DALL-E 3를 활용한 고품질 이미지 생성
- FastAPI 기반 REST API 제공
- Spring Boot와의 연동 지원

## ✅ 구현 완료 항목
- [x] 썸네일용 짧은 키워드 생성 함수 구현
- [x] DALL-E API를 활용한 이미지 생성 로직 구현
- [x] `/api/content/generate-thumbnail` REST API 구현
- [x] Spring Boot 연동 서비스 구현
- [x] 통합 테스트 환경 구성

## 🏗️ 프로젝트 구조

```
thumbnail/
├── __init__.py              # 모듈 초기화
├── dalle.py                 # DALL-E API 및 FastAPI 라우터
├── generator.py             # OpenAI GPT 키워드 생성 로직
├── requirements.txt         # 의존성 목록
├── README.md               # 프로젝트 문서
└── types/
    └── index.py            # 타입 정의
```

## 📡 API 명세서

### 썸네일 생성 API

**엔드포인트**: `POST /api/content/generate-thumbnail`

**요청 (ThumbnailGenerationRequest)**:
```json
{
  "planId": 1012,
  "projectTitle": "드래곤의 전설",
  "theme": "중세 판타지",
  "storyline": "용의 힘을 얻은 기사가 악의 마왕을 물리치는 모험"
}
```

**응답 (ThumbnailGenerationResponse)**:
```json
{
  "thumbnailId": 5007,
  "thumbnailUrl": "https://boardgame-ai.s3.amazonaws.com/thumbnails/5007.png"
}
```

### 필드 설명
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `planId` | int | ✅ | 기획서 ID |
| `projectTitle` | string | ❌ | 프로젝트명 |
| `theme` | string | ❌ | 게임 테마 |
| `storyline` | string | ❌ | 게임 스토리라인 |

## 🛠️ 설치 및 설정

### 1. 의존성 설치
```bash
cd backend-python
pip install -r requirements.txt
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 추가:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. 서버 실행
```bash
# FastAPI 서버 시작 (포트 8000)
uvicorn app:app --reload --port 8000
```

## 🧪 테스트 방법

### 1. Python 단독 테스트
```bash
cd backend-python
python test_new_thumbnail_spec.py
```

### 2. FastAPI 서버 테스트
```bash
# 서버 실행 후
curl -X POST "http://localhost:8000/api/content/generate-thumbnail" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": 1012,
    "projectTitle": "우주 탐험가",
    "theme": "SF",
    "storyline": "인류가 새로운 행성을 개척하는 모험"
  }'
```

### 3. Spring Boot 연동 테스트
```bash
# Spring Boot 서버 실행 후 (포트 8080)
curl -X GET "http://localhost:8080/api/test/sample-thumbnail"
```

## 🔧 핵심 함수

### `generate_thumbnail_keywords(game_plan)`
게임 기획서를 분석하여 썸네일에 적합한 키워드 5개를 생성

**파라미터**:
- `game_plan` (string): 프로젝트명, 테마, 스토리라인이 조합된 기획서 정보

**반환값**:
- 쉼표로 구분된 키워드 문자열 (예: "중세, 판타지, 기사, 용, 모험")

### `generate_image_from_keywords(keywords)`
키워드를 기반으로 DALL-E 3를 사용하여 이미지 생성

**파라미터**:
- `keywords` (string): 쉼표로 구분된 키워드

**반환값**:
- 생성된 이미지의 URL

## 🌐 Spring Boot 연동

### PythonApiService
Spring Boot에서 Python API를 호출하는 서비스 클래스

```java
@Service
public class PythonApiService {
    private static final String PYTHON_API_BASE_URL = "http://localhost:8000";
    
    public ThumbnailGenerationResponse generateThumbnail(ThumbnailGenerationRequest request) {
        // Python API 호출 로직
    }
}
```

### 테스트 엔드포인트
- `GET /api/test/python-health` - Python 서버 상태 확인
- `GET /api/test/sample-thumbnail` - 샘플 썸네일 생성
- `POST /api/test/thumbnail` - 커스텀 썸네일 생성

## 📊 사용 예시

### 1. 중세 판타지 게임
```json
{
  "planId": 1001,
  "projectTitle": "아서왕의 전설",
  "theme": "중세 판타지",
  "storyline": "원탁의 기사들과 함께 성검을 찾아 떠나는 모험"
}
```

### 2. SF 게임
```json
{
  "planId": 1002,
  "projectTitle": "갤럭시 탐험대",
  "theme": "우주 탐험",
  "storyline": "은하계 끝에서 새로운 문명을 발견하는 이야기"
}
```

### 3. 해적 모험 게임
```json
{
  "planId": 1003,
  "projectTitle": "카리브해의 보물",
  "theme": "해적 모험",
  "storyline": "전설의 보물섬을 찾아 떠나는 해적들의 모험"
}
```

## 🔍 트러블슈팅

### OpenAI API 오류
- API 키가 올바르게 설정되었는지 확인
- API 사용량 한도 확인
- 네트워크 연결 상태 확인

### Spring Boot 연동 오류
- Python 서버가 포트 8000에서 실행 중인지 확인
- CORS 설정 확인
- 방화벽 설정 확인

## 📦 의존성

- `fastapi==0.111.0` - REST API 프레임워크
- `openai==1.97.1` - OpenAI API 클라이언트
- `python-dotenv==1.0.1` - 환경 변수 관리
- `Pillow==24.0.0` - 이미지 처리
- `pydantic` - 데이터 검증

## 📝 버전 히스토리

- **v1.0** - 기본 썸네일 생성 기능
- **v1.1** - Spring Boot 연동 추가
- **v1.2** - API 스펙 업데이트 (projectTitle, storyline 필드 추가)

---

## 🚀 다음 개발 계획

- [ ] 이미지 스타일 커스터마이징 옵션 추가
- [ ] 생성된 이미지 히스토리 관리
- [ ] 배치 처리 기능 추가
- [ ] 이미지 품질 개선 알고리즘 적용