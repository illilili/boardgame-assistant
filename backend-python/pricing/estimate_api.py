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
가격 산정 모델은 영어를 기반으로 학습되어 있기 때문에,
category는 아래 제공된 121개의 영어 카테고리 목록 중에서만 선택해서 출력해줘.

아래 기획서를 읽고 다음 정보를 JSON 형식으로 추출해줘:

- category: 문자열 리스트 (아래 카테고리 목록 중에서만 가장 비슷한 걸로 선택)
- type: 문자열 리스트 (아래 type 목록 중 최대 2개 선택)
- min_age: 숫자 (최소 나이)
- average_weight: 숫자 (1~5 사이 난이도)
- component: 문자열 리스트 (ex: ["주사위", "말", "카드"])

※ category는 아래 121개의 카테고리 목록 중에서 의미가 가장 가까운 항목으로 골라서 출력해.
[카테고리 목록]
Abstract Strategy, Action, Action Points, Action Queue, Adult, Adventure, Age of Reason, American Civil War, American Indian Wars, American Revolutionary War, American West, Ancient, Animals, Arabian, Area Majority, Aviation, Bias, Bluffing, Book, Card Game, Childrens Game, City Building, Civil War, Civilization, Collectible Components, Comic Book, Cooperative Game, Deduction, Dexterity, Dice, Dice Rolling, Economic, Educational, Electronic, Environmental, Expansion for Base-game, Exploration, Fan Expansion, Fantasy, Farming, Fighting, Flight, Game System, Grid Movement, Hidden Movement, Horror, Humor, Industry, Influence, Korean War, Mafia, Manufacturing, Math, Mature, Maze, Medical, Medieval, Memory, Miniatures, Modern Warfare, Modular Board, Movement Template, Movies, Murder, Music, Mystery, Mythology, Napoleonic, Nautical, Negotiation, Novel-based, Number, Open Drafting, Paper-and-Pencil, Party Game, Pattern Building, Pike and Shot, Pirates, Player Elimination, Point to Point Movement, Political, Post-Napoleonic, Prehistoric, Print & Play, Push Your Luck, Puzzle, Racing, Radio theme, Real-Time, Religious, Renaissance, Role Playing, Science Fiction, Secret Agents, Semi-Cooperative Game, Simulation, Simultaneous Action Selection, Solitaire Game, Solo, Space Exploration, Spies, Sports, Strip, TV, Team-Based Game, Territory Building, Trains, Transportation, Travel, Trivia, Variable Phase Order, Variable Player Powers, Video Game Theme, Vietnam War, Wargame, Word Game, Worker Placement, World War I, World War II, Zombies

[type 목록]
["Abstract", "Customizable", "Thematic", "Family", "Children's", "Party", "Strategy", "Wargames"]

기획서:
{plan_text}

출력 예시:
{{
  "category": ["Economic", "Card Game"],
  "type": ["Strategy", "Thematic"],
  "min_age": 10,
  "average_weight": 2.3,
  "component": ["주사위", "카드", "토큰"]
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
