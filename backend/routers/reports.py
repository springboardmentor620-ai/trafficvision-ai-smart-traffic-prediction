from fastapi import APIRouter, Query

from services.reports_service import get_report

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("")
def read_report(period: str = Query(default="daily", pattern="^(daily|weekly|monthly)$")) -> dict:
    return get_report(period)

