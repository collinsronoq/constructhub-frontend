# app/main.py
from fastapi import FastAPI
import os
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import ensure_database_schema, engine
from app.core.logging import setup_logger
from app.routers import root
from app.routers.technician_routes.technician_profile import router as technician_profile_router
from app.routers.technician_routes.technician_directory import router as technician_directory_router
from app.routers.technician_routes.technician_uploads_route import router as  technician_uploads_router
from app.routers.vendor_routes.vendor_profile import router as vendor_profile_router
from app.routers.vendor_routes.vendor_directory import router as vendor_directory_router
from app.routers.vendor_routes.vendor_items import router as vendor_items_router
from app.routers.vendor_routes.vendor_uploads import router as vendor_uploads_router
from app.routers.admin_certification_routes import router as admin_certification_router
from app.auth.auth_routes import router as auth_router
from app.routers.estimation import router as estimation_router
from app.routers.recommendations import router as recommendations_router
from app.routers.article_routes import router as article_router
from app.routers.marketplace_routes import router as marketplace_router
from app.routers.ai_router import router as ai_router

logger = setup_logger("app.main")



@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensure_database_schema()
    try:
        yield
    finally:
        logger.warning("Disposing database engine...")
        await engine.dispose()
        logger.warning("Database engine disposed.")

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG, lifespan=lifespan)

# CORS - allow frontend origin(s)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.include_router(root.router)
app.include_router(auth_router)
app.include_router(estimation_router)
app.include_router(recommendations_router)
app.include_router(article_router)
app.include_router(marketplace_router)

# technician related njia
app.include_router(technician_profile_router)
app.include_router(technician_directory_router)
app.include_router(technician_uploads_router)
app.include_router(admin_certification_router)

# vendor related
app.include_router(vendor_profile_router)
app.include_router(vendor_directory_router)
app.include_router(vendor_items_router)
app.include_router(vendor_uploads_router)


# ai router
app.include_router(ai_router)

os.makedirs("app/static/uploads/technicians/profile_images", exist_ok=True)
os.makedirs("app/static/uploads/technicians/certifications", exist_ok=True)

app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/", tags=["Root"])
async def root():
    logger.info("Root endpoint accessed")
    return {
        "message": "Welcome to the Construct Hub API",
        "version": "1.0.0",
        "docs": "/docs"
    }

