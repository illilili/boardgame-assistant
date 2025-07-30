import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os
import matplotlib.font_manager as fm

# ✅ 한글 폰트 설정 (NanumGothic)
plt.rcParams['font.family'] = 'NanumGothic'

# 📂 CSV 파일 경로
csv_path = 'data/boardgame_detaildata_1-101_공백.csv'

if not os.path.exists(csv_path):
    raise FileNotFoundError(f"{csv_path} 파일이 존재하지 않습니다.")

# 📊 데이터 로드
df = pd.read_csv(csv_path)

# 💰 가격 처리
df['amazon_price'] = df['amazon_price'].replace('[\$,]', '', regex=True)
df['amazon_price'] = pd.to_numeric(df['amazon_price'], errors='coerce')

# 🔞 나이 처리
df['최소나이'] = df['최소나이'].str.replace('+', '', regex=False)
df['최소나이'] = pd.to_numeric(df['최소나이'], errors='coerce')

# 🧠 첫 번째 카테고리 추출
def extract_first_category(x):
    if pd.isnull(x) or not x.startswith("["):
        return "Unknown"
    parsed = eval(x)
    return parsed[0] if parsed else "Unknown"

df['카테고리_단일'] = df['카테고리'].apply(extract_first_category)

# ✅ 이상치 제거 함수 정의
def remove_outliers(group):
    q1 = group['amazon_price'].quantile(0.25)
    q3 = group['amazon_price'].quantile(0.75)
    iqr = q3 - q1
    lower = q1 - 1.5 * iqr
    upper = q3 + 1.5 * iqr
    return group[(group['amazon_price'] >= lower) & (group['amazon_price'] <= upper)]

# ✅ 카테고리별로 이상치 제거 적용
df_clean = df.groupby('카테고리_단일', group_keys=False).apply(remove_outliers)

# 📦 이상치 제거 후 박스플롯 저장
plt.figure(figsize=(14, 6))
sns.boxplot(x='카테고리_단일', y='amazon_price', data=df_clean)
plt.xticks(rotation=45, ha='right')
plt.title('이상치 제거 후 카테고리별 아마존 가격 박스플롯')
plt.ylabel('Amazon Price ($)')
plt.xlabel('카테고리')
plt.tight_layout()
plt.savefig('plots/boxplot_amazon_price_by_category1.png')
plt.close()

print("✅ 이상치 제거 후 박스플롯 저장 완료: plots/boxplot_amazon_price_by_category1.png")
