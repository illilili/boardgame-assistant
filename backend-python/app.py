from fastapi import FastAPI
# from thumbnail import dalle
from thumbnail.dalle import router as thumbnail_router

app = FastAPI()
app.include_router(thumbnail_router)