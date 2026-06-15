from fastapi import APIRouter, Depends, status, Body

from database.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession

from schemas.user import (
    UserRegister,
    UserLogin,
    Token,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    EmailVerifyRequest,
    UserProfileResponse,
)
from services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user account.
    Fires off initialization hooks and returns email verification reference.
    """
    auth_service = AuthService(db)
    user = await auth_service.register_user(payload)
    return {
        "message": "User registered successfully. Please verify your email.",
        "verification_token": user.verification_token
    }


@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
async def login(
    payload: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate a user session.
    Verifies passwords and returns JWT access and refresh token pair.
    """
    auth_service = AuthService(db)
    return await auth_service.login_user(payload)


@router.post("/refresh", response_model=Token, status_code=status.HTTP_200_OK)
async def refresh(
    refresh_token: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db)
):
    """
    Rotate expired token session using a valid refresh token.
    """
    auth_service = AuthService(db)
    return await auth_service.refresh_session(refresh_token)


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    refresh_token: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db)
):
    """
    Revoke current refresh token and clear active user session.
    """
    auth_service = AuthService(db)
    await auth_service.logout_user(refresh_token)
    return {"message": "Logged out successfully."}


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Request password reset link. Returns reset token.
    """
    auth_service = AuthService(db)
    reset_token = await auth_service.request_password_reset(payload.email)
    return {
        "message": "If this email is registered, a password reset token has been generated.",
        "reset_token": reset_token
    }


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify reset token and execute password hash update.
    """
    auth_service = AuthService(db)
    await auth_service.confirm_password_reset(payload)
    return {"message": "Password has been updated successfully."}


@router.post("/verify-email", status_code=status.HTTP_200_OK)
async def verify_email(
    payload: EmailVerifyRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Confirm email address verification using token.
    """
    auth_service = AuthService(db)
    await auth_service.verify_email_token(payload.token)
    return {"message": "Email address verified successfully."}
