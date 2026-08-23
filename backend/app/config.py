from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATA_DIR: str = "/data"
    TEMP_DIR: str = "/tmp"
    DB_EXTENSION: str = ".fernuni.enc"
    API_PREFIX: str = "/api"

    class Config:
        env_file = ".env"


settings = Settings()
