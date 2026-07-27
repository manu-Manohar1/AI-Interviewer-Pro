from sqlalchemy.orm import Session
from passlib.context import CryptContext

from . import models, schemas

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def get_user_by_email(db: Session, email: str):
    return (
        db.query(models.User)
        .filter(models.User.email == email)
        .first()
    )


def create_user(db: Session, user: schemas.UserCreate):
    print("PASSWORD:", repr(user.password))
    print("PASSWORD LENGTH:", len(user.password))

    hashed = pwd_context.hash(user.password)

    db_user = models.User(
        name=user.name,
        email=user.email,
        college=user.college,
        hashed_password=hashed,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return pwd_context.verify(
        plain_password,
        hashed_password,
    )