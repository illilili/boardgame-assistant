from fastapi import FastAPI
from card_text.router import router as card_text_router
from card_image.router import router as card_image_router
from thumbnail.router import router as thumbnail_router
from model3d.router import router as model3d_router
from rulebook.router import router as rulebook_router 
from translate.router import router as translate_router 

app = FastAPI()

app.include_router(card_text_router)
app.include_router(card_image_router)
app.include_router(thumbnail_router)
app.include_router(model3d_router)
app.include_router(rulebook_router) 
app.include_router(translate_router) 