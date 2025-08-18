from sentence_transformers import util
import time

def compute_similarity(model, input_text: str, candidates: list[str]):
    start = time.time()
    input_emb = model.encode(input_text, convert_to_tensor=True)
    candidate_embs = model.encode(candidates, convert_to_tensor=True)
    end = time.time()
    print(f"⏱️ 모델 임베딩 시간: {end - start:.2f}초")
    
    scores = util.pytorch_cos_sim(input_emb, candidate_embs)[0]
    return scores.cpu().tolist()