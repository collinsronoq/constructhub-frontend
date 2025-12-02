from fastapi import APIRouter

router = APIRouter()

@router.get("/", tags=["Root"])
def home():
    return {"message": "ConstructHub API is running"}
