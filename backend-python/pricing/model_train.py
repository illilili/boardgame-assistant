"""
가격 예측 모델 학습 스크립트
- 입력 CSV: pricing/data/bgg_data.csv
- 출력 모델: pricing/models/price_predictor.pkl, feature_avg_dicts.pkl
"""

import ast
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

# === 경로 설정 ===
BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR / "data" / "bgg_data.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


# ------------ 유틸 ------------
def parse_list(val):
    """문자열/단일값을 안전하게 리스트로 변환"""
    if pd.isna(val):
        return []
    if isinstance(val, list):
        return val
    if isinstance(val, str):
        s = val.strip()
        try:
            # "[...]" 형태면 literal_eval, 아니면 단일 값을 리스트 처리
            return ast.literal_eval(s) if s.startswith("[") else [s]
        except Exception:
            return [s]
    return []


def pick_col(df: pd.DataFrame, candidates: list[str], default: str | None = None):
    """여러 후보 중 존재하는 첫 컬럼명 반환, 없으면 default"""
    for c in candidates:
        if c in df.columns:
            return c
    return default


def ensure_list_column(df: pd.DataFrame, src_col: str | None, dest_col: str):
    """src_col이 있으면 parse_list 적용, 없으면 빈 리스트 컬럼 생성"""
    if src_col and src_col in df.columns:
        df[dest_col] = df[src_col].apply(parse_list)
    else:
        df[dest_col] = [[] for _ in range(len(df))]


# ------------ 메인 ------------
def main():
    if not CSV_PATH.exists():
        raise FileNotFoundError(f"CSV가 없습니다: {CSV_PATH}")

    # 인코딩 이슈 방지용: 우선 latin1, 실패하면 utf-8 시도
    try:
        df = pd.read_csv(CSV_PATH, encoding="latin1")
    except Exception:
        df = pd.read_csv(CSV_PATH, encoding="utf-8")

    print("📎 CSV 컬럼:", list(df.columns)[:50])

    # ---- 가격 컬럼 탐색 및 정리 ----
    price_col = pick_col(df, ["amazon_price", "price", "usd_price"])
    if not price_col:
        raise ValueError("가격 컬럼(amazon_price/price/usd_price)을 찾을 수 없습니다.")
    # 가격 문자열 → 숫자
    df[price_col] = df[price_col].astype(str).replace(r"[\$,]", "", regex=True)
    df["amazon_price"] = pd.to_numeric(df[price_col], errors="coerce")

    # ---- 숫자 feature 컬럼 탐색 ----
    min_age_col = pick_col(df, ["min_age", "age", "min_age_required"])
    weight_col = pick_col(df, ["average_weight", "weight", "complexity"])

    df["min_age"] = pd.to_numeric(df[min_age_col], errors="coerce") if min_age_col else np.nan
    df["average_weight"] = pd.to_numeric(df[weight_col], errors="coerce") if weight_col else np.nan

    # ---- 리스트형 컬럼 생성 (없어도 안전) ----
    category_col = pick_col(df, ["category", "categories"])
    type_col = pick_col(df, ["type", "types"])
    component_col = pick_col(df, ["component", "components", "materials"])

    ensure_list_column(df, category_col, "category_list")
    ensure_list_column(df, type_col, "type_list")
    ensure_list_column(df, component_col, "component_list")

    # ---- 타깃 정리 (결측/이상치 제거) ----
    before = len(df)
    df = df.dropna(subset=["amazon_price"])
    df = df[df["amazon_price"] <= 200]  # 극단치 컷
    print(f"🧹 가격 결측/이상치 제거: {before} -> {len(df)} rows")

    # ---- 항목별 평균가 사전 ----
    def get_mean_dict(df_, list_col, target_col="amazon_price"):
        total, count = {}, {}
        for _, row in df_.iterrows():
            for k in row[list_col]:
                total[k] = total.get(k, 0.0) + row[target_col]
                count[k] = count.get(k, 0) + 1
        return {k: total[k] / count[k] for k in total}

    cat_avg = get_mean_dict(df, "category_list")
    type_avg = get_mean_dict(df, "type_list")

    # ---- 행별 평균 feature ----
    def avg_from(d, keys):
        vals = [d[k] for k in keys if k in d]
        return float(np.mean(vals)) if vals else np.nan

    df["category_avg_price"] = df["category_list"].apply(lambda ks: avg_from(cat_avg, ks))
    df["type_avg_price"] = df["type_list"].apply(lambda ks: avg_from(type_avg, ks))
    df["component_count"] = df["component_list"].apply(len)

    # 학습에 필요한 숫자 컬럼이 없으면 중단
    if df["min_age"].isna().all() or df["average_weight"].isna().all():
        raise ValueError("min_age/average_weight 중 최소 하나의 유효 값이 필요합니다.")

    # ---- 학습 데이터 구성 ----
    feature_cols = ["category_avg_price", "type_avg_price", "min_age", "average_weight", "component_count"]
    df = df.dropna(subset=["min_age", "average_weight"])
    X = df[feature_cols].fillna(-1)
    y = df["amazon_price"]

    # ---- 모델 학습 ----
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=104)
    model = RandomForestRegressor(random_state=104)
    model.fit(X_tr, y_tr)
    y_pred = model.predict(X_te)

    mae = mean_absolute_error(y_te, y_pred)
    r2 = r2_score(y_te, y_pred)
    print(f"✅ MAE: {mae:.2f} | R^2: {r2:.3f}")

    # ---- 저장 ----
    joblib.dump(model, MODEL_DIR / "price_predictor.pkl")
    joblib.dump({"cat_avg": cat_avg, "type_avg": type_avg}, MODEL_DIR / "feature_avg_dicts.pkl")
    print(f"💾 저장 완료 → {MODEL_DIR}")


if __name__ == "__main__":
    main()
