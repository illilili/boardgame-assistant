from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, ConfigDict
from typing import Any, Optional

from .service import translate_sync  # ⬅️ 동기 함수로 변경

router = APIRouter(prefix="/api/translate", tags=["translate"])

class ContentPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    content_id: int = Field(..., alias="contentId")
    content_type: str = Field(..., alias="contentType")
    content_data: Any = Field(..., alias="contentData")  # dict or str

class TranslateProcessRequest(BaseModel):
    translation_id: int = Field(..., alias="translationId")
    target_language: str = Field(..., alias="targetLanguage")
    feedback: Optional[str] = None
    content: ContentPayload

class TranslateProcessResponse(BaseModel):
    translation_id: int = Field(..., alias="translationId")
    translated_data: str = Field(..., alias="translatedData")  # JSON string

@router.post("/process", response_model=TranslateProcessResponse, response_model_by_alias=True)
def translate_process(req: TranslateProcessRequest):
    """
    스프링이 호출 → 여기서 OpenAI까지 돌리고
    번역된 payload(JSON 문자열)를 응답으로 바로 반환(동기).
    """
    try:
        translated_json_str = translate_sync(
            translation_id=req.translation_id,
            target_language=req.target_language,
            feedback=req.feedback,
            content=req.content.model_dump(by_alias=True),
        )
        return TranslateProcessResponse(
            translationId=req.translation_id,
            translatedData=translated_json_str,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
