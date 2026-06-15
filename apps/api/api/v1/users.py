from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from api.dependencies.auth import get_current_active_user
from models.user import User
from schemas.user import UserProfileResponse, ProfileUpdateRequest
from repositories.user import ProfileRepository

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserProfileResponse, status_code=status.HTTP_200_OK)
async def get_my_profile(
    current_user: User = Depends(get_current_active_user)
):
    """
    Fetch profile information and scopes for the currently authenticated User.
    """
    return current_user


@router.put("/me", response_model=UserProfileResponse, status_code=status.HTTP_200_OK)
async def update_my_profile(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update profile fields for the authenticated User.
    """
    profile_repo = ProfileRepository(db)
    
    # Check if profile already exists, otherwise create it
    profile = current_user.profile
    if not profile:
        profile_data = {
            "user_id": current_user.id,
            "first_name": payload.first_name,
            "last_name": payload.last_name,
            "target_role": payload.target_role,
            "current_experience_level": payload.current_experience_level
        }
        profile = await profile_repo.create(obj_in=profile_data)
    else:
        update_data = payload.model_dump(exclude_unset=True)
        profile = await profile_repo.update(db_obj=profile, obj_in=update_data)
        
    await db.commit()
    # Refresh user reference
    await db.refresh(current_user)
    return current_user
