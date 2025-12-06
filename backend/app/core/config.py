from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Construct Hub API"
    DEBUG: bool = True

    DATABASE_URL: str = "ekalinkhapa"

    SECRET_KEY: str = "ehbdhe"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"


settings = Settings()
