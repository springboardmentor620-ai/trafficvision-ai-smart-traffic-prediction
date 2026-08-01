from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def home():

    return {
        "project": "TrafficVision AI",
        "status": "Backend Running"
    }


@router.get("/health")
def health():

    return {
        "status": "healthy"
    }