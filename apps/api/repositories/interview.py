from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from repositories.base import BaseRepository
from models.interview import InterviewSession, InterviewQuestion, InterviewAnswer


class InterviewSessionRepository(BaseRepository[InterviewSession]):
    """
    Data-access operations for the InterviewSession model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(InterviewSession, db)

    async def get_by_user_id(self, user_id: UUID, limit: int = 100) -> List[InterviewSession]:
        """
        Retrieve all interview sessions belonging to a user, ordered by started_at desc.
        """
        query = (
            select(InterviewSession)
            .where(InterviewSession.user_id == user_id)
            .options(
                selectinload(InterviewSession.questions).selectinload(InterviewQuestion.answer)
            )
            .order_by(desc(InterviewSession.started_at))
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_with_relations(self, session_id: UUID) -> Optional[InterviewSession]:
        """
        Retrieve a single interview session with all questions and their evaluations loaded.
        """
        query = (
            select(InterviewSession)
            .where(InterviewSession.id == session_id)
            .options(
                selectinload(InterviewSession.questions).selectinload(InterviewQuestion.answer)
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()


class InterviewQuestionRepository(BaseRepository[InterviewQuestion]):
    """
    Data-access operations for the InterviewQuestion model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(InterviewQuestion, db)

    async def get_by_session_id(self, session_id: UUID) -> List[InterviewQuestion]:
        """
        Get all questions for a specific interview session.
        """
        query = (
            select(InterviewQuestion)
            .where(InterviewQuestion.session_id == session_id)
            .options(selectinload(InterviewQuestion.answer))
            .order_by(InterviewQuestion.created_at)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())


class InterviewAnswerRepository(BaseRepository[InterviewAnswer]):
    """
    Data-access operations for the InterviewAnswer model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(InterviewAnswer, db)

    async def get_by_question_id(self, question_id: UUID) -> Optional[InterviewAnswer]:
        """
        Get an answer associated with a question.
        """
        query = select(InterviewAnswer).where(InterviewAnswer.question_id == question_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
