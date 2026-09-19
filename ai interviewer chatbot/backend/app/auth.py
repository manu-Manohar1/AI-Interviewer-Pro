import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt

# SECRET_KEY has no fallback on purpose: a JWT signing key that defaults to a
# value visible in source control lets anyone forge a valid token for any
# user. Set SECRET_KEY in the environment (Render dashboard, or locally in
# .env) or the app will refuse to start.
SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Generates a signed JWT access token with an expiration claim.
    """
    to_encode = data.copy()

    # Use timezone-aware UTC datetime
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
