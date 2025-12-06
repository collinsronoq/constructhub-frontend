# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, AsyncSessionLocal
from app.core.logging import setup_logger
from app.models.base import Base
from app.routers import root
from backend.app.auth.auth_routes import router as auth_router

logger = setup_logger("app.main")

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

# CORS - allow frontend origin(s)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(root.router)
app.include_router(auth_router)

# create tables on startup if desired (for dev only)
# @app.on_event("startup")
# async def on_startup():
#     import sqlalchemy
#     logger.info("Application startup - connecting to DB")
    # Create tables if using synchronous create_all is acceptable for dev:
    # For async, you can run migrations via Alembic; avoid create_all in production.

# Create all tables
# Base.metadata.create_all(bind=engine)


