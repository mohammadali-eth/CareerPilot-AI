from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from repositories.base import BaseRepository
from models.resume import Resume, ResumeScore, ATSReport


class ResumeRepository(BaseRepository[Resume]):
    """
    Data-access operations for the Resume model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(Resume, db)

    async def get_by_user_id(self, user_id: UUID) -> List[Resume]:
        """
        Retrieve all resumes belonging to a specific user.
        """
        query = (
            select(Resume)
            .where(Resume.user_id == user_id)
            .options(
                selectinload(Resume.scores),
                selectinload(Resume.ats_reports)
            )
            .order_by(desc(Resume.created_at))
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_with_relations(self, resume_id: UUID) -> Optional[Resume]:
        """
        Retrieve a single resume with all child scores and ATS reports loaded.
        """
        query = (
            select(Resume)
            .where(Resume.id == resume_id)
            .options(
                selectinload(Resume.scores),
                selectinload(Resume.ats_reports)
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()


class ResumeScoreRepository(BaseRepository[ResumeScore]):
    """
    Data-access operations for the ResumeScore model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(ResumeScore, db)

    async def get_latest_by_resume_id(self, resume_id: UUID) -> Optional[ResumeScore]:
        """
        Get the most recent score report for a specific resume.
        """
        query = (
            select(ResumeScore)
            .where(ResumeScore.resume_id == resume_id)
            .order_by(desc(ResumeScore.created_at))
            .limit(1)
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()


class ATSReportRepository(BaseRepository[ATSReport]):
    """
    Data-access operations for the ATSReport model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(ATSReport, db)

    async def get_latest_by_resume_id(self, resume_id: UUID) -> Optional[ATSReport]:
        """
        Get the most recent ATS scan report for a specific resume.
        """
        query = (
            select(ATSReport)
            .where(ATSReport.resume_id == resume_id)
            .order_by(desc(ATSReport.created_at))
            .limit(1)
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
