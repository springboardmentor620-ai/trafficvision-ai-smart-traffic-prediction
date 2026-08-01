from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.exceptions import register_exception_handlers
from app.db.database import Base
from app.db.database import engine
import app.models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TrafficVision AI",
    version="1.0.0"
)

register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def home():

    return {

        "message": "TrafficVision AI Backend Running 🚦"

    }