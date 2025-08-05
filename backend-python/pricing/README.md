# Pricing - 자동 가격 책정

## 기능 설명
- 구성 요소 수, 제작 방식, 리플레이성 등 기준으로 가격 추천

## 구현할 항목
- [ ] 가격 산정 기준 모델 설계
- [ ] /api/pricing/estimate API 구현

feature_cols = [
    'category_avg_price',   # 카테고리별 평균가격
    'type_avg_price',       # 타입별 평균가격
    'min_age',              # 최소 나이
    'average_weight',       # 난이도
    'component_count'       # 컴포넌트 종류 수
]
기획안-> plan   구성품 종류-> component

python -m venv venv 
가상환경 활성화 source venv/bin/activate

pip install sqlalchemy pymysql 
pip install python-dotenv 
pip install fastapi[all] 
pip install openai 
pip install sqlalchemy 
pip install sqlalchemy openai python-dotenv pymysql




pip install joblib
pip install fastapi uvicorn pymysql pandas numpy scikit-learn




sudo apt update
sudo apt install -y fonts-nanum
sudo fc-cache -fv


pip install scikit-learn

pip install pandas matplotlib seaborn

python analyze_boardgame.py
python analyze_boardgame_1.py
python model_train.py


uvicorn app:app --reload
