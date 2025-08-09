from fastapi import APIRouter
from rulebook.schema import RulebookStructuredRequest, RulebookTextResponse
from rulebook.generator import generate_rulebook_text

router = APIRouter()

@router.post("/api/content/generate-rulebook", response_model=RulebookTextResponse)
def generate_rulebook(request: RulebookStructuredRequest):
    text = generate_rulebook_text(request)
    return {
        "contentId": request.contentId,  
        "rulebookText": text
    }