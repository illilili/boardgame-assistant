from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pymysql
import joblib
import pandas as pd
import numpy as np
import json
import os

router = APIRouter(prefix="/api/pricing", tags=["Pricing"])

# DB 설정
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "123123d",
    "database": "boardgame",
    "charset": "utf8mb4"
}

# 모델 및 평균 가격 로드
model_path = 'pricing/models/price_predictor.pkl'
avg_path = 'pricing/models/feature_avg_dicts.pkl'  # <-- 최신 코드 기준 여러 평균 저장 파일로 수정

if not os.path.exists(model_path) or not os.path.exists(avg_path):
    raise RuntimeError("❌ 모델 또는 feature 평균 파일이 존재하지 않습니다. model_train.py 먼저 실행하세요.")

model = joblib.load(model_path)
avg_dicts = joblib.load(avg_path)
cat_avg = avg_dicts['cat_avg']
type_avg = avg_dicts['type_avg']
comp_avg = avg_dicts['comp_avg']

# 요청 스키마
class EstimateRequest(BaseModel):
    plan_id: int

@router.post("/estimate")
def estimate_price(req: EstimateRequest):
    # DB에서 기획안 조회 (component 포함!)
    try:
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT category, min_age, average_weight, component
            FROM plan
            WHERE plan_id = %s
        """, (req.plan_id,))
        row = cursor.fetchone()
        cursor.close()
        conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB 연결 실패: {str(e)}")

    if not row:
        raise HTTPException(status_code=404, detail="해당 plan_id의 기획안이 존재하지 않습니다.")

    try:
        categories = json.loads(row[0])  # 문자열 → 리스트
        min_age = float(row[1])
        average_weight = float(row[2])
        component_raw = row[3]
        # component 파싱: 리스트면 그대로, 문자열이면 eval/json.loads, 없으면 빈 리스트
        if not component_raw:
            component_list = []
        elif isinstance(component_raw, list):
            component_list = component_raw
        elif component_raw.strip().startswith("["):
            # 예: "[Pawn, Dice, Board]"
            try:
                component_list = eval(component_raw)
            except Exception:
                component_list = json.loads(component_raw)
        else:
            component_list = [component_raw]
        component_count = len(component_list)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"데이터 파싱 오류: {str(e)}")

    # 카테고리 평균 계산
    valid_cat_avgs = [cat_avg[cat] for cat in categories if cat in cat_avg]
    avg_price_cat = np.mean(valid_cat_avgs) if valid_cat_avgs else 0

    # 필요하다면 type, component 평균가격도 feature로 넣을 수 있음
    # 아래처럼 구조 잡아두고 필요할 때 확장 가능
    avg_price_type = np.nan
    avg_price_comp = np.nan

    # 예측 입력 feature (모델과 동일하게 맞춰야 함)
    X_input = pd.DataFrame([[
        avg_price_cat,      # category_avg_price
        avg_price_type,     # type_avg_price
        avg_price_comp,     # component_avg_price
        min_age,            # min_age
        average_weight,     # average_weight
        component_count     # component_count
    ]], columns=[
        'category_avg_price', 'type_avg_price', 'component_avg_price',
        'min_age', 'average_weight', 'component_count'
    ]).fillna(-1)

    predicted_price = model.predict(X_input)[0]

    return {
        "plan_id": req.plan_id,
        "input_categories": categories,
        "min_age": min_age,
        "average_weight": average_weight,
        "component_count": component_count,
        "category_avg_price": round(avg_price_cat, 2),
        "predicted_price": round(predicted_price, 2)
    }
