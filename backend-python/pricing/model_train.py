# model_train.py

import pandas as pd
import numpy as np
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

# ====== 파일 경로 및 인코딩 설정 ======
csv_path = 'data/bgg_merged_type_components.csv'  # 실제 위치/파일명 맞게!
df = pd.read_csv(csv_path, encoding='latin1')
print("✅ 데이터 로드 완료")
print(df.head())
print(df.columns)

# ====== 데이터 전처리 ======
df['amazon_price'] = df['amazon_price'].replace(r'[\$,]', '', regex=True)
df['amazon_price'] = pd.to_numeric(df['amazon_price'], errors='coerce')
df['min_age'] = pd.to_numeric(df['min_age'], errors='coerce')
df['average_weight'] = pd.to_numeric(df['average_weight'], errors='coerce')

# ====== 리스트형 컬럼 파싱 ======
def parse_list(x):
    try:
        if isinstance(x, str) and x.startswith("["):
            return eval(x)
        elif pd.isnull(x):
            return []
        else:
            return [x]
    except:
        return []

for col in ['category', 'type', 'component']:
    col_ = f"{col}_list"
    if col in df.columns:
        df[col_] = df[col].apply(parse_list)
    else:
        df[col_] = [[] for _ in range(len(df))]

# ====== 아마존 가격 없는 행 제거 (필수) ======
df = df.dropna(subset=['amazon_price'])
df = df[df['amazon_price'] <= 200]  # 이상치도 제거

# ====== 각 리스트 feature별 평균가격 계산 ======
def get_mean_dict(df, key_col, target_col='amazon_price'):
    mean_dict = {}
    count_dict = {}
    for _, row in df.iterrows():
        keys = row[key_col]
        val = row[target_col]
        for k in keys:
            mean_dict[k] = mean_dict.get(k, 0) + val
            count_dict[k] = count_dict.get(k, 0) + 1
    avg_dict = {k: mean_dict[k]/count_dict[k] for k in mean_dict}
    return avg_dict

cat_avg = get_mean_dict(df, 'category_list')
type_avg = get_mean_dict(df, 'type_list')
comp_avg = get_mean_dict(df, 'component_list')

# ====== 각 row별로 평균값 feature 생성 ======
def get_avg_feature(row, avg_dict, list_col):
    vals = [avg_dict[k] for k in row[list_col] if k in avg_dict]
    return np.mean(vals) if vals else np.nan

df['category_avg_price'] = df.apply(lambda r: get_avg_feature(r, cat_avg, 'category_list'), axis=1)
df['type_avg_price'] = df.apply(lambda r: get_avg_feature(r, type_avg, 'type_list'), axis=1)


# ====== component 개수 feature 추가 ======
df['component_count'] = df['component_list'].apply(len)

# ====== 입력 feature 컬럼 정의 ======
feature_cols = [
    'category_avg_price',
    'type_avg_price',
    'min_age',
    'average_weight',
    'component_count'
]

# ====== 결측치 처리 ======
df = df.dropna(subset=['min_age', 'average_weight'])  # 핵심 feature는 결측치 제거
X = df[feature_cols].fillna(-1)
y = df['amazon_price']

# ====== 모델 학습/평가 ======
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=104)
model = RandomForestRegressor(random_state=104)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"\nMAE: {mae:.2f}")
print(f"R^2: {r2:.3f}")

# ====== feature importance ======
importances = model.feature_importances_
print("\nFeature Importances:")
for name, val in zip(feature_cols, importances):
    print(f"{name}: {val:.3f}")

# ====== 모델/평균 저장 ======
os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/price_predictor.pkl')
joblib.dump({'cat_avg': cat_avg, 'type_avg': type_avg,}, 'models/feature_avg_dicts.pkl')

print("\n💾 모델 및 feature 평균 저장 완료")
