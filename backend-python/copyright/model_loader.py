from sentence_transformers import SentenceTransformer

MODEL_NAMES = {
    "mini": "paraphrase-MiniLM-L6-v2",
    "mini12": "all-MiniLM-L12-v2",
    "qa": "multi-qa-MiniLM-L6-cos-v1",
    "t5": "sentence-transformers/gtr-t5-base"
}

def load_model(name: str):
    if name not in MODEL_NAMES:
        raise ValueError(f"지원하지 않는 모델: {name}")
    return SentenceTransformer(MODEL_NAMES[name])