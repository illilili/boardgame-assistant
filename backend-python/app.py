import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# .env 파일 로드 /
load_dotenv()

from concept.router import router as concept_router
from goal.router import router as goal_router
from rule.router import router as rule_router
from component.router import router as component_router #
from card_text.router import router as card_text_router
from card_image.router import router as card_image_router
from thumbnail.router import router as thumbnail_router
from model3d.router import router as model3d_router
from rulebook.router import router as rulebook_router 
from balance.router import router as balance_router
from summary.router import router as summary_router
from translate.router import router as translate_router 
from pricing.api import router as pricing_router
from copyright.router import router as copyright_router
from game_translation.router import router as translation_router


app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React 개발 서버
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(concept_router)
app.include_router(goal_router)
app.include_router(rule_router)
app.include_router(component_router)
app.include_router(balance_router)
app.include_router(summary_router)
app.include_router(card_text_router)
app.include_router(card_image_router)
app.include_router(thumbnail_router)
app.include_router(model3d_router)
app.include_router(rulebook_router) 
app.include_router(translate_router) 
app.include_router(pricing_router)
app.include_router(copyright_router)
app.include_router(translation_router, prefix="/api/translation", tags=["게임 번역"])
