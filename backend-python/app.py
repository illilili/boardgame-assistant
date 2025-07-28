# app.py

from fastapi import FastAPI
from model3d.router import router as model3d_router

app = FastAPI()


app.include_router(model3d_router, prefix="/api/content")

@app.get("/")
def read_root():
    return {"message": "API is running"}