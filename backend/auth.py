from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt


# =========================================================
# JWT CONFIGURATION
# =========================================================

SECRET_KEY = "society-maintenance-tracker-secret-key-2026"

ALGORITHM = "HS256"

# Token valid for 24 hours
ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60


# =========================================================
# BEARER AUTHENTICATION
# =========================================================

security = HTTPBearer()


# =========================================================
# CREATE ACCESS TOKEN
# =========================================================

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({
        "exp": expire
    })

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


# =========================================================
# VERIFY ACCESS TOKEN
# =========================================================

def verify_access_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={
            "WWW-Authenticate": "Bearer"
        }
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")
        role = payload.get("role")

        if user_id is None:
            raise credentials_exception

        if role is None:
            raise credentials_exception

        return payload

    except JWTError:
        raise credentials_exception


# =========================================================
# ADMIN AUTHORIZATION
# =========================================================

def require_admin(
    payload=Depends(verify_access_token)
):
    role = payload.get("role")
    user_id = payload.get("sub")

    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return {
        "user_id": int(user_id),
        "role": role
    }