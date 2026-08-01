from sqlalchemy.orm import Session

from app.repositories.dashboard_repository import DashboardRepository


class DashboardService:

    @staticmethod
    def get_summary(db: Session):
        return DashboardRepository.get_summary(db)

    @staticmethod
    def monthly_trend(db: Session):
        return DashboardRepository.monthly_trend(db)

    @staticmethod
    def severity_distribution(db: Session):
        return DashboardRepository.severity_distribution(db)

    @staticmethod
    def weather_distribution(db: Session):
        return DashboardRepository.weather_distribution(db)

    @staticmethod
    def road_type_distribution(db: Session):
        return DashboardRepository.road_type_distribution(db)

    @staticmethod
    def dangerous_cities(db: Session):
        return DashboardRepository.dangerous_cities(db)

    @staticmethod
    def heatmap_data(db: Session):

        return DashboardRepository.heatmap_data(db)