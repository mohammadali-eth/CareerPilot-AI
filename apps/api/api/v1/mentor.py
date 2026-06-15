from typing import List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from database.session import get_db
from api.dependencies.auth import get_current_active_user
from models.user import User
from schemas.mentor import (
    ChatCreateRequest,
    ChatSessionResponse,
    ChatSessionDetailResponse,
    ChatSessionUpdateRequest,
    ChatExportResponse,
    MentorDashboardResponse,
)
from services.mentor import MentorService

router = APIRouter(prefix="/mentor", tags=["Career Mentor"])


class ChatMessageResponseOuter(BaseModel):
    session_id: UUID
    message: Dict[str, Any]


class ExportPayload(BaseModel):
    export_type: str = Field("markdown", description="Export file format: 'pdf', 'markdown', or 'text'")


@router.post("/chat", response_model=ChatMessageResponseOuter, status_code=status.HTTP_200_OK)
async def chat_with_mentor(
    payload: ChatCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send a message to the AI Career Mentor.
    Automatically retrieves resume and roadmap context, matches gaps, and appends a logical explanation.
    """
    service = MentorService(db)
    try:
        response = await service.send_chat_message(
            user_id=current_user.id,
            session_id=payload.session_id,
            content=payload.content
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat execution failed: {str(e)}"
        )


@router.get("/dashboard", response_model=MentorDashboardResponse, status_code=status.HTTP_200_OK)
async def get_mentor_dashboard_details(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve aggregated dashboard information including recent chats, advisory insights, and recommended actions.
    """
    service = MentorService(db)
    try:
        dashboard_data = await service.get_dashboard_data(current_user.id)
        return dashboard_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load dashboard advisory: {str(e)}"
        )


@router.get("/sessions", response_model=List[ChatSessionResponse], status_code=status.HTTP_200_OK)
async def list_chat_sessions(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all chat sessions belonging to the logged-in user.
    """
    service = MentorService(db)
    try:
        sessions = await service.session_repo.get_by_user_id_sorted(current_user.id)
        return sessions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve chat sessions: {str(e)}"
        )


@router.get("/sessions/{id}", response_model=ChatSessionDetailResponse, status_code=status.HTTP_200_OK)
async def get_chat_session_details(
    id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve details of a single chat session including full message transcript history.
    """
    service = MentorService(db)
    session = await service.session_repo.get_by_id_and_user_id(id, current_user.id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advisory session not found or access denied."
        )
    return session


@router.put("/sessions/{id}", response_model=ChatSessionResponse, status_code=status.HTTP_200_OK)
async def update_chat_session(
    id: UUID,
    payload: ChatSessionUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update session attributes like title (rename), pinned status, and archived state.
    """
    service = MentorService(db)
    session = await service.session_repo.get_by_id_and_user_id(id, current_user.id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advisory session not found or access denied."
        )

    # Filter out None fields to avoid wiping existing values
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    try:
        updated_session = await service.session_repo.update(db_obj=session, obj_in=update_data)
        return updated_session
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update session: {str(e)}"
        )


@router.delete("/sessions/{id}", response_model=ChatSessionResponse, status_code=status.HTTP_200_OK)
async def delete_chat_session(
    id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Permanently delete a specific advisory session and all its associated messages.
    """
    service = MentorService(db)
    session = await service.session_repo.get_by_id_and_user_id(id, current_user.id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Advisory session not found or access denied."
        )

    try:
        deleted_session = await service.session_repo.remove(id=id)
        return deleted_session
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete session: {str(e)}"
        )


@router.post("/sessions/{id}/export", response_model=ChatExportResponse, status_code=status.HTTP_200_OK)
async def export_chat_session(
    id: UUID,
    payload: ExportPayload,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Compile and export a chat session transcript and insights.
    """
    service = MentorService(db)
    try:
        export_result = await service.export_session(
            session_id=id,
            user_id=current_user.id,
            export_type=payload.export_type
        )
        return export_result
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(val_err)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export session: {str(e)}"
        )
