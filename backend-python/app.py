from fastapi import FastAPI
from goal.router import router as goal_router
from concept.generator import generate_concept, expand_concept
from concept.schema import ConceptRequest, ExpansionRequest

app = FastAPI()
app.include_router(goal_router)

@app.post("/api/plans/generate-concept")
def generate_concept_api(req: ConceptRequest):
    return generate_concept(req.keyword, req.genre)

@app.post("/api/plans/regenerate-concept")
def regenerate_concept_api(req: ConceptRequest):
    return generate_concept(req.keyword, req.genre)  # 동일 로직 재사용

@app.post("/api/plans/expand-concept")
def expand_concept_api(req: ExpansionRequest):
    return expand_concept(req.base_concept)