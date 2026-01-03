from pydantic_settings import BaseSettings
from dotenv import load_dotenv


load_dotenv("/.env")

class Settings(BaseSettings):
    APP_NAME: str = "Construct Hub API"
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite+aiosqlite:///./dev.db"
    MEDIA_BASE_URL: str = "http://localhost:8000/static"
 
    SECRET_KEY: str = "ehbdhe"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"


settings = Settings()
