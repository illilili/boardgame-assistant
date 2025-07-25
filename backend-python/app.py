from fastapi import FastAPI
from description import description_api

app = FastAPI()

# 설명 스크립트 API 라우터 등록
app.include_router(description_api.router)
