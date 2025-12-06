# app/schemas/auth_schema.py
from pydantic import BaseModel, EmailStr
from app.schemas.user_schema import UserResponse

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class AuthResponse(Token):
    user: UserResponse
