from pricing.api import router as pricing_router

app = FastAPI()
app.include_router(pricing_router)
