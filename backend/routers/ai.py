from fastapi import APIRouter

from services.ai_service import get_recommendations

router = APIRouter(prefix="/ai", tags=["AI Insights"])


@router.get("/recommendations")
def read_recommendations() -> dict:
    """Return rule-based travel recommendations derived from processed traffic data."""
    return get_recommendations()

