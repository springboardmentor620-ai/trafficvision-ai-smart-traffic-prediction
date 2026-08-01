from sqlalchemy.orm import Session

from app.repositories.accident_repository import AccidentRepository


class AccidentService:

    
    @staticmethod
    def get_all(
        db: Session,
        page: int,
        limit: int,
        search: str = None,
        weather: str = None,
        severity: str = None,
        traffic_density: str = None,
        road_type: str = None,
        sort_by: str = "accident_id",
        order: str = "asc"
    ):

     return AccidentRepository.get_all(
        db,
        page,
        limit,
        search,
        weather,
        severity,
        traffic_density,
        road_type,
        sort_by,
        order
    )
    

    @staticmethod
    def get_by_id(
        db: Session,
        accident_id: int
    ):
        return AccidentRepository.get_by_id(
            db,
            accident_id
        )