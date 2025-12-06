# app/schemas/user_schema.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.schemas.enums import UserRole

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: Optional[UserRole] = UserRole.builder

class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True
