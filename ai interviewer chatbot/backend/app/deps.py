from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .database import SessionLocal
from . import crud
from .auth import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")

        if email is None:
            raise HTTPException(
                status_code=401,
                detail="Could not validate credentials",
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
        )

    user = crud.get_user_by_email(db, email)

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
        )

    return user
