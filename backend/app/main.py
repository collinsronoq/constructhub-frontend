from fastapi import FastAPI
from app.core.config import settings
from app.core.database import Base, engine
from app.routers import root, auth

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

# Routers
app.include_router(root.router)
app.include_router(auth.router)
