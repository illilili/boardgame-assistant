import os
import json
import argparse
import numpy as np
import pandas as pd
from pathlib import Path
from typing import List
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

MODEL_NAMES = {
    "mini": "paraphrase-MiniLM-L6-v2",
    "mini12": "all-MiniLM-L12-v2",
    "qa": "multi-qa-MiniLM-L6-cos-v1",
    "t5": "sentence-transformers/gtr-t5-base",
}

def build_candidate_texts(df: pd.DataFrame) -> List[str]:
    """CSV에서 후보 텍스트를 미리 조립한다(카테고리/메커닉/설명)."""
    return [
        f"{str(row.get('category',''))} {str(row.get('mechanic',''))} {str(row.get('Description',''))}"
        for _, row in df.iterrows()
    ]

def main(model_key: str, csv_path: str, out_dir: str):
    if model_key not in MODEL_NAMES:
        raise ValueError(f"지원하지 않는 모델: {model_key}")

    model_name = MODEL_NAMES[model_key]
    out_dir = Path(out_dir) / model_key
    out_dir.mkdir(parents=True, exist_ok=True)

    # 1) 데이터 적재
    df = pd.read_csv(csv_path, encoding="latin1")
    candidates = build_candidate_texts(df)

    # 2) 모델 로드 + 임베딩 계산(배치)
    model = SentenceTransformer(model_name)
    # NOTE: normalize_embeddings=True 로 코사인유사도 점수 계산을 빠르게(dot) 가능하게
    embeddings = model.encode(
        candidates,
        batch_size=256,
        show_progress_bar=True,
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    # 3) 결과 저장
    np.save(out_dir / "embeddings.npy", embeddings)  # (N, D) float32
    with open(out_dir / "candidates.json", "w", encoding="utf-8") as f:
        json.dump(candidates, f, ensure_ascii=False)
    # 메타(행→게임 식별자/이름/링크)도 함께 저장해두면 런타임에서 바로 사용 가능
    meta = []
    for _, row in df.iterrows():
        meta.append({
            "title": row.get("name", "Unknown Game"),
            "game_id": row.get("game_id", None),
            "category": row.get("category", ""),
            "mechanic": row.get("mechanic", ""),
            "Description": row.get("Description", "")
        })
    with open(out_dir / "meta.json", "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False)

    with open(out_dir / "stats.json", "w", encoding="utf-8") as f:
        json.dump({
            "model_key": model_key,
            "model_name": model_name,
            "num_items": len(candidates)
        }, f, ensure_ascii=False)

    print(f"임베딩 인덱스 생성 완료: {out_dir.resolve()}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="mini12", help="mini|mini12|qa|t5 중 선택")
    parser.add_argument("--csv", default=str(Path(__file__).resolve().parent.parent / "pricing" / "data" / "bgg_data.csv"))
    parser.add_argument("--out", default=str(Path(__file__).resolve().parent / "cache"))
    args = parser.parse_args()
    main(args.model, args.csv, args.out)
