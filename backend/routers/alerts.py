from fastapi import APIRouter

from models.alert import Alert
from services.alert_service import get_alerts

router = APIRouter(prefix="/alerts", tags=["Traffic Alerts"])


@router.get("", response_model=list[Alert])
def read_alerts() -> list[Alert]:
    """Return the current, dataset-derived traffic alerts."""
    return get_alerts()

