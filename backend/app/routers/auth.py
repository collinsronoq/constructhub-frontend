from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
def register_user(db: Session = Depends(get_db)):
    return {"status": "pending implementation"}

@router.post("/login")
def login_user(db: Session = Depends(get_db)):
    return {"status": "pending implementation"}
