from fastapi import FastAPI
from concept.router import router as concept_router

app = FastAPI()
app.include_router(concept_router)