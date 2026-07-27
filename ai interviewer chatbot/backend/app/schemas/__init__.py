from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

# Re-export Session schemas
from app.schemas.session import SessionCreateRequest as SessionCreate, SessionResponse


# User & Auth Schemas
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    college: Optional[str] = None


class UserRead(BaseModel):
    id: int
    name: str
    email: str
    college: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str