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

# (선택) 공용 OpenAI 유틸 쓰려면 import, 이번 라우트는 동작상 없어도 됨
# from utils.openai_utils import call_openai

router = APIRouter(prefix="/api/ai-pricing", tags=["AI Pricing"])

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "price_predictor.pkl"
DICT_PATH = BASE_DIR / "models" / "feature_avg_dicts.pkl"

if not MODEL_PATH.exists() or not DICT_PATH.exists():
    raise RuntimeError("모델 파일이 없습니다. 먼저 `python -m pricing.model_train` 실행하세요.")

model = joblib.load(MODEL_PATH)
feature_avg = joblib.load(DICT_PATH)  # {'cat_avg':..., 'type_avg':...}

class PlanPriceRequest(BaseModel):
    planId: int
    planText: str  # Spring에서 보내는 기획서 본문

def _extract_json(text: str) -> str:
    m = re.search(r"\{.*\}", text, re.S)
    return m.group(0) if m else text

@router.post("/estimate")
async def estimate_price(req: PlanPriceRequest):
    # --- 기획서 텍스트에서 실제 정보 추출하여 동적 가격 계산 ---
    
    plan_text = req.planText.lower() if req.planText else ""
    
    # 1. 구성품 개수 추출 (카드, 주사위, 보드, 토큰 등)
    component_count = 0
    component_keywords = {
        '카드': ['카드', 'card', '덱', 'deck'],
        '주사위': ['주사위', 'dice', 'die'],
        '보드': ['보드', 'board', '게임판'],
        '토큰': ['토큰', 'token', '칩', 'chip'],
        '미니어처': ['미니어처', 'miniature', '피규어', 'figure'],
        '타일': ['타일', 'tile', '플레이트', 'plate']
    }
    
    for component_type, keywords in component_keywords.items():
        for keyword in keywords:
            if keyword in plan_text:
                # 간단한 패턴 매칭으로 개수 추정
                import re
                # "카드 52장", "주사위 2개" 같은 패턴 찾기
                count_pattern = rf'{keyword}\s*(\d+)[장개개]'
                match = re.search(count_pattern, plan_text)
                if match:
                    component_count += int(match.group(1))
                else:
                    # 패턴이 없으면 기본값 1 추가
                    component_count += 1
    
    # 2. 게임 난이도 추정 (텍스트 내용 기반)
    avg_weight = 2.0  # 기본값 (1-5 스케일)
    if any(word in plan_text for word in ['복잡', '전략', '전술', '계획', '시뮬레이션']):
        avg_weight = 4.0
    elif any(word in plan_text for word in ['간단', '가족', '파티', '빠른', '쉬운']):
        avg_weight = 1.5
    elif any(word in plan_text for word in ['중간', '보통', '일반']):
        avg_weight = 2.5
    
    # 3. 최소 연령 추정
    min_age = 8.0  # 기본값
    if any(word in plan_text for word in ['성인', '어른', '전략', '복잡']):
        min_age = 16.0
    elif any(word in plan_text for word in ['가족', '아이', '어린이', '유아']):
        min_age = 4.0
    elif any(word in plan_text for word in ['청소년', '중학생', '고등학생']):
        min_age = 12.0
    
    # 4. 카테고리별 평균 가격 (간단한 규칙 기반)
    category_avg_price = 15.0  # 기본값 USD
    if any(word in plan_text for word in ['전략', '전술', '시뮬레이션', '경제']):
        category_avg_price = 25.0
    elif any(word in plan_text for word in ['가족', '파티', '어린이', '교육']):
        category_avg_price = 12.0
    elif any(word in plan_text for word in ['테마', '스토리', '롤플레잉', '어드벤처']):
        category_avg_price = 20.0
    
    # 5. 게임 타입별 평균 가격
    type_avg_price = 18.0  # 기본값 USD
    if any(word in plan_text for word in ['카드게임', '덱빌딩', '덱구성']):
        type_avg_price = 15.0
    elif any(word in plan_text for word in ['보드게임', '타일배치', '경제']):
        type_avg_price = 25.0
    elif any(word in plan_text for word in ['파티게임', '워드게임', '퀴즈']):
        type_avg_price = 12.0
    
    # 6. 구성품 개수에 따른 가격 보정
    if component_count > 10:
        category_avg_price *= 1.3
        type_avg_price *= 1.2
    elif component_count > 5:
        category_avg_price *= 1.1
        type_avg_price *= 1.1
    
    # 7. 난이도에 따른 가격 보정
    if avg_weight > 3.5:
        category_avg_price *= 1.2
        type_avg_price *= 1.15
    
    # 8. 최종 입력값 구성
    X = pd.DataFrame([[category_avg_price, type_avg_price, min_age, avg_weight, component_count]],
                     columns=["category_avg_price", "type_avg_price", "min_age", "average_weight", "component_count"]).fillna(-1)

    try:
        predicted_price = float(model.predict(X)[0])  # USD
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"모델 예측 실패: {e}")

    kor_price = int(round(predicted_price * 1350))
    
    # 디버깅을 위한 로그 추가
    print(f"가격 추정 상세 정보:")
    print(f"  - 구성품 개수: {component_count}")
    print(f"  - 카테고리 평균가: ${category_avg_price:.2f}")
    print(f"  - 타입 평균가: ${type_avg_price:.2f}")
    print(f"  - 최소 연령: {min_age}")
    print(f"  - 난이도: {avg_weight}")
    print(f"  - 예측 가격: ${predicted_price:.2f} → {kor_price:,}원")
    
    return {
        "planId": req.planId,
        "predicted_price": f"${predicted_price:.2f}",
        "kor_price": f"{kor_price:,}원"
    }
