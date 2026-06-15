from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status

from database.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from api.dependencies.auth import get_current_active_user
from models.user import User

from schemas.roadmap import RoadmapGenerateRequest, RoadmapProgressUpdateRequest, RoadmapResponse
from services.roadmap import RoadmapService

router = APIRouter(prefix="/roadmaps", tags=["Roadmaps"])


@router.post("/generate", response_model=RoadmapResponse, status_code=status.HTTP_201_CREATED)
async def generate_roadmap(
    payload: RoadmapGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Generate a new personalized career roadmap using user inputs and AI models.
    """
    service = RoadmapService(db)
    return await service.generate_roadmap(
        user_id=current_user.id,
        target_career=payload.target_career,
        timeline=payload.timeline,
        weekly_hours=payload.weekly_hours,
        experience_level=payload.experience_level,
        learning_style=payload.learning_style
    )


@router.get("", response_model=List[RoadmapResponse], status_code=status.HTTP_200_OK)
async def list_roadmaps(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve all historical roadmaps generated for the logged-in user.
    """
    service = RoadmapService(db)
    return await service.get_roadmaps_by_user(user_id=current_user.id)


@router.get("/{id}", response_model=RoadmapResponse, status_code=status.HTTP_200_OK)
async def get_roadmap(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve detailed records for a specific roadmap by ID.
    """
    service = RoadmapService(db)
    return await service.get_roadmap_by_id(roadmap_id=id, user_id=current_user.id)


@router.put("/{id}/progress", response_model=RoadmapResponse, status_code=status.HTTP_200_OK)
async def update_progress(
    id: UUID,
    payload: RoadmapProgressUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update user study completion stats for a specific roadmap milestone.
    """
    service = RoadmapService(db)
    return await service.update_milestone_progress(
        roadmap_id=id,
        milestone_id=payload.milestone_id,
        user_id=current_user.id,
        progress=payload.progress,
        completed=payload.completed
    )


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_roadmap(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Remove a roadmap and all associated milestones and progress tracking data.
    """
    service = RoadmapService(db)
    await service.delete_roadmap(roadmap_id=id, user_id=current_user.id)
    return None
