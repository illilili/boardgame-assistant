from pricing.estimate_api import router as pricing_router  
from fastapi import FastAPI

app = FastAPI()
app.include_router(pricing_router)
