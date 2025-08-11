# 번역 요청/결과

이 디렉터리는 보드게임 콘텐츠의 다국어 번역 요청, 번역 결과 조회, 번역 결과 검토 기능을 담당합니다.

## 주요 기능
- 번역 요청(다국어)
- 번역 결과 상세 조회
- 번역 결과 검토(승인/반려 및 피드백)

## 주요 API
- `POST /api/translate/request` : 번역 요청
- `GET /api/translate/{contentId}` : 번역 결과 상세 조회
- `POST /api/translate/review` : 번역 결과 검토

## 주요 DTO
- TranslationRequest / TranslationResponse
- TranslateResultResponse
- TranslationReviewRequest / TranslationReviewResponse

### 예시 요청/응답

#### 번역 요청 예시
```json
POST /api/translate/request
{
  "contentId": 99,
  "targetLanguage": "en"
}
```
#### 번역 요청 응답 예시
```json
{
  "translatedContentId": 155,
  "status": "pending_review"
}
```

#### 번역 결과 상세 조회 예시
```json
GET /api/translate/89
{
  "contentId": 89,
  "originalText": "당신은 이 카드를 사용해 턴을 건너뛸 수 있습니다.",
  "translatedTexts": [
    { "language": "en", "text": "You can skip a turn using this card." },
    { "language": "ja", "text": "このカードを使ってターンをスキップできます。" }
  ]
}
```

#### 번역 결과 검토 예시
```json
POST /api/translate/review
{
  "translatedContentId": 155,
  "result": "reject",
  "feedback": "일본어 표현이 너무 직역됨. 자연스럽게 바꿔주세요."
}
```
#### 번역 결과 검토 응답 예시
```json
{
  "translatedContentId": 155,
  "status": "rejected"
}
```
