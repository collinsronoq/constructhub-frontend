# app/main.py
from fastapi import FastAPI
import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, AsyncSessionLocal
from app.core.logging import setup_logger
from app.models.base import Base
from app.routers import root
from app.routers.technician_routes.technician_profile import router as technician_profile_router
from app.routers.technician_routes.technician_directory import router as technician_directory_router
from app.routers.technician_routes.technician_uploads_route import router as  technician_uploads_router
from app.auth.auth_routes import router as auth_router
from app.routers.estimation import router as estimation_router
from app.routers.recommendations import router as recommendations_router

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
app.include_router(estimation_router)
app.include_router(recommendations_router)

# technician related njia
app.include_router(technician_profile_router)
app.include_router(technician_directory_router)
app.include_router(technician_uploads_router)

os.makedirs("app/static/uploads/technicians/profile_images", exist_ok=True)
os.makedirs("app/static/uploads/technicians/certifications", exist_ok=True)

app.mount("/static", StaticFiles(directory="app/static"), name="static")

# create tables on startup if desired (for dev only)
# @app.on_event("startup")
# async def on_startup():
#     import sqlalchemy
#     logger.info("Application startup - connecting to DB")
    # Create tables if using synchronous create_all is acceptable for dev:
    # For async, you can run migrations via Alembic; avoid create_all in production.

# Create all tables
# Base.metadata.create_all(bind=engine)


