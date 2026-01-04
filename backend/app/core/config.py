from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv


# Load env from project root / backend/.env
load_dotenv(".env")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "Construct Hub API"
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite+aiosqlite:///./dev.db"
    MEDIA_BASE_URL: str = "http://localhost:8000/static"
 
    SECRET_KEY: str = "ehbdhe"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120


settings = Settings()
