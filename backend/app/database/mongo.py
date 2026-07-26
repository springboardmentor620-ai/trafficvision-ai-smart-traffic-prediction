from pymongo import MongoClient
from app.config.settings import settings
import logging

logger = logging.getLogger("trafficvision.mongo")

class MongoDatabase:
    """
    MongoDB Connector for TrafficVision AI Telemetry & Audit Logging.
    
    Declared Collections:
    - VehicleDetectionLogs
    - TrafficLogs
    - NotificationLogs
    - SystemLogs
    - AIResponseLogs
    """
    def __init__(self):
        self.client = None
        self.db = None

    def connect(self):
        """Initialize lazy MongoDB connection without inserting data."""
        try:
            self.client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
            self.db = self.client[settings.MONGODB_DB_NAME]
            logger.info("MongoDB initialized. Target DB: %s", settings.MONGODB_DB_NAME)
        except Exception as e:
            logger.warning("MongoDB connection deferred: %s", str(e))

    def close(self):
        if self.client:
            self.client.close()

    # Collection Accessors
    @property
    def vehicle_detection_logs(self):
        return self.db["VehicleDetectionLogs"] if self.db is not None else None

    @property
    def traffic_logs(self):
        return self.db["TrafficLogs"] if self.db is not None else None

    @property
    def notification_logs(self):
        return self.db["NotificationLogs"] if self.db is not None else None

    @property
    def system_logs(self):
        return self.db["SystemLogs"] if self.db is not None else None

    @property
    def ai_response_logs(self):
        return self.db["AIResponseLogs"] if self.db is not None else None

mongo_db = MongoDatabase()
