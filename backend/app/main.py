from fastapi import FastAPI
from app.database import engine, Base
from app.routes.auth import router as auth_router

from fastapi import Depends
from app.dependencies import get_current_user

import app.models.user

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TrafficVision AI")
app.include_router(auth_router)

@app.get("/")
def home():
    return {
        "message":"TrafficVision AI Backend Running Successfully 🚦"
    }

@app.get("/profile")
def profile(current_user=Depends(get_current_user)):
    return {
        "message": "Welcome!",
        "user": current_user
    }