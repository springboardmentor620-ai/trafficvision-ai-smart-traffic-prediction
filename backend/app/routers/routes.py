from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.services.route_service import RouteService

router = APIRouter(
    prefix="/routes",
    tags=["Route Optimization"],
)


@router.get("/optimize")
def optimize(
    source: str,
    destination: str,
    db: Session = Depends(get_db),
):

    return RouteService.optimize_route(
        db,
        source,
        destination,
    )