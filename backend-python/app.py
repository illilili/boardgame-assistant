# app.py

from fastapi import FastAPI
# 1. model3d 폴더의 router.py 파일에서 router 객체를 직접 import 합니다.
from model3d.router import router as model3d_router

app = FastAPI()

# 2. prefix를 추가하여 /api/content 경로를 지정합니다.
app.include_router(model3d_router, prefix="/api/content")

@app.get("/")
def read_root():
    return {"message": "API is running"}