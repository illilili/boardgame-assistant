from fastapi import APIRouter
from concept.schema import ConceptGenerateRequest
from concept.generator import generate_concept

router = APIRouter(prefix="/api/plans")

@router.post("/generate-concept")
def generate_concept_api(req: ConceptGenerateRequest):
    return generate_concept(req.keywords, req.theme)
