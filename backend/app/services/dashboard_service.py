from sqlalchemy.orm import Session

from app.repositories.dashboard_repository import DashboardRepository


class DashboardService:

    @staticmethod
    def get_summary(db: Session):

        return DashboardRepository.get_summary(db)

    @staticmethod
    def severity(db: Session):

        return DashboardRepository.severity_distribution(db)

    @staticmethod
    def weather(db: Session):

        return DashboardRepository.weather_distribution(db)

    @staticmethod
    def traffic(db: Session):

        return DashboardRepository.traffic_distribution(db)

    @staticmethod
    def cities(db: Session):

        return DashboardRepository.top_cities(db)