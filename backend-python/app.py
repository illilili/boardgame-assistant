from fastapi import FastAPI
from concept.router import router as concept_router
from goal.router import router as goal_router
from rule.router import router as rule_router
from card_text.router import router as card_text_router
from card_image.router import router as card_image_router
from thumbnail.router import router as thumbnail_router
from model3d.router import router as model3d_router
from rulebook.router import router as rulebook_router 

app = FastAPI()

app.include_router(concept_router)
app.include_router(goal_router)
app.include_router(rule_router)
app.include_router(card_text_router)
app.include_router(card_image_router)
app.include_router(thumbnail_router)
app.include_router(model3d_router)
app.include_router(rulebook_router) 