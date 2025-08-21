"""
가격 예측 라우터 (Spring이 호출)
- POST /api/ai-pricing/estimate
- 입력: { "planId": int, "planText": str }
- 출력: { "planId": int, "predicted_price": "$xx.xx", "kor_price": "xx,xxx원" }
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
import re, json, joblib, numpy as np, pandas as pd
from typing import Optional, Dict

router = APIRouter(prefix="/api/ai-pricing", tags=["AI Pricing"])

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "price_predictor.pkl"
DICT_PATH = BASE_DIR / "models" / "feature_avg_dicts.pkl"

if not MODEL_PATH.exists() or not DICT_PATH.exists():
    raise RuntimeError("모델 파일이 없습니다. 먼저 `python -m pricing.model_train` 실행하세요.")

model = joblib.load(MODEL_PATH)
feature_avg = joblib.load(DICT_PATH)  # {'cat_avg':..., 'type_avg':...}

# ComponentAnalysis 클래스를 먼저 정의
class ComponentAnalysis(BaseModel):
    totalCards: Optional[int] = None
    totalTokens: Optional[int] = None
    totalDice: Optional[int] = None
    totalBoards: Optional[int] = None
    totalComponents: Optional[int] = None
    componentBreakdown: Optional[Dict[str, int]] = None

class PlanPriceRequest(BaseModel):
    planId: int
    planText: str
    componentAnalysis: Optional[ComponentAnalysis] = None

@router.post("/estimate")
async def estimate_price(req: PlanPriceRequest):
    # --- 기획서 텍스트에서 실제 정보 추출하여 AI 모델 입력값 생성 ---
    
    plan_text = req.planText.lower() if req.planText else ""
    
    # 디버깅을 위한 플랜 텍스트 로깅
    print(f"=== 플랜 텍스트 분석 시작 ===")
    print(f"Plan ID: {req.planId}")
    print(f"원본 플랜 텍스트 길이: {len(req.planText) if req.planText else 0}")
    print(f"처리된 플랜 텍스트 (처음 200자): {plan_text[:200]}")
    
    # 구성품 분석 정보 사용
    component_count = 0
    component_details = {}
    
    if req.componentAnalysis and req.componentAnalysis.totalComponents:
        print(f"=== Spring 백엔드에서 전달받은 구성품 분석 정보 사용 ===")
        print(f"총 구성품: {req.componentAnalysis.totalComponents}개")
        print(f"총 카드: {req.componentAnalysis.totalCards}장")
        print(f"총 토큰: {req.componentAnalysis.totalTokens}개")
        print(f"총 주사위: {req.componentAnalysis.totalDice}개")
        print(f"총 보드: {req.componentAnalysis.totalBoards}개")
        print(f"구성품 상세: {req.componentAnalysis.componentBreakdown}")
        
        # 실제 구성품 수량 사용
        component_count = req.componentAnalysis.totalComponents
        
        # 구성품별 상세 정보 구성
        if req.componentAnalysis.totalCards:
            component_details['카드'] = req.componentAnalysis.totalCards
        if req.componentAnalysis.totalTokens:
            component_details['토큰'] = req.componentAnalysis.totalTokens
        if req.componentAnalysis.totalDice:
            component_details['주사위'] = req.componentAnalysis.totalDice
        if req.componentAnalysis.totalBoards:
            component_details['보드'] = req.componentAnalysis.totalBoards
            
        # 기타 구성품들도 추가
        if req.componentAnalysis.componentBreakdown:
            for name, count in req.componentAnalysis.componentBreakdown.items():
                if name not in ['카드', '토큰', '주사위', '보드']:
                    component_details[name] = count
                    print(f"  - 기타 구성품 '{name}': {count}개")
        
        print(f"실제 구성품 분석 결과: {component_details}")
        print(f"최종 구성품 개수: {component_count}")
        
    else:
        print(f"=== 구성품 분석 정보가 없음 - 기본값 사용 ===")
        # 기본값 설정
        component_count = 1
        component_details = {'기본': 1}
        print(f"기본 구성품 개수: {component_count}")
    
    # 2. 게임 난이도 추정 (텍스트 내용 기반) - AI 모델 입력용
    avg_weight = 2.0  # 기본값 (1-5 스케일)
    
    # 게임 테마별 난이도 조정
    if '역사' in plan_text and '문명' in plan_text:
        avg_weight = 4.5  # 역사/문명 게임은 매우 복잡
        print(f"  -> 역사/문명 게임 감지: 난이도 4.5 설정")
    elif '커피' in plan_text and '카드' in plan_text:
        avg_weight = 2.5  # 커피 카드 게임은 중간 난이도
        print(f"  -> 커피 카드 게임 감지: 난이도 2.5 설정")
    elif any(word in plan_text for word in ['복잡', '전략', '전술', '계획', '시뮬레이션', '경제']):
        avg_weight = 4.0
        print(f"  -> 전략/복잡 게임 감지: 난이도 4.0 설정")
    elif any(word in plan_text for word in ['간단', '가족', '파티', '빠른', '쉬운', '교육']):
        avg_weight = 1.5
        print(f"  -> 가족/파티 게임 감지: 난이도 1.5 설정")
    elif any(word in plan_text for word in ['중간', '보통', '일반']):
        avg_weight = 2.5
        print(f"  -> 중간 난이도 게임: 난이도 2.5 설정")
    else:
        print(f"  -> 기본 난이도: 2.0 설정")
    
    # 3. 최소 연령 추정 - AI 모델 입력용
    min_age = 4  # 기본값
    
    # 게임 테마별 연령 조정
    if '역사' in plan_text and '문명' in plan_text:
        min_age = 18.0  # 역사/문명 게임은 성인용
        print(f"  -> 역사/문명 게임 감지: 최소 연령 18세 설정")
    elif '커피' in plan_text and '카드' in plan_text:
        min_age = 12.0  # 커피 카드 게임은 청소년용
        print(f"  -> 커피 카드 게임 감지: 최소 연령 12세 설정")
    elif any(word in plan_text for word in ['성인', '어른', '전략', '복잡', '전술']):
        min_age = 16.0
        print(f"  -> 성인 게임 감지: 최소 연령 16세 설정")
    elif any(word in plan_text for word in ['가족', '아이', '어린이', '유아', '교육']):
        min_age = 4.0
        print(f"  -> 가족/어린이 게임 감지: 최소 연령 4세 설정")
    elif any(word in plan_text for word in ['청소년', '중학생', '고등학생']):
        min_age = 12.0
        print(f"  -> 청소년 게임 감지: 최소 연령 12세 설정")
    else:
        print(f"  -> 기본 최소 연령: 4세 설정")
    
    # 4. 카테고리별 평균 가격 추출 (학습된 모델의 feature_avg 사용)
    print(f"=== 학습된 모델 특성 활용 ===")
    print(f"사용 가능한 카테고리: {list(feature_avg.get('cat_avg', {}).keys())[:10]}")
    print(f"사용 가능한 타입: {list(feature_avg.get('type_avg', {}).keys())[:10]}")
    
    category_avg_price = 0  # 기본값
    
    # 게임 테마별 카테고리 가격 조정 (모든 보드게임에 적용)
    if any(word in plan_text for word in ['역사', '문명', '고대', '중세', '르네상스', '산업혁명']):
        category_avg_price = feature_avg.get('cat_avg', {}).get('Strategy', 40.0)  # 전략 게임 + 프리미엄
        print(f"  -> 역사/문명 게임 감지: 카테고리 평균가 ${category_avg_price:.2f} (전략 게임 + 프리미엄)")
    elif any(word in plan_text for word in ['커피', '음식', '요리', '레스토랑', '카페']):
        category_avg_price = feature_avg.get('cat_avg', {}).get('Card Game', 22.0)  # 카드 게임
        print(f"  -> 음식/커피 게임 감지: 카테고리 평균가 ${category_avg_price:.2f} (카드 게임)")
    elif any(word in plan_text for word in ['우주', '우주선', '별', '행성', '외계인', 'SF', '과학']):
        category_avg_price = feature_avg.get('cat_avg', {}).get('Thematic', 32.0)  # 테마 게임 + 프리미엄
        print(f"  -> 우주/SF 게임 감지: 카테고리 평균가 ${category_avg_price:.2f} (테마 게임 + 프리미엄)")
    elif any(word in plan_text for word in ['마법', '판타지', '드래곤', '마법사', '요정', '신화']):
        category_avg_price = feature_avg.get('cat_avg', {}).get('Thematic', 30.0)  # 테마 게임
        print(f"  -> 판타지/마법 게임 감지: 카테고리 평균가 ${category_avg_price:.2f} (테마 게임)")
    elif any(word in plan_text for word in ['탐정', '범죄', '수사', '미스터리', '추리']):
        category_avg_price = feature_avg.get('cat_avg', {}).get('Thematic', 28.0)  # 테마 게임
        print(f"  -> 탐정/추리 게임 감지: 카테고리 평균가 ${category_avg_price:.2f} (테마 게임)")
    elif any(word in plan_text for word in ['전쟁', '군사', '전투', '전략', '전술', '군대']):
        category_avg_price = feature_avg.get('cat_avg', {}).get('Strategy', 38.0)  # 전략 게임 + 프리미엄
        print(f"  -> 전쟁/군사 게임 감지: 카테고리 평균가 ${category_avg_price:.2f} (전략 게임 + 프리미엄)")
    elif any(word in plan_text for word in ['경제', '무역', '상업', '회사', '주식', '투자']):
        category_avg_price = feature_avg.get('cat_avg', {}).get('Strategy', 35.0)  # 전략 게임
        print(f"  -> 경제/무역 게임 감지: 카테고리 평균가 ${category_avg_price:.2f} (전략 게임)")
    elif any(word in plan_text for word in ['가족', '어린이', '교육', '학습', '학교']):
        category_avg_price = feature_avg.get('cat_avg', {}).get('Family', 18.0)  # 가족 게임
        print(f"  -> 가족/교육 게임 감지: 카테고리 평균가 ${category_avg_price:.2f} (가족 게임)")
    elif any(word in plan_text for word in ['파티', '웃음', '재미', '즐거움', '친목']):
        category_avg_price = feature_avg.get('cat_avg', {}).get('Party Game', 15.0)  # 파티 게임
        print(f"  -> 파티/친목 게임 감지: 카테고리 평균가 ${category_avg_price:.2f} (파티 게임)")
    elif any(word in plan_text for word in ['전략', '전술', '계획', '시뮬레이션', '복잡']):
        category_avg_price = feature_avg.get('cat_avg', {}).get('Strategy', 35.0)  # 전략 게임
        print(f"  -> 전략/시뮬레이션 게임 감지: 카테고리 평균가 ${category_avg_price:.2f} (전략 게임)")
    elif any(word in plan_text for word in ['테마', '스토리', '롤플레잉', '어드벤처', '여행']):
        category_avg_price = feature_avg.get('cat_avg', {}).get('Thematic', 28.0)  # 테마 게임
        print(f"  -> 테마/스토리 게임 감지: 카테고리 평균가 ${category_avg_price:.2f} (테마 게임)")
    else:
        # 기본값: 중간 수준의 보드게임
        category_avg_price = 25.0
        print(f"  -> 기본 보드게임: 카테고리 평균가 ${category_avg_price:.2f}")
    
    # 5. 게임 타입별 평균 가격 추출 (학습된 모델의 feature_avg 사용)
    type_avg_price = 0  # 기본값
    
    # 게임 타입별 가격 조정 (모든 보드게임에 적용)
    if any(word in plan_text for word in ['카드게임', '덱빌딩', '덱구성', '카드', '트럼프', '포커']):
        type_avg_price = feature_avg.get('type_avg', {}).get('Card Game', 18.0)  # 카드 게임
        print(f"  -> 카드 게임 감지: 타입 평균가 ${type_avg_price:.2f} (카드 게임)")
    elif any(word in plan_text for word in ['보드게임', '타일배치', '경제', '보드', '게임판', '판']):
        type_avg_price = feature_avg.get('type_avg', {}).get('Board Game', 32.0)  # 보드 게임
        print(f"  -> 보드 게임 감지: 타입 평균가 ${type_avg_price:.2f} (보드 게임)")
    elif any(word in plan_text for word in ['파티게임', '워드게임', '퀴즈', '재미', '즐거움']):
        type_avg_price = feature_avg.get('type_avg', {}).get('Party Game', 15.0)  # 파티 게임
        print(f"  -> 파티 게임 감지: 타입 평균가 ${type_avg_price:.2f} (파티 게임)")
    elif any(word in plan_text for word in ['전략게임', '전술', '계획', '복잡', '시뮬레이션']):
        type_avg_price = feature_avg.get('type_avg', {}).get('Strategy', 35.0)  # 전략 게임
        print(f"  -> 전략 게임 감지: 타입 평균가 ${type_avg_price:.2f} (전략 게임)")
    elif any(word in plan_text for word in ['테마게임', '스토리', '롤플레잉', '어드벤처']):
        type_avg_price = feature_avg.get('type_avg', {}).get('Thematic', 28.0)  # 테마 게임
        print(f"  -> 테마 게임 감지: 타입 평균가 ${type_avg_price:.2f} (테마 게임)")
    elif any(word in plan_text for word in ['가족게임', '어린이', '교육', '학습']):
        type_avg_price = feature_avg.get('type_avg', {}).get('Family', 20.0)  # 가족 게임
        print(f"  -> 가족 게임 감지: 타입 평균가 ${type_avg_price:.2f} (가족 게임)")
    else:
        # 기본값: 중간 수준의 보드게임
        type_avg_price = 15.0
        print(f"  -> 기본 보드게임: 타입 평균가 ${type_avg_price:.2f}")
    
    # 6. AI 모델 입력값 구성 (model_train.py와 동일한 feature 구조)
    print(f"=== AI 모델 입력값 구성 ===")
    print(f"  - category_avg_price: ${category_avg_price:.2f}")
    print(f"  - type_avg_price: ${type_avg_price:.2f}")
    print(f"  - min_age: {min_age}")
    print(f"  - average_weight: {avg_weight}")
    print(f"  - component_count: {component_count}")
    
    X = pd.DataFrame([[category_avg_price, type_avg_price, min_age, avg_weight, component_count]],
                    columns=["category_avg_price", "type_avg_price", "min_age", "average_weight", "component_count"]).fillna(-1)
    
    # 7. AI 모델로 가격 예측 (RandomForest 모델 사용)
    try:
        print(f"=== AI 모델 예측 시작 ===")
        print(f"모델 타입: {type(model).__name__}")
        print(f"입력 데이터 형태: {X.shape}")
        
        predicted_price = float(model.predict(X)[0])  # USD
        print(f"  -> AI 모델 예측 가격: ${predicted_price:.2f}")
        
        # 8. 구성품 개수에 따른 추가 보정 (AI 예측 후)
        original_price = predicted_price
        
        # 게임 테마별로 다른 보정 적용
        theme_multiplier = 1.0
        if any(word in plan_text for word in ['역사', '문명', '고대', '중세', '르네상스', '산업혁명']):
            theme_multiplier = 1.20  # 역사/문명 게임은 프리미엄
            print(f"  -> 역사/문명 게임 테마 보정: +20%")
        elif any(word in plan_text for word in ['우주', '우주선', '별', '행성', '외계인', 'SF', '과학']):
            theme_multiplier = 1.18  # 우주/SF 게임은 프리미엄
            print(f"  -> 우주/SF 게임 테마 보정: +18%")
        elif any(word in plan_text for word in ['마법', '판타지', '드래곤', '마법사', '요정', '신화']):
            theme_multiplier = 1.15  # 판타지/마법 게임은 프리미엄
            print(f"  -> 판타지/마법 게임 테마 보정: +15%")
        elif any(word in plan_text for word in ['전쟁', '군사', '전투', '군대']):
            theme_multiplier = 1.15  # 전쟁/군사 게임은 프리미엄
            print(f"  -> 전쟁/군사 게임 테마 보정: +15%")
        elif any(word in plan_text for word in ['탐정', '범죄', '수사', '미스터리', '추리']):
            theme_multiplier = 1.12  # 탐정/추리 게임은 약간의 프리미엄
            print(f"  -> 탐정/추리 게임 테마 보정: +12%")
        elif any(word in plan_text for word in ['커피', '음식', '요리', '레스토랑', '카페']):
            theme_multiplier = 1.10  # 음식/커피 게임은 약간의 프리미엄
            print(f"  -> 음식/커피 게임 테마 보정: +10%")
        elif any(word in plan_text for word in ['경제', '무역', '상업', '회사', '주식', '투자']):
            theme_multiplier = 1.08  # 경제/무역 게임은 약간의 프리미엄
            print(f"  -> 경제/무역 게임 테마 보정: +8%")
        elif any(word in plan_text for word in ['가족', '어린이', '교육', '학습']):
            theme_multiplier = 0.95  # 가족/교육 게임은 약간 할인
            print(f"  -> 가족/교육 게임 테마 보정: -5%")
        elif any(word in plan_text for word in ['파티', '웃음', '재미', '즐거움', '친목']):
            theme_multiplier = 0.90  # 파티/친목 게임은 할인
            print(f"  -> 파티/친목 게임 테마 보정: -10%")
        else:
            theme_multiplier = 1.00  # 기본 테마는 보정 없음
            print(f"  -> 기본 테마: 보정 없음")
        
        # 구성품 개수에 따른 보정
        component_multiplier = 1.0
        if component_count > 100:
            component_multiplier = 1.15  # 매우 복잡한 게임 +15%
            print(f"  -> 구성품 100개 초과 보정: +15%")
        elif component_count > 80:
            component_multiplier = 1.12  # 복잡한 게임 +12%
            print(f"  -> 구성품 80개 초과 보정: +12%")
        elif component_count > 60:
            component_multiplier = 1.10  # 복잡한 게임 +10%
            print(f"  -> 구성품 60개 초과 보정: +10%")
        elif component_count > 40:
            component_multiplier = 1.08  # 중간 복잡도 +8%
            print(f"  -> 구성품 40개 초과 보정: +8%")
        elif component_count > 20:
            component_multiplier = 1.05  # 중간 복잡도 +5%
            print(f"  -> 구성품 20개 초과 보정: +5%")
        elif component_count > 10:
            component_multiplier = 1.03  # 약간 복잡 +3%
            print(f"  -> 구성품 10개 초과 보정: +3%")
        else:
            component_multiplier = 1.00  # 기본
            print(f"  -> 구성품 10개 이하: 보정 없음")
        
        # 최종 가격 계산 (테마 및 구성품 보정 적용)
        predicted_price = original_price * theme_multiplier * component_multiplier
        
        print(f"  -> 원본 AI 예측 가격: ${original_price:.2f}")
        print(f"  -> 테마 보정: ×{theme_multiplier:.2f}")
        print(f"  -> 구성품 보정: ×{component_multiplier:.2f}")
        print(f"  -> 최종 예측 가격: ${predicted_price:.2f}")
        
    except Exception as e:
        print(f"❌ AI 모델 예측 실패: {e}")
        raise HTTPException(status_code=500, detail=f"AI 모델 예측 실패: {e}")
    
    # 9. 한국 가격으로 변환 (1 USD = 1,380 KRW)
    exchange_rate = 1380
    kor_price = int(predicted_price * exchange_rate)
    
    print(f"=== 최종 결과 ===")
    print(f"  -> 환율 적용: ${predicted_price:.2f} × {exchange_rate} = {kor_price:,}원")
    print(f"  -> 최종 한국 가격: {kor_price:,}원")
    
    return {
        "planId": req.planId,
        "predicted_price": f"${predicted_price:.2f}",
        "kor_price": f"{kor_price:,}원"
    }
