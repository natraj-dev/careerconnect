from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from app.models.user import UserRole


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.JOB_SEEKER
    first_name: str
    last_name: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


class PasswordReset(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


class UserResponse(BaseModel):
    id: int
    email: str
    role: UserRole
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True


class RefreshToken(BaseModel):
    refresh_token: str
