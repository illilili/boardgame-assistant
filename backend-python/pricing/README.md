# Pricing - 자동 가격 책정

## 기능 설명
- 구성 요소 수, 제작 방식, 리플레이성 등 기준으로 가격 추천

## 구현할 항목
- [ ] 가격 산정 기준 모델 설계
- [ ] /api/pricing/estimate API 구현


CREATE TABLE plan (
    plan_id INT PRIMARY KEY AUTO_INCREMENT,      -- 고유 기획안 ID
    title VARCHAR(255) NOT NULL,                 -- 보드게임 제목
    category TEXT NOT NULL,                      -- 카테고리 (예: '["Card Game", "Fantasy"]')
    min_age INT,                                 -- 최소 나이
    difficulty FLOAT,                            -- 난이도 (예: 1.0 ~ 5.0)
    description TEXT,                            -- 기획 설명 (선택)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 생성일자
);

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
