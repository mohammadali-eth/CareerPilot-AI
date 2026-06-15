from typing import Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from repositories.base import BaseRepository
from models.user import User, Profile, AuthToken


class UserRepository(BaseRepository[User]):
    """
    Data-access operations for the User model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(User, db)

    async def get(self, id: UUID) -> Optional[User]:
        """
        Retrieve a user record by ID and load their associated profile.
        """
        query = (
            select(User)
            .where(User.id == id)
            .options(selectinload(User.profile))
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        """
        Retrieve a user record and load their associated profile.
        """
        query = (
            select(User)
            .where(User.email == email)
            .options(selectinload(User.profile))
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_verification_token(self, token: str) -> Optional[User]:
        """
        Locate a user record matching a specific verification token.
        """
        query = select(User).where(User.verification_token == token)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_reset_token(self, token: str) -> Optional[User]:
        """
        Locate a user record matching an unexpired password reset token.
        """
        query = (
            select(User)
            .where(User.reset_token == token)
            .where(User.reset_token_expires > datetime.utcnow())
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()


class ProfileRepository(BaseRepository[Profile]):
    """
    Data-access operations for the User Profile model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(Profile, db)

    async def get_by_user_id(self, user_id: UUID) -> Optional[Profile]:
        """
        Locate a profile linked to a specific user.
        """
        query = select(Profile).where(Profile.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()


class TokenRepository(BaseRepository[AuthToken]):
    """
    Data-access operations for the AuthToken sessions model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(AuthToken, db)

    async def get_by_jti(self, jti: str) -> Optional[AuthToken]:
        """
        Locate token session details matching the JWT ID (jti).
        """
        query = select(AuthToken).where(AuthToken.token_jti == jti)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create_token_session(
        self, user_id: UUID, token_jti: str, expires_at: datetime
    ) -> AuthToken:
        """
        Log a new refresh token session entry.
        """
        token_obj = AuthToken(
            user_id=user_id,
            token_jti=token_jti,
            expires_at=expires_at,
            is_revoked=False
        )
        self.db.add(token_obj)
        await self.db.commit()
        await self.db.refresh(token_obj)
        return token_obj

    async def revoke_token(self, jti: str) -> bool:
        """
        Mark a specific refresh token session as revoked.
        """
        token_obj = await self.get_by_jti(jti)
        if token_obj:
            token_obj.is_revoked = True
            self.db.add(token_obj)
            await self.db.commit()
            return True
        return False

    async def revoke_all_user_tokens(self, user_id: UUID) -> None:
        """
        Mark all refresh tokens for a specific user as revoked (Security fail-safe).
        """
        from sqlalchemy import update
        query = (
            update(AuthToken)
            .where(AuthToken.user_id == user_id)
            .values(is_revoked=True)
        )
        await self.db.execute(query)
        await self.db.commit()
