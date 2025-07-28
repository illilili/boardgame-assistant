```
plan/
├── controller/
│   └── PlanController.java
│
├── dto/
│   ├── PlanComponentRequestDto.java       ← 구성 요소 요청 DTO
│   ├── PlanComponentResponseDto.java      ← 구성 요소 응답 DTO
│   ├── PlanSaveRequestDto.java            ← 기획안 저장용 DTO
│   ├── PlanSubmitRequestDto.java          ← 기획안 승인 요청용 DTO
│   ├── PlanVersionSaveRequestDto.java     ← 기획안 버전 저장용 DTO
│   └── PlanDetailResponseDto.java         ← 기획안 상세 조회 응답 DTO
추가 예정
│
├── entity/
│   ├── Plan.java                          ← 기획안 메인 엔티티
│   ├── PlanComponent.java                 ← 자유 형식의 구성 요소
│   ├── PlanConcept.java                   ← 컨셉
│   ├── PlanGoal.java                      ← 목표
│   ├── PlanRule.java                      ← 규칙
│   └── PlanVersion.java                   ← 버전 관리용 엔티티
│
├── repository/
│   ├── PlanRepository.java
│   ├── PlanComponentRepository.java
│   ├── PlanConceptRepository.java
│   ├── PlanGoalRepository.java
│   ├── PlanRuleRepository.java
│   └── PlanVersionRepository.java
│
└── service/
    └── PlanService.java

```