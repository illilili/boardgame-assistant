# 저작권 검사

이 디렉터리는 보드게임 콘텐츠(이미지, 텍스트 등)의 저작권 유사도 검사 기능을 담당합니다.

## 주요 기능
- 이미지/텍스트 등 콘텐츠의 저작권 유사도 검사
- 유사 콘텐츠 매칭 결과 제공
- 기획안(Plan) 저작권 유사도 및 유사 게임 분석

## 주요 API
- `POST /api/plans/copyright-plan` : 기획안(Plan) 저작권 검토
- `POST /api/content/copyright-content` : 콘텐츠(이미지 등) 저작권 검사



## 주요 DTO
- PlanCopyrightCheckRequest / PlanCopyrightCheckResponse
- ContentCopyrightCheckRequest / ContentCopyrightCheckResponse


실제 저작권 검사 로직은 서비스 구현체(CopyrightServiceImpl)에서 확장 가능합니다.

### 예시 요청/응답

#### 기획안 저작권 검토 요청 예시
```json
POST /api/plans/copyright-plan
{
  "planId": 2001
}
```
#### 기획안 저작권 검토 응답 예시
```json
{
  "planId": 2001,
  "riskLevel": "LOW",
  "similarGames": [
    {
      "title": "Time Lords: The Board Game",
      "similarityScore": 0.72,
      "overlappingElements": ["시간여행", "유물 수집", "턴 기반 자원관리"],
      "bggLink": "https://boardgamegeek.com/boardgame/123456"
    }
  ],
  "analysisSummary": "해당 기획안은 일부 인기 보드게임과 유사한 테마(시간여행, 유물 수집)를 공유하지만, 게임 방식과 구성 요소는 독창적으로 판단됩니다."
}
```
#### 콘텐츠 저작권 검토 요청 예시
```json
POST /api/content/copyright-content
{
  "type": "image",
  "content": "https://example.com/image.png"
}
```
#### 콘텐츠 저작권 검토 응답 예시
```json
{
  "similarity": 5.7,
  "isSafe": true,
  "matches": []
}
```

