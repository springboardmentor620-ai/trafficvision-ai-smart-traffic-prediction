from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings

def setup_cors(app: FastAPI) -> None:
    """Configures CORS middleware for cross-origin frontend communication."""
    configured_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
    
    default_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    
    all_origins = list(set(configured_origins + default_origins))
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=all_origins,
        allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:[0-9]+)?",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
