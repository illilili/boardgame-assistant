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

모델 실행 python model_train.py

MAE: 4.58
R^2: 0.812

Feature Importances:
category_avg_price: 0.538
type_avg_price: 0.060
min_age: 0.058
average_weight: 0.333
component_count: 0.010












random_state=10 → R²=0.449, MAE=13.96
random_state=11 → R²=0.198, MAE=8.61
random_state=12 → R²=0.504, MAE=12.99
random_state=13 → R²=0.382, MAE=14.26
random_state=14 → R²=0.188, MAE=22.33
random_state=15 → R²=0.017, MAE=11.38
random_state=16 → R²=-0.679, MAE=16.33
random_state=17 → R²=0.218, MAE=9.13
random_state=18 → R²=0.725, MAE=3.90
random_state=19 → R²=-0.713, MAE=10.40
random_state=20 → R²=-0.347, MAE=18.97
random_state=21 → R²=0.498, MAE=10.32
random_state=22 → R²=-1.657, MAE=11.75
random_state=23 → R²=-0.428, MAE=5.43
random_state=24 → R²=0.441, MAE=12.48
random_state=25 → R²=0.258, MAE=15.38
random_state=26 → R²=0.660, MAE=8.55
random_state=27 → R²=-0.135, MAE=8.78
random_state=28 → R²=0.451, MAE=5.71
random_state=29 → R²=0.310, MAE=13.88
random_state=30 → R²=0.115, MAE=13.54
random_state=31 → R²=0.656, MAE=8.34
random_state=32 → R²=0.694, MAE=8.87
random_state=33 → R²=0.322, MAE=7.01
random_state=34 → R²=0.612, MAE=13.99
random_state=35 → R²=0.584, MAE=9.53
random_state=36 → R²=0.321, MAE=12.23
random_state=37 → R²=0.004, MAE=16.34
random_state=38 → R²=0.600, MAE=6.55
random_state=39 → R²=-0.073, MAE=23.18
random_state=40 → R²=0.536, MAE=10.97
random_state=41 → R²=0.296, MAE=6.70
random_state=42 → R²=-0.548, MAE=17.49
random_state=43 → R²=0.593, MAE=9.11
random_state=44 → R²=0.712, MAE=9.82
random_state=45 → R²=0.703, MAE=7.40
random_state=46 → R²=0.146, MAE=18.87
random_state=47 → R²=0.057, MAE=15.73
random_state=48 → R²=0.274, MAE=18.68
random_state=49 → R²=0.137, MAE=16.47
random_state=50 → R²=0.207, MAE=12.56
random_state=51 → R²=0.537, MAE=9.76
random_state=52 → R²=0.605, MAE=9.76
random_state=53 → R²=-0.554, MAE=20.90
random_state=54 → R²=0.253, MAE=15.27
random_state=55 → R²=0.465, MAE=11.65
random_state=56 → R²=0.449, MAE=10.84
random_state=57 → R²=0.195, MAE=13.33
random_state=58 → R²=0.442, MAE=6.71
random_state=59 → R²=0.257, MAE=13.00
random_state=60 → R²=-0.029, MAE=9.74
random_state=61 → R²=0.041, MAE=15.83
random_state=62 → R²=0.324, MAE=8.10
random_state=63 → R²=-0.011, MAE=22.63
random_state=64 → R²=0.286, MAE=17.20
random_state=65 → R²=-0.127, MAE=22.71
random_state=66 → R²=0.174, MAE=15.48
random_state=67 → R²=-0.443, MAE=11.67
random_state=68 → R²=-0.069, MAE=17.66
random_state=69 → R²=0.590, MAE=8.73
random_state=70 → R²=0.003, MAE=17.01
random_state=71 → R²=-2.737, MAE=15.22
random_state=72 → R²=-1.658, MAE=9.72
random_state=73 → R²=0.219, MAE=8.33
random_state=74 → R²=0.492, MAE=8.80
random_state=75 → R²=-0.154, MAE=21.04
random_state=76 → R²=-0.035, MAE=8.05
random_state=77 → R²=0.688, MAE=8.71
random_state=78 → R²=0.372, MAE=13.43
random_state=79 → R²=0.420, MAE=9.76
random_state=80 → R²=0.314, MAE=16.06
random_state=81 → R²=0.678, MAE=7.68
random_state=82 → R²=0.370, MAE=9.06
random_state=83 → R²=0.438, MAE=13.72
random_state=84 → R²=0.331, MAE=7.73
random_state=85 → R²=0.376, MAE=10.97
random_state=86 → R²=0.631, MAE=8.61
random_state=87 → R²=0.276, MAE=19.94
random_state=88 → R²=0.214, MAE=17.60
random_state=89 → R²=0.575, MAE=10.57
random_state=90 → R²=0.251, MAE=21.98
random_state=91 → R²=0.313, MAE=9.83
random_state=92 → R²=0.437, MAE=9.34
random_state=93 → R²=-0.271, MAE=8.62
random_state=94 → R²=0.379, MAE=16.44
random_state=95 → R²=-0.031, MAE=17.56
random_state=96 → R²=0.688, MAE=5.18
random_state=97 → R²=0.182, MAE=18.47
random_state=98 → R²=-0.069, MAE=13.79
random_state=99 → R²=0.810, MAE=6.26
random_state=100 → R²=0.470, MAE=16.05
random_state=101 → R²=0.536, MAE=15.17
random_state=102 → R²=0.380, MAE=12.76
random_state=103 → R²=-0.029, MAE=21.84
random_state=104 → R²=0.812, MAE=4.58
random_state=105 → R²=0.263, MAE=17.08
random_state=106 → R²=-0.056, MAE=16.21
random_state=107 → R²=0.480, MAE=10.85
random_state=108 → R²=0.494, MAE=10.11
random_state=109 → R²=0.343, MAE=16.41
random_state=110 → R²=-0.006, MAE=12.86
random_state=111 → R²=0.554, MAE=9.87
random_state=112 → R²=0.456, MAE=10.20
random_state=113 → R²=0.511, MAE=12.18
random_state=114 → R²=0.177, MAE=19.88
random_state=115 → R²=0.067, MAE=11.69
random_state=116 → R²=-0.074, MAE=11.27
random_state=117 → R²=-0.251, MAE=10.75
random_state=118 → R²=0.021, MAE=10.36
random_state=119 → R²=0.194, MAE=12.32
random_state=120 → R²=-0.231, MAE=22.71
random_state=121 → R²=0.258, MAE=7.10
random_state=122 → R²=0.754, MAE=5.75
random_state=123 → R²=0.690, MAE=6.74
random_state=124 → R²=-0.165, MAE=17.87
random_state=125 → R²=0.258, MAE=15.58
random_state=126 → R²=0.064, MAE=21.51
random_state=127 → R²=0.201, MAE=6.91
random_state=128 → R²=0.089, MAE=22.42
random_state=129 → R²=0.129, MAE=15.32
random_state=130 → R²=-0.513, MAE=11.71
random_state=131 → R²=-1.737, MAE=10.44
random_state=132 → R²=0.511, MAE=11.53
random_state=133 → R²=0.483, MAE=7.12
random_state=134 → R²=-2.222, MAE=12.40
random_state=135 → R²=0.167, MAE=18.65
random_state=136 → R²=-0.207, MAE=13.72
random_state=137 → R²=-0.013, MAE=14.49
random_state=138 → R²=0.091, MAE=12.62
random_state=139 → R²=0.305, MAE=19.72
random_state=140 → R²=-0.322, MAE=14.09
random_state=141 → R²=-0.561, MAE=5.93
random_state=142 → R²=-0.491, MAE=18.69
random_state=143 → R²=-0.058, MAE=15.45
random_state=144 → R²=0.350, MAE=8.67
random_state=145 → R²=0.345, MAE=15.44
random_state=146 → R²=-0.307, MAE=15.84
random_state=147 → R²=0.282, MAE=21.96
random_state=148 → R²=0.068, MAE=8.26
random_state=149 → R²=0.589, MAE=10.20
random_state=150 → R²=0.516, MAE=9.40
random_state=151 → R²=0.522, MAE=12.34
random_state=152 → R²=0.548, MAE=10.57
random_state=153 → R²=-0.071, MAE=12.86
random_state=154 → R²=0.358, MAE=14.39
random_state=155 → R²=-0.016, MAE=9.89
random_state=156 → R²=0.376, MAE=14.16
random_state=157 → R²=0.069, MAE=16.88
random_state=158 → R²=0.447, MAE=11.84
random_state=159 → R²=-0.057, MAE=12.94
random_state=160 → R²=-0.233, MAE=15.03
random_state=161 → R²=0.675, MAE=10.04
random_state=162 → R²=0.730, MAE=5.33
random_state=163 → R²=0.109, MAE=15.66
random_state=164 → R²=0.313, MAE=13.71
random_state=165 → R²=0.266, MAE=9.22
random_state=166 → R²=-0.710, MAE=12.47
random_state=167 → R²=-0.435, MAE=20.41
random_state=168 → R²=0.548, MAE=10.15
random_state=169 → R²=0.524, MAE=12.84
random_state=170 → R²=0.590, MAE=8.04
random_state=171 → R²=0.067, MAE=18.16
random_state=172 → R²=0.400, MAE=9.61
random_state=173 → R²=0.155, MAE=9.97
random_state=174 → R²=0.291, MAE=17.04
random_state=175 → R²=0.133, MAE=12.56
random_state=176 → R²=0.454, MAE=16.09
random_state=177 → R²=-0.275, MAE=17.03
random_state=178 → R²=0.563, MAE=10.71
random_state=179 → R²=0.229, MAE=19.72
random_state=180 → R²=0.136, MAE=14.30
random_state=181 → R²=0.733, MAE=6.78
random_state=182 → R²=0.797, MAE=4.79
random_state=183 → R²=-0.249, MAE=18.07
random_state=184 → R²=0.689, MAE=7.81
random_state=185 → R²=0.185, MAE=16.68
random_state=186 → R²=-2.226, MAE=15.35
random_state=187 → R²=0.363, MAE=14.93
random_state=188 → R²=0.183, MAE=13.39
random_state=189 → R²=0.156, MAE=18.55
random_state=190 → R²=0.393, MAE=17.65
random_state=191 → R²=0.163, MAE=12.80
random_state=192 → R²=0.374, MAE=11.79
random_state=193 → R²=-0.028, MAE=14.01
random_state=194 → R²=0.408, MAE=6.87
random_state=195 → R²=0.147, MAE=18.08
random_state=196 → R²=0.494, MAE=10.57
random_state=197 → R²=0.509, MAE=6.71
random_state=198 → R²=-3.531, MAE=11.35
random_state=199 → R²=-0.041, MAE=16.99


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



