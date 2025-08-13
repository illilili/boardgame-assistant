from pydantic import BaseModel

class ConceptRequest(BaseModel):
    keyword: str
    genre: str

class ExpansionRequest(BaseModel):
    base_concept: str