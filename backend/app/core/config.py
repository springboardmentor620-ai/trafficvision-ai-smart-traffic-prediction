from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    APP_NAME: str = "TrafficVision AI"

    APP_VERSION: str = "1.0.0"

    API_PREFIX: str = "/api/v1"

    DEBUG: bool = True

    class Config:
        env_file = ".env"


settings = Settings()