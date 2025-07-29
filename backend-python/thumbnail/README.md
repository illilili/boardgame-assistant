# Thumbnail - 썸네일 이미지 생성

## 기능 설명
- 게임 테마 기반 썸네일 생성

## 구현할 항목
- [ ] 썸네일용 짧은 키워드 생성 → 이미지 API 호출
- [ ] /api/content/generate-thumbnail API 구현

##  프로젝트 구조


src
├── thumbnail.py        # 보드게임 기획안 기반 키워드 생성 함수
├── dalle.py            # DALL·E API를 활용한 이미지 생성 로직
└── types
     └── index.py        # 타입 안전성을 위한 사용자 정의 타입 정의
 requirements.txt         # 프로젝트 의존성 목록
.env                     # 환경 변수 파일 (예: OpenAI API 키)
 README.md                # 프로젝트 설명 문서
##  설치 방법
저장소 클론

git clone <repository-url>
cd boardgame-thumbnail-generator
의존성 설치

pip install -r requirements.txt
환경 변수 설정

루트 디렉토리에 .env 파일을 생성하고 다음 내용을 추가하세요:

OPENAI_API_KEY=your_api_key_here

##  사용 방법
썸네일 키워드 생성

src/thumbnail.py의 generate_thumbnail_keywords 함수를 사용하여 보드게임 기획안에 기반한 키워드를 생성할 수 있습니다.

DALL·E를 활용한 이미지 생성

src/dalle.py의 함수를 통해 위에서 생성한 키워드를 DALL·E에 전달하여 썸네일 이미지를 생성할 수 있습니다.