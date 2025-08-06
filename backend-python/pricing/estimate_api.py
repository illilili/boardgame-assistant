from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pymysql
import joblib
import openai
import os
import pandas as pd
import numpy as np
import json
from dotenv import load_dotenv
import pickle
from openai import OpenAI

# ENV 로딩 및 OpenAI 키 설정
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

router = APIRouter(prefix="/api/ai-pricing", tags=["AI Pricing"])

# DB 설정
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "123123d",
    "database": "boardgame",
    "charset": "utf8mb4"
}

# 모델 로딩
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "price_predictor.pkl")
DICT_PATH = os.path.join(os.path.dirname(__file__), "models", "feature_avg_dicts.pkl")

if not os.path.exists(MODEL_PATH) or not os.path.exists(DICT_PATH):
    raise RuntimeError("❌ 모델 또는 평균값 파일이 없습니다.")

model = joblib.load(MODEL_PATH)
feature_avg_dicts = joblib.load(DICT_PATH)

# 요청 스키마
class PlanPriceRequest(BaseModel):
    planId: int

@router.post("/estimate")
async def estimate_price_from_ai(req: PlanPriceRequest):
    # 1. DB에서 기획서 텍스트(planContent) 가져오기
    try:
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SELECT planContent FROM plan WHERE planId = %s", (req.planId,))
        row = cursor.fetchone()
        cursor.close()
        conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB 오류: {str(e)}")

    if not row:
        raise HTTPException(status_code=404, detail="해당 planId의 기획서가 없습니다.")
    
    plan_text = row[0]

    # 2. GPT-3.5로 정보 추출 요청
    prompt = f"""
너는 보드게임 기획서를 분석하는 도우미야.
가격 산성 모델은 영어를 사용하여 학습되어있어. category는 한국어를 영어로 번역해서 사용해줘.
아래 기획서에서 다음 정보를 추출해서 JSON으로 정리해줘, type은 기획서의 게임의 스토리, 진행방식 같은 정보를 기반으로 주어진 리스트중에서 1~2를 선정해줘:

- category: 문자열 리스트 (ex: ["Engine Building", "Card Drafting"])
- type: 문자열 리스트 (아래 중 최대 2개, 영어로)
  ["Abstract", "Customizable", "Thematic", "Family", 
   "Children's", "Party", "Strategy", "Wargames"]
- min_age: 숫자 (최소 나이)
- average_weight: 숫자 (1~5 사이 난이도)
- component: 문자열 리스트 (ex: ["주사위", "말", "카드"])

기획서:
{plan_text}

출력 형식 예시:
{{
  "category": ["전략", "카드"],
  "type": ["Strategy Games", "Thematic Games"],
  "min_age": 10,
  "average_weight": 2.3,
  "component": ["주사위", "말", "카드"]
}}
    """.strip()

    try:
        from openai import OpenAI

        client = OpenAI()

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )

        gpt_output = response.choices[0].message.content
        gpt_output = response.choices[0].message.content
        info = json.loads(gpt_output)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI 요청 실패: {str(e)}")

    # 3. 추출된 정보 파싱
    try:
        categories = info.get("category", [])
        types = info.get("type", [])
        min_age = float(info.get("min_age", 0))
        avg_weight = float(info.get("average_weight", 0))
        components = info.get("component", [])
        component_count = len(components)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"GPT 응답 파싱 실패: {str(e)}")

    # 4. 평균값 계산
    cat_avg = feature_avg_dicts['cat_avg']
    type_avg = feature_avg_dicts['type_avg']

    cat_prices = [cat_avg[c] for c in categories if c in cat_avg]
    category_avg_price = np.mean(cat_prices) if cat_prices else 0

    type_prices = [type_avg[t] for t in types if t in type_avg]
    type_avg_price = np.mean(type_prices) if type_prices else 0

    # 5. 모델 입력 생성
    X_input = pd.DataFrame([[category_avg_price, type_avg_price, min_age, avg_weight, component_count]],
                           columns=['category_avg_price', 'type_avg_price', 'min_age', 'average_weight', 'component_count']
    ).fillna(-1)

    # 6. 예측
    try:
        predicted_price = model.predict(X_input)[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"모델 예측 실패: {str(e)}")

# 테스트 용 출력
    return {
        "planId": req.planId,
        "extracted_info": {
            "category": categories,
            "type": types,
            "min_age": min_age,
            "average_weight": avg_weight,
            "component": components,
            "component_count": component_count
        },
        "category_avg_price": round(category_avg_price, 2),
        "type_avg_price": round(type_avg_price, 2),
        "predicted_price": round(predicted_price, 2)
    }

#     return {
#     "planId": req.planId,
#     "predicted_price": round(predicted_price, 2)
# }
