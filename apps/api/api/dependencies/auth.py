import logging
from typing import List
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.security import decode_token
from database.session import get_db
from models.user import User
from repositories.user import UserRepository

logger = logging.getLogger("careerpilot.auth.deps")
security_bearer = HTTPBearer(auto_error=True)


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security_bearer)
) -> User:
    """
    Decodes the Bearer token, validates expiry, and returns the current User object.
    """
    token = credentials.credentials
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        token_type = payload.get("type")

        if token_type != "access" or user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid access token scopes.",
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token has expired.",
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token credentials.",
        )

    # Fetch user from database
    user_repo = UserRepository(db)
    user_obj = await user_repo.get(UUID(user_id))
    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with this token does not exist.",
        )
    return user_obj


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Enforces active user check.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )
    return current_user


async def get_current_active_verified_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Enforces email verification checks for protected access.
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email address must be verified to access this resource.",
        )
    return current_user


async def get_current_active_superuser(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Enforces superuser / administrator check.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient administrative permissions.",
        )
    return current_user


class RoleChecker:
    """
    Custom Dependency to enforce role-based access control (RBAC).
    """

    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(
        self, current_user: User = Depends(get_current_active_user)
    ) -> User:
        if current_user.role not in self.allowed_roles:
            logger.warning(
                f"Access Denied: User {current_user.id} with role '{current_user.role}' "
                f"attempted to access endpoint restricted to {self.allowed_roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )
        return current_user
