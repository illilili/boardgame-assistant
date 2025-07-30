import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm

# 나눔고딕 폰트 설정
plt.rcParams['font.family'] = 'NanumGothic'

# CSV 파일 경로
csv_path = 'data/boardgame_detaildata_1-101_공백.csv'
os.makedirs("plots", exist_ok=True)

if not os.path.exists(csv_path):
    raise FileNotFoundError(f"{csv_path} 파일이 존재하지 않습니다.")

# CSV 파일 로드
df = pd.read_csv(csv_path)

# 가격 전처리 ($ 제거 및 숫자로 변환)
df['amazon_price'] = df['amazon_price'].replace(r'[\$,]', '', regex=True)
df['amazon_price'] = pd.to_numeric(df['amazon_price'], errors='coerce')

# 최소나이 전처리 ('14+' → 14)
df['최소나이'] = df['최소나이'].str.replace('+', '', regex=False)
df['최소나이'] = pd.to_numeric(df['최소나이'], errors='coerce')

# 카테고리에서 첫 번째 항목만 추출
def extract_first_category(x):
    if pd.isnull(x) or not x.startswith("["):
        return "Unknown"
    parsed = eval(x)
    return parsed[0] if parsed else "Unknown"

df['카테고리_단일'] = df['카테고리'].apply(extract_first_category)

# 📊 산점도 저장: 카테고리별 아마존 가격
plt.figure(figsize=(14, 6))
sns.stripplot(x='카테고리_단일', y='amazon_price', data=df, jitter=True, alpha=0.6)
plt.xticks(rotation=45, ha='right')
plt.title('카테고리별 아마존 가격 산점도')
plt.ylabel('Amazon Price ($)')
plt.xlabel('카테고리')
plt.tight_layout()
plt.savefig('plots/scatter_amazon_price_by_category.png')
plt.close()

# 🔥 히트맵 저장: 수치형 컬럼 상관관계
numeric_cols = ['amazon_price', 'Geek Rating', 'Average Rating', '최소인원', '최대인원', '난이도', '최소나이']
corr_matrix = df[numeric_cols].corr()

plt.figure(figsize=(8, 6))
sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', fmt=".2f")
plt.title('아마존 가격과 수치형 컬럼 간의 상관관계 히트맵')
plt.tight_layout()
plt.savefig('plots/heatmap_price_correlation.png')
plt.close()

# 🎯 산점도 저장: 난이도 vs 아마존 가격
plt.figure(figsize=(8, 6))
sns.scatterplot(x='난이도', y='amazon_price', data=df, alpha=0.6)
plt.title('난이도와 아마존 가격의 관계')
plt.xlabel('난이도')
plt.ylabel('Amazon Price ($)')
plt.tight_layout()
plt.savefig('plots/scatter_difficulty_vs_price.png')
plt.close()

print("✅ 분석 완료! 다음 이미지가 plots 폴더에 저장되었습니다:")
print(" - scatter_amazon_price_by_category.png")
print(" - heatmap_price_correlation.png")
