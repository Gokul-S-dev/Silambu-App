from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class SignupRequest(BaseModel):
    name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(
        min_length=8,
        max_length=72,
    )
    child_name: Optional[str] = None
    child_age: Optional[int] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length=8,
        max_length=72,
    )


class ChildResponse(BaseModel):
    name: str
    age: Optional[int] = None
    device_id: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class UserResponse(BaseModel):
    id: int
    name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    is_active: bool
    avatar_url: Optional[str] = None
    google_id: Optional[str] = None
    created_at: Optional[datetime] = None
    child: Optional[ChildResponse] = None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[UserResponse] = None


class GoogleAuthRequest(BaseModel):
    id_token: Optional[str] = None
    access_token: Optional[str] = None
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    picture: Optional[str] = None
