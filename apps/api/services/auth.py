import logging
import secrets
from datetime import datetime, timedelta, timezone
from typing import Tuple
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from core.config import settings
from models.user import User, Profile
from repositories.user import UserRepository, TokenRepository, ProfileRepository
from schemas.user import UserRegister, UserLogin, Token, ResetPasswordRequest

logger = logging.getLogger("careerpilot.auth")


class AuthService:
    """
    Service Layer encapsulating the core business rules for user authentication,
    lifecycle management, session state rotation, and verification security.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.token_repo = TokenRepository(db)
        self.profile_repo = ProfileRepository(db)

    async def register_user(self, schema: UserRegister) -> User:
        """
        Register a new User profile and setup their empty profile metadata.
        """
        existing_user = await self.user_repo.get_by_email(schema.email)
        if existing_user:
            logger.warning(f"Registration failure: Email {schema.email} already exists.")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists.",
            )

        # Generate unique verification token
        verify_token = secrets.token_urlsafe(32)

        # Hash credentials and persist user transaction
        hashed_password = get_password_hash(schema.password)
        user_data = {
            "email": schema.email,
            "hashed_password": hashed_password,
            "is_active": True,
            "is_verified": False,
            "role": "user",
            "verification_token": verify_token,
        }
        
        user_obj = await self.user_repo.create(obj_in=user_data)

        # Create linked Profile object
        profile_data = {
            "user_id": user_obj.id,
            "first_name": schema.first_name,
            "last_name": schema.last_name,
        }
        await self.profile_repo.create(obj_in=profile_data)
        
        # Commit profile details
        await self.db.commit()

        logger.info(f"User registered successfully: ID {user_obj.id}, Email {user_obj.email}")
        return user_obj

    async def login_user(self, schema: UserLogin) -> Token:
        """
        Verify credentials and return access/refresh token pair.
        """
        user_obj = await self.user_repo.get_by_email(schema.email)
        if not user_obj:
            logger.warning(f"Login failed: User not found for email {schema.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
            )

        if not verify_password(schema.password, user_obj.hashed_password):
            logger.warning(f"Login failed: Invalid password for user ID {user_obj.id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
            )

        if not user_obj.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated.",
            )

        # Generate session tokens
        return await self._create_user_session(user_obj)

    async def refresh_session(self, refresh_token: str) -> Token:
        """
        Rotate active session. Revokes old refresh token and issues a new pair.
        """
        try:
            payload = decode_token(refresh_token)
            jti = payload.get("jti") or payload.get("sub") # JTI checks
            user_id = payload.get("sub")
            token_type = payload.get("type")

            if token_type != "refresh" or jti is None or user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid refresh token structure.",
                )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Expired or invalid refresh token.",
            )

        # Check token status in database
        token_record = await self.token_repo.get_by_jti(jti)
        if not token_record or token_record.is_revoked or token_record.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            if token_record and token_record.is_revoked:
                # Security: Refresh Token Reuse detected! Revoke all tokens for this user!
                logger.warning(f"CRITICAL: Refresh Token Reuse detected for JTI {jti}. Revoking all sessions for user {user_id}!")
                await self.token_repo.revoke_all_user_tokens(UUID(user_id))
            logger.warning(f"Refresh attempt using revoked or expired token: JTI {jti}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session has expired or been revoked.",
            )

        # Revoke the old token session (Rotate tokens)
        await self.token_repo.revoke_token(jti)

        # Fetch the active user
        user_obj = await self.user_repo.get(UUID(user_id))
        if not user_obj or not user_obj.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive or not found.",
            )

        # Issue new rotated session
        return await self._create_user_session(user_obj)

    async def logout_user(self, refresh_token: str) -> None:
        """
        Revoke active token session.
        """
        try:
            payload = decode_token(refresh_token)
            jti = payload.get("jti") or payload.get("sub")
            if jti:
                await self.token_repo.revoke_token(jti)
                logger.info(f"Session revoked successfully for JTI {jti}")
        except Exception as e:
            logger.warning(f"Error during logout token decryption: {e}")
            pass

    async def request_password_reset(self, email: str) -> str:
        """
        Generate password reset token expiring in 1 hour.
        Returns the reset token (in production this token is sent via email services).
        """
        user_obj = await self.user_repo.get_by_email(email)
        if not user_obj:
            # Mitigation for email enumeration attack: return success even if user doesn't exist
            logger.info(f"Password reset requested for non-existing email: {email}")
            return "ok"

        reset_token = secrets.token_urlsafe(32)
        user_obj.reset_token = reset_token
        user_obj.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        
        self.db.add(user_obj)
        await self.db.commit()

        logger.info(f"Password reset token generated for user ID {user_obj.id}")
        return reset_token

    async def confirm_password_reset(self, schema: ResetPasswordRequest) -> None:
        """
        Confirm reset token and update user password.
        """
        user_obj = await self.user_repo.get_by_reset_token(schema.token)
        if not user_obj:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token.",
            )

        # Update password hash and clear tokens
        user_obj.hashed_password = get_password_hash(schema.new_password)
        user_obj.reset_token = None
        user_obj.reset_token_expires = None

        self.db.add(user_obj)
        await self.db.commit()
        logger.info(f"Password reset successfully for user ID {user_obj.id}")

    async def verify_email_token(self, token: str) -> None:
        """
        Verify email verification token.
        """
        user_obj = await self.user_repo.get_by_verification_token(token)
        if not user_obj:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token.",
            )

        user_obj.is_verified = True
        user_obj.verification_token = None

        self.db.add(user_obj)
        await self.db.commit()
        logger.info(f"Email verified successfully for user ID {user_obj.id}")

    async def _create_user_session(self, user: User) -> Token:
        """
        Helper method to generate, save, and return JWT Tokens.
        """
        # Generate token ID (jti) for rotation index
        token_jti = secrets.token_hex(16)
        
        # Access and refresh token generation
        access_token = create_access_token(subject=user.id)
        
        # Attach token JTI to refresh token claims
        refresh_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        refresh_time = datetime.now(timezone.utc) + refresh_expires
        
        refresh_token = create_refresh_token(subject=user.id, jti=token_jti)
        
        # Track active session in database
        await self.token_repo.create_token_session(
            user_id=user.id,
            token_jti=token_jti,
            expires_at=refresh_time
        )

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )
