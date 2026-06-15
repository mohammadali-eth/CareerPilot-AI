from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from repositories.base import BaseRepository
from models.roadmap import Roadmap, RoadmapMilestone, RoadmapProgress


class RoadmapRepository(BaseRepository[Roadmap]):
    """
    Data-access operations for the Roadmap model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(Roadmap, db)

    async def get_by_user_id(self, user_id: UUID) -> List[Roadmap]:
        """
        Retrieve all roadmaps belonging to a user.
        """
        query = (
            select(Roadmap)
            .where(Roadmap.user_id == user_id)
            .options(
                selectinload(Roadmap.milestones)
            )
            .order_by(desc(Roadmap.created_at))
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_with_relations(self, roadmap_id: UUID) -> Optional[Roadmap]:
        """
        Retrieve a single roadmap with milestones loaded.
        """
        query = (
            select(Roadmap)
            .where(Roadmap.id == roadmap_id)
            .options(
                selectinload(Roadmap.milestones)
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()


class RoadmapMilestoneRepository(BaseRepository[RoadmapMilestone]):
    """
    Data-access operations for the RoadmapMilestone model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(RoadmapMilestone, db)

    async def get_by_roadmap_id(self, roadmap_id: UUID) -> List[RoadmapMilestone]:
        """
        Get all milestones for a specific roadmap, ordered chronologically by target date.
        """
        query = (
            select(RoadmapMilestone)
            .where(RoadmapMilestone.roadmap_id == roadmap_id)
            .order_by(RoadmapMilestone.target_date)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())


class RoadmapProgressRepository(BaseRepository[RoadmapProgress]):
    """
    Data-access operations for the RoadmapProgress model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(RoadmapProgress, db)

    async def get_by_roadmap_and_milestone(
        self, roadmap_id: UUID, milestone_id: UUID
    ) -> Optional[RoadmapProgress]:
        """
        Find a progress record for a specific roadmap and milestone combination.
        """
        query = select(RoadmapProgress).where(
            RoadmapProgress.roadmap_id == roadmap_id,
            RoadmapProgress.milestone_id == milestone_id,
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
