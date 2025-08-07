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

random_state 10~199 중 104가 성능이 가장 좋음


pip install pandas numpy scikit-learn joblib

cd backend-python
모델 실행 
python pricing/model_train.py


MAE: 4.58
R^2: 0.812

Feature Importances:
category_avg_price: 0.538
type_avg_price: 0.060
min_age: 0.058
average_weight: 0.333
component_count: 0.010



python -m venv venv
source venv/bin/activate

pip install fastapi uvicorn python-dotenv openai pymysql pandas scikit-learn joblib
pip install fastapi uvicorn
pip install pymysql
pip install openai
pip install sqlalchemy pymysql 
pip install python-dotenv 
pip install fastapi[all] 
pip install openai 
pip install sqlalchemy 
pip install sqlalchemy openai python-dotenv pymysql


docker run -d --name mariadb -e MYSQL_ROOT_PASSWORD=123123d -e MYSQL_DATABASE=boardgame -p 3306:3306 mariadb
docker exec -it mariadb bash
mariadb -u root -p

USE boardgame;
CREATE TABLE plan (
    planId INT PRIMARY KEY AUTO_INCREMENT,
    planContent TEXT
);
SELECT * FROM plan;

uvicorn pricing.api:app --reload