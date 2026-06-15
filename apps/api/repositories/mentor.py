from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, desc, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from repositories.base import BaseRepository
from models.mentor import ChatSession, ChatMessage, ChatExport


class ChatSessionRepository(BaseRepository[ChatSession]):
    """
    Data-access operations for the ChatSession model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(ChatSession, db)

    async def get_by_id_and_user_id(self, session_id: UUID, user_id: UUID) -> Optional[ChatSession]:
        """
        Retrieve a single chat session belonging to a user, with all messages preloaded.
        """
        query = (
            select(ChatSession)
            .where(ChatSession.id == session_id, ChatSession.user_id == user_id)
            .options(selectinload(ChatSession.messages))
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_user_id_sorted(self, user_id: UUID, limit: int = 100) -> List[ChatSession]:
        """
        Retrieve all chat sessions for a user, ordered by pinned first, then updated_at descending.
        """
        query = (
            select(ChatSession)
            .where(ChatSession.user_id == user_id)
            .order_by(desc(ChatSession.pinned), desc(ChatSession.updated_at))
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def search_sessions(self, user_id: UUID, search_query: str) -> List[ChatSession]:
        """
        Search chat sessions by title or summary.
        """
        search_pattern = f"%{search_query}%"
        query = (
            select(ChatSession)
            .where(
                ChatSession.user_id == user_id,
                or_(
                    ChatSession.title.ilike(search_pattern),
                    ChatSession.summary.ilike(search_pattern)
                )
            )
            .order_by(desc(ChatSession.pinned), desc(ChatSession.updated_at))
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())


class ChatMessageRepository(BaseRepository[ChatMessage]):
    """
    Data-access operations for the ChatMessage model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(ChatMessage, db)

    async def get_by_session_id(self, session_id: UUID) -> List[ChatMessage]:
        """
        Retrieve all messages in a session ordered by creation timestamp.
        """
        query = (
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())


class ChatExportRepository(BaseRepository[ChatExport]):
    """
    Data-access operations for the ChatExport model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(ChatExport, db)

    async def get_by_session_id(self, session_id: UUID) -> List[ChatExport]:
        """
        Retrieve all exports for a session.
        """
        query = (
            select(ChatExport)
            .where(ChatExport.session_id == session_id)
            .order_by(desc(ChatExport.created_at))
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
