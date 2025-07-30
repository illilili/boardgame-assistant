from fastapi import FastAPI
from pricing.estimate_api import router as pricing_router

app = FastAPI()
app.include_router(pricing_router)
