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
    # --- 간단 버전: 이미 학습된 평균가 + 규칙 기반 feature만 사용 ---
    # 여기서는 GPT로 구조화 안 하고, Spring이 준 planText에서 구성품 개수만 대강 추출하는 옵션도 가능하지만
    # 우선은 모델 입력값을 보수적으로 사용(구성품=0) → 추후 필요시 개선
    # 추천: 프론트/스프링에서 구성품 리스트를 확보하면 component_count 반영

    # TODO: 필요시, planText에서 "카드", "주사위" 같은 토큰 카운팅 로직 추가 가능
    component_count = 0

    # 평균가 사전이 필요: 카테고리/타입은 지금은 사용할 수 없으니 0 처리
    category_avg_price = 0.0
    type_avg_price = 0.0

    # 난이도/최소연령은 기본값 0 → 모델은 학습 시 결측 -1 대체했음
    min_age = 0.0
    avg_weight = 0.0

    X = pd.DataFrame([[category_avg_price, type_avg_price, min_age, avg_weight, component_count]],
                     columns=["category_avg_price", "type_avg_price", "min_age", "average_weight", "component_count"]).fillna(-1)

    try:
        predicted_price = float(model.predict(X)[0])  # USD
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"모델 예측 실패: {e}")

    kor_price = int(round(predicted_price * 1350))
    return {
        "planId": req.planId,
        "predicted_price": f"${predicted_price:.2f}",
        "kor_price": f"{kor_price:,}원"
    }
