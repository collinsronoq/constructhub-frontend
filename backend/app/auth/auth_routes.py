# app/auth/routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.auth_schema import RegisterRequest, LoginRequest, AuthResponse
from app.schemas.user_schema import UserResponse, UserCreate
from app.models.user import User
from app.auth.dependencies import get_current_user
from app.auth.hashing import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
from app.core.logging import setup_logger

logger = setup_logger("auth.routes")
router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=AuthResponse)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # check existing
    q = await db.execute(select(User).where(User.email == payload.email))
    existing = q.scalars().first()
    if existing:
        logger.warning(f"Registration attempt with existing email: {payload.email}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    hashed = hash_password(payload.password)
    new_user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hashed,
        role=payload.role
        
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # issue token
    token_payload = {"sub": str(new_user.id), "name": new_user.name, "email": new_user.email, "role": new_user.role}
    token = create_access_token(token_payload)

    logger.info(f"User registered: {new_user.email} (role={new_user.role})")
    return {"access_token": token, "token_type": "bearer", "user": UserResponse.model_validate(new_user)}

@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(User).where(User.email == payload.email))
    user = q.scalars().first()
    if not user:
        logger.warning(f"Login failed - unknown email: {payload.email}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(payload.password, user.hashed_password):
        logger.warning(f"Login failed - invalid password: {payload.email}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token_payload = {"sub": str(user.id), "name": user.name, "email": user.email, "role": user.role}
    token = create_access_token(token_payload)
    logger.info(f"User logged in: {user.email} (role={user.role})")

    return {"access_token": token, "token_type": "bearer", "user": UserResponse.model_validate(user)}

@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    
    return UserResponse.model_validate(current_user)
    # raise HTTPException(status_code=501, detail="Use /auth/me with dependency injection")
