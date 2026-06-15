from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status

from database.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from api.dependencies.auth import get_current_active_user
from models.user import User

from schemas.career import CareerRecommendationResponse
from services.career import CareerRecommendationService

router = APIRouter(prefix="/career-recommendations", tags=["Career Recommendations"])


@router.post("/generate", response_model=CareerRecommendationResponse, status_code=status.HTTP_201_CREATED)
async def generate_recommendation(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Generate career recommendations based on the user's latest resume or profile parameters.
    """
    service = CareerRecommendationService(db)
    return await service.generate_recommendations(user_id=current_user.id)


@router.get("/history", response_model=List[CareerRecommendationResponse], status_code=status.HTTP_200_OK)
async def list_recommendations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve user's historical career recommendation batches.
    """
    service = CareerRecommendationService(db)
    return await service.get_history(user_id=current_user.id)


@router.get("/{id}", response_model=CareerRecommendationResponse, status_code=status.HTTP_200_OK)
async def get_recommendation(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve details of a specific career recommendation batch.
    """
    service = CareerRecommendationService(db)
    return await service.get_recommendation(recommendation_id=id, user_id=current_user.id)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recommendation(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a specific career recommendation batch.
    """
    service = CareerRecommendationService(db)
    await service.delete_recommendation(recommendation_id=id, user_id=current_user.id)
    return None
