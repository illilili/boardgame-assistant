from fastapi import APIRouter
from concept.schema import ConceptGenerateRequest, ConceptGenerateResponse, ConceptRegenerateRequest, ConceptExpansionRequest, ConceptExpansionResponse
from concept.generator import generate_concept, regenerate_concept, expand_concept

router = APIRouter(prefix="/api/plans")

@router.post("/generate-concept", response_model=ConceptGenerateResponse)
def generate_concept_api(req: ConceptGenerateRequest):
    return generate_concept(req.theme, req.playerCount, req.averageWeight)

@router.post("/regenerate-concept", response_model=ConceptGenerateResponse)
def regenerate_concept_api(req: ConceptRegenerateRequest):
    return regenerate_concept(req.conceptId, req.feedback, req.planId)

@router.post("/expand-concept", response_model=ConceptExpansionResponse)
def expand_concept_api(req: ConceptExpansionRequest):
    return expand_concept(req.conceptId, req.focus, req.detailLevel)

