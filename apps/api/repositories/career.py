from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from repositories.base import BaseRepository
from models.career import CareerRecommendation, CareerMatch


class CareerRecommendationRepository(BaseRepository[CareerRecommendation]):
    """
    Data-access operations for the CareerRecommendation model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(CareerRecommendation, db)

    async def get_by_user_id(self, user_id: UUID) -> List[CareerRecommendation]:
        """
        Retrieve all recommendations belonging to a specific user.
        """
        query = (
            select(CareerRecommendation)
            .where(CareerRecommendation.user_id == user_id)
            .options(
                selectinload(CareerRecommendation.matches)
            )
            .order_by(desc(CareerRecommendation.generated_at))
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_with_relations(self, recommendation_id: UUID) -> Optional[CareerRecommendation]:
        """
        Retrieve a single recommendation with all its child matches loaded.
        """
        query = (
            select(CareerRecommendation)
            .where(CareerRecommendation.id == recommendation_id)
            .options(
                selectinload(CareerRecommendation.matches)
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()


class CareerMatchRepository(BaseRepository[CareerMatch]):
    """
    Data-access operations for the CareerMatch model.
    """

    def __init__(self, db: AsyncSession):
        super().__init__(CareerMatch, db)

    async def get_by_recommendation_id(self, recommendation_id: UUID) -> List[CareerMatch]:
        """
        Get all matches for a specific recommendation batch.
        """
        query = (
            select(CareerMatch)
            .where(CareerMatch.recommendation_id == recommendation_id)
            .order_by(desc(CareerMatch.match_score))
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
