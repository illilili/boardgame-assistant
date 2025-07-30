from fastapi import FastAPI
from card_text.router import router as card_text_router
from card_image.router import router as card_image_router
from thumbnail.dalle import router as thumbnail_router

app = FastAPI()

app.include_router(card_text_router)
app.include_router(card_image_router)
app.include_router(thumbnail_router)