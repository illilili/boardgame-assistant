# 콘텐츠 (룰북, 카드, 이미지, 3D 등)

이 디렉터리는 보드게임 프로젝트의 다양한 콘텐츠(룰북, 카드, 이미지, 3D 모델 등) 자동 생성 및 관리 기능을 담당합니다.

## 주요 기능
- 카드/아이템 문구 자동 생성
- 카드/아이템 이미지 자동 생성
- 3D 모델 생성
- 썸네일 이미지 생성
- 설명 스크립트 자동 생성
- 콘텐츠 저장/상세조회/제출/저작권 검토 등
- 콘텐츠 삭제

## 주요 API 예시
- `POST /api/content/generate-rulebook` : 룰북 초안 자동 생성
- `POST /api/content/generate-description-script` : 설명 스크립트 자동 생성
- `POST /api/content/generate-text` : 카드/아이템 문구 자동 생성
- `POST /api/content/generate-image` : 카드/아이템 이미지 자동 생성
- `POST /api/content/generate-3d` : 3D 모델 생성
- `POST /api/content/generate-thumbnail` : 썸네일 이미지 생성
- `POST /api/content/save` : 콘텐츠 저장
- `GET /api/content/{contentId}` : 콘텐츠 상세 조회
- `POST /api/content/submit` : 콘텐츠 제출
- `Delet /api/content/{contentId}` : 콘텐츠 삭제

## 주요 DTO 예시
- RuleGenerateRequest / RuleRegenerateRequest
- DescriptionScriptRequest / DescriptionScriptResponse
- TextGenerateRequest / TextGenerateResponse
- ImageGenerateRequest / ImageGenerateResponse
- Generate3DModelRequest / Generate3DModelResponse
- ThumbnailGenerationRequest / ThumbnailGenerationResponse
- ContentSaveRequest / ContentSaveResponse
- ContentDetailResponse
- ContentSubmitRequest / ContentSubmitResponse

각 기능별 DTO 및 서비스 구현 예시는 `/dto`, `/service` 디렉터리를 참고하세요.
