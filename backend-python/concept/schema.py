from pydantic import BaseModel
from typing import List

# dto
class ConceptGenerateRequest(BaseModel):
    keywords: List[str]
    theme: str
