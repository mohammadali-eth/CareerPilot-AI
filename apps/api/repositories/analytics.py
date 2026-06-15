from typing import List, Optional
from uuid import UUID
from datetime import date
from sqlalchemy import select, desc, and_
from sqlalchemy.ext.asyncio import AsyncSession

from repositories.base import BaseRepository
from models.analytics import AnalyticsReport, AnalyticsSnapshot, UserMetric, ReportExport


class AnalyticsReportRepository(BaseRepository[AnalyticsReport]):
    """
    Data-access operations for the AnalyticsReport model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(AnalyticsReport, db)

    async def get_by_id_and_user_id(self, report_id: UUID, user_id: UUID) -> Optional[AnalyticsReport]:
        """
        Retrieve a single report belonging to a user.
        """
        query = select(AnalyticsReport).where(
            and_(AnalyticsReport.id == report_id, AnalyticsReport.user_id == user_id)
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_user_id_sorted(self, user_id: UUID, limit: int = 100) -> List[AnalyticsReport]:
        """
        Retrieve all reports for a user, ordered by created_at descending.
        """
        query = (
            select(AnalyticsReport)
            .where(AnalyticsReport.user_id == user_id)
            .order_by(desc(AnalyticsReport.created_at))
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())


class AnalyticsSnapshotRepository(BaseRepository[AnalyticsSnapshot]):
    """
    Data-access operations for the AnalyticsSnapshot model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(AnalyticsSnapshot, db)

    async def get_by_user_id_and_date_range(
        self, user_id: UUID, start_date: date, end_date: date
    ) -> List[AnalyticsSnapshot]:
        """
        Retrieve all snapshot trends for a user in a given date range.
        """
        query = (
            select(AnalyticsSnapshot)
            .where(
                and_(
                    AnalyticsSnapshot.user_id == user_id,
                    AnalyticsSnapshot.snapshot_date >= start_date,
                    AnalyticsSnapshot.snapshot_date <= end_date,
                )
            )
            .order_by(AnalyticsSnapshot.snapshot_date)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())


class UserMetricRepository(BaseRepository[UserMetric]):
    """
    Data-access operations for the UserMetric model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(UserMetric, db)

    async def get_by_user_id(self, user_id: UUID) -> Optional[UserMetric]:
        """
        Retrieve the latest cached metrics row for a user.
        """
        query = select(UserMetric).where(UserMetric.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()


class ReportExportRepository(BaseRepository[ReportExport]):
    """
    Data-access operations for the ReportExport model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(ReportExport, db)

    async def get_by_user_id_sorted(self, user_id: UUID, limit: int = 50) -> List[ReportExport]:
        """
        Retrieve all exports for a user, ordered by created_at descending.
        """
        query = (
            select(ReportExport)
            .where(ReportExport.user_id == user_id)
            .order_by(desc(ReportExport.created_at))
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
