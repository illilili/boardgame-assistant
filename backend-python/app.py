from fastapi import FastAPI
from goal.router import router as goal_router

app = FastAPI()
app.include_router(goal_router)