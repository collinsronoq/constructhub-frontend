# app/auth/jwt_handler.py
from datetime import datetime, timedelta, timezone
from typing import Dict, Any
import jwt
from app.core.config import settings

def create_access_token(subject: Dict[str, Any], expires_minutes: int | None = None) -> str:
    to_encode = subject.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=(expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded

def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise
    except jwt.InvalidTokenError:
        raise
