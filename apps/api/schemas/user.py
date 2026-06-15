from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr


class UserRegister(UserBase):
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)


class UserLogin(UserBase):
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    type: Optional[str] = None
    exp: Optional[int] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")


class EmailVerifyRequest(BaseModel):
    token: str


class ProfileResponse(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    target_role: Optional[str] = None
    current_experience_level: Optional[str] = None

    class Config:
        from_attributes = True


class UserProfileResponse(UserBase):
    id: UUID
    role: str
    is_active: bool
    is_verified: bool
    profile: Optional[ProfileResponse] = None

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    target_role: Optional[str] = Field(None, max_length=100)
    current_experience_level: Optional[str] = Field(None, max_length=50)
