from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    college: str
    password: str


class UserRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    college: str | None = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str