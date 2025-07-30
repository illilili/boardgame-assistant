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
    "password": "yourpassword",
    "database": "boardgame_db",
    "charset": "utf8mb4"
}

# 모델 및 평균 가격 로드
model_path = 'pricing/models/price_predictor.pkl'
avg_path = 'pricing/models/category_avg_dict.pkl'

if not os.path.exists(model_path) or not os.path.exists(avg_path):
    raise RuntimeError("❌ 모델 또는 카테고리 평균 파일이 존재하지 않습니다. model_train.py 먼저 실행하세요.")

model = joblib.load(model_path)
category_avg = joblib.load(avg_path)

# 요청 스키마
class EstimateRequest(BaseModel):
    plan_id: int

@router.post("/estimate")
def estimate_price(req: EstimateRequest):
    # DB에서 기획안 조회
    try:
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT categories, min_age, difficulty
            FROM game_plan
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
        difficulty = float(row[2])
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"데이터 파싱 오류: {str(e)}")

    # 카테고리 평균 계산
    valid_avgs = [category_avg[cat] for cat in categories if cat in category_avg]
    if not valid_avgs:
        raise HTTPException(status_code=400, detail="카테고리에 해당하는 평균 가격이 없습니다.")

    avg_price = np.mean(valid_avgs)
    X_input = pd.DataFrame([[avg_price, min_age, difficulty]],
                           columns=['카테고리_평균가격', '최소나이', '난이도'])

    predicted_price = model.predict(X_input)[0]

    return {
        "plan_id": req.plan_id,
        "input_categories": categories,
        "min_age": min_age,
        "difficulty": difficulty,
        "avg_price_from_categories": round(avg_price, 2),
        "predicted_price": round(predicted_price, 2)
    }
