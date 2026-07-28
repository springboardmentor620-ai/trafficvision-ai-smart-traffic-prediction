import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    routing_url: str = os.getenv("ROUTING_ENGINE_URL", "https://router.project-osrm.org")
    geocoding_url: str = os.getenv("GEOCODING_URL", "https://nominatim.openstreetmap.org")
    geocoding_user_agent: str = os.getenv("GEOCODING_USER_AGENT", "TrafficVision-AI/1.0 (contact: admin@example.com)")
    request_timeout_seconds: int = int(os.getenv("ROUTING_REQUEST_TIMEOUT", "12"))


settings = Settings()
