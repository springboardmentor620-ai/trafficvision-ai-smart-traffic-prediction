from datetime import date
from typing import Optional

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.prediction_history_service import (
    PredictionHistoryService,
)


from app.schemas.prediction_history import (
    PredictionHistoryListResponse,
)
router = APIRouter(
    prefix="/history",
    tags=["Prediction History"],
)


@router.get(
    "",
    response_model=PredictionHistoryListResponse
)
def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    city: Optional[str] = None,
    severity: Optional[str] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    return PredictionHistoryService.get_all(
        db=db,
        page=page,
        limit=limit,
        city=city,
        severity=severity,
        from_date=from_date,
        to_date=to_date,
    )


@router.get("/{history_id}")
def get_history_by_id(
    history_id: int,
    db: Session = Depends(get_db),
):

    history = PredictionHistoryService.get_by_id(
        db,
        history_id,
    )

    if history is None:
        raise HTTPException(
            status_code=404,
            detail="Prediction history not found.",
        )

    return history


@router.delete("/{history_id}")
def delete_history(
    history_id: int,
    db: Session = Depends(get_db),
):

    history = PredictionHistoryService.delete(
        db,
        history_id,
    )

    if history is None:
        raise HTTPException(
            status_code=404,
            detail="Prediction history not found.",
        )

    return {
        "message": "Prediction history deleted successfully."
    }


@router.delete("")
def delete_all_history(
    confirm: bool = Query(
        False,
        description="Set confirm=true to delete all prediction history.",
    ),
    db: Session = Depends(get_db),
):

    if not confirm:
        raise HTTPException(
            status_code=400,
            detail="Confirmation required. Set confirm=true.",
        )

    deleted = PredictionHistoryService.delete_all(db)

    return {
        "message": "All prediction history deleted successfully.",
        "deleted_records": deleted,
    }