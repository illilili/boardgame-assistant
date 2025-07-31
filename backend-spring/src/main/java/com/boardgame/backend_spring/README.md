파일구조
```
backend_spring/
├── BackendSpringApplication.java
│
├── config/                    # 시큐리티 설정, CORS, WebMvcConfig 등
│
├── global/                   # 공통 응답/예외처리
│   ├── error/                # 예외 처리 핸들러, 에러 응답 포맷
│   ├── response/             # 공통 ResponseDto
│   └── util/                 # 유틸 클래스 
│
├── user/                     # 사용자 관리
│   ├── entity/               # User, Role, Company 등
│   ├── controller/
│   ├── service/
│   └── repository/
│
├── auth/                     # 회원가입, 로그인, 토큰 관리 
│   ├── controller/
│   ├── service/
│   ├── dto/
│   └── security/
│
├── project/                  # 프로젝트 (보드게임 단위)
│   ├── entity/               # Project, ProjectMember
│   ├── controller/
│   ├── service/
│   └── repository/
│
├── plan/                     # 기획안 (컨셉/룰/시뮬레이션 등)
│   ├── entity/               # Plan, Concept, Rule, Simulation
│   ├── controller/
│   ├── service/
│   └── repository/
│
├── content/                  # 콘텐츠 (룰북, 카드, 이미지, 3D 등)
│   ├── entity/               # Content
│   ├── controller/
│   ├── service/
│   └── repository/
│
├── submission/              # 제출 기록
│   ├── entity/               # Submission
│   ├── controller/
│   ├── service/
│   └── repository/
│
├── review/                   # 승인 / 반려 처리
│   ├── entity/               # Approval
│   ├── controller/
│   ├── service/
│   └── repository/
│
├── translate/                # 번역 요청/결과
│   ├── entity/               # Translation
│   ├── controller/
│   ├── service/
│   └── repository/
│
├── pricing/                  # 자동 가격 책정
│   ├── controller/
│   ├── service/
│   └── dto/
│
├── admin/                    # 관리자 권한 설정 및 대시보드
│   ├── controller/
│   ├── service/
│   └── repository/
│
├── copyright/               # 저작권 검사
│   ├── entity/               # CopyrightCheck
│   ├── controller/
│   ├── service/
│   └── repository/
│
├── regenerate/              # 재생성 요청 
│   ├── entity/               # RegenerationRequest
│   ├── controller/
│   ├── service/
│   └── repository/
```
