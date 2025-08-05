# model_train.py

import pandas as pd
import numpy as np
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

# 🔧 파일 경로
csv_path = 'data/boardgame_detaildata_1-101_공백.csv'

# ✅ 데이터 로드 및 전처리
df = pd.read_csv(csv_path)
df['amazon_price'] = df['amazon_price'].replace(r'[\$,]', '', regex=True)
df['amazon_price'] = pd.to_numeric(df['amazon_price'], errors='coerce')
df['최소나이'] = df['최소나이'].str.replace('+', '', regex=False)
df['최소나이'] = pd.to_numeric(df['최소나이'], errors='coerce')
df['난이도'] = pd.to_numeric(df['난이도'], errors='coerce')

# ✅ 결측치 제거 및 이상치(>200달러) 제거
df = df.dropna(subset=['amazon_price', '카테고리', '최소나이', '난이도'])
df = df[df['amazon_price'] <= 200].copy()

# ✅ 카테고리 리스트화
def parse_category(x):
    try:
        return eval(x) if isinstance(x, str) and x.startswith("[") else []
    except:
        return []

df['카테고리_리스트'] = df['카테고리'].apply(parse_category)

# ✅ 카테고리별 평균 가격 계산 (여러 카테고리에 모두 반영)
category_price = {}
category_count = {}

for _, row in df.iterrows():
    price = row['amazon_price']
    categories = row['카테고리_리스트']
    for cat in categories:
        category_price[cat] = category_price.get(cat, 0) + price
        category_count[cat] = category_count.get(cat, 0) + 1

category_avg = {cat: category_price[cat] / category_count[cat] for cat in category_price}
category_avg_df = pd.DataFrame({'category': list(category_avg.keys()), 'avg_price': list(category_avg.values())})
os.makedirs('models', exist_ok=True)
category_avg_df.to_csv('models/category_avg_prices.csv', index=False)

# ✅ 입력용 feature 구성
def compute_category_mean(row):
    cats = row['카테고리_리스트']
    prices = [category_avg[cat] for cat in cats if cat in category_avg]
    return np.mean(prices) if prices else np.nan

df['카테고리_평균가격'] = df.apply(compute_category_mean, axis=1)
df = df.dropna(subset=['카테고리_평균가격'])

X = df[['카테고리_평균가격', '최소나이', '난이도']]
y = df['amazon_price']

# ✅ 학습/검증 분리
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ✅ 모델 학습
model = RandomForestRegressor(random_state=42)
model.fit(X_train, y_train)

# ✅ 성능 평가
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("✅ 모델 학습 완료")
print(f"📊 평균 절대 오차 (MAE): ${mae:.2f}")
print(f"📈 결정계수 (R² Score): {r2:.3f}")

# ✅ 모델 저장
os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/price_predictor.pkl')
joblib.dump(category_avg, 'models/category_avg_dict.pkl')

print("💾 모델 및 카테고리 평균 저장 완료")
