from fastapi import APIRouter

from services.analytics_service import get_analytics

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("")
def read_analytics() -> dict:
    """Return dashboard metrics and chart-ready summaries from processed traffic data."""
    return get_analytics()

