from fastapi import APIRouter
from concept.schema import ConceptGenerateRequest, ConceptGenerateResponse
from concept.generator import generate_concept

router = APIRouter(prefix="/api/plans")

@router.post("/generate-concept", response_model=ConceptGenerateResponse)
def generate_concept_api(req: ConceptGenerateRequest):
    return generate_concept(req.theme, req.playerCount, req.averageWeight)
