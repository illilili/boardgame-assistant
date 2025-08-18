# 자동 가격 책정

이 디렉터리는 보드게임 구성품(카드, 룰북, 토큰 등) 정보를 기반으로 자동으로 제작 원가와 권장 소비자가를 산출하는 기능을 담당합니다.

## 주요 기능
- 프로젝트별 구성품 입력 시 예상 제작비, 권장가, 마진율 자동 계산

## 주요 API
- `POST /api/pricing/estimate` : 구성품 기반 자동 가격 산출

## 주요 DTO
- PricingEstimateRequest / PricingEstimateResponse

### 예시 요청/응답

#### 요청 예시
```json
POST /api/pricing/estimate
{
  "projectId": 55,
  "components": [
    { "type": "card", "quantity": 100 },
    { "type": "rulebook", "pages": 16 },
    { "type": "tokens", "quantity": 50 }
  ]
}
```
#### 응답 예시
```json
{
  "estimatedCost": 5800,
  "suggestedPrice": 12000,
  "marginRate": 0.52
}
```