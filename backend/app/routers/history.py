from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.services.history_service import HistoryService

router = APIRouter(

    prefix="/history",

    tags=["Historical Analytics"],

)


@router.get("/")

def history(

    db: Session = Depends(get_db),

):

    return HistoryService.traffic_history(db)


@router.get("/summary")

def summary(

    db: Session = Depends(get_db),

):

    return HistoryService.summary(db)


@router.get("/distribution")

def distribution(

    db: Session = Depends(get_db),

):

    return HistoryService.status_distribution(db)