from typing import List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from database.session import get_db
from api.dependencies.auth import get_current_active_user
from models.user import User
from schemas.interview import (
    InterviewStartRequest,
    InterviewSessionResponse,
    InterviewAnswerResponse,
    InterviewAnalyticsResponse,
)
from services.interview import InterviewService

router = APIRouter(prefix="/interviews", tags=["Interviews"])


class AnswerSubmitPayload(BaseModel):
    question_id: UUID
    answer: str


@router.post("/start", response_model=InterviewSessionResponse, status_code=status.HTTP_201_CREATED)
async def start_interview_session(
    payload: InterviewStartRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Initialize a new realistic AI-powered interview simulation session.
    Dynamically generates personalized questions based on Resume, Skills, Experience, Projects, Target Career, and Roadmap Progress.
    """
    service = InterviewService(db)
    try:
        session = await service.start_session(
            user_id=current_user.id,
            target_career=payload.target_career,
            interview_type=payload.interview_type,
            difficulty=payload.difficulty,
            question_count=payload.question_count
        )
        return session
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate interview session: {str(e)}"
        )


@router.post("/{id}/answer", response_model=InterviewAnswerResponse, status_code=status.HTTP_200_OK)
async def submit_question_answer(
    id: UUID,
    payload: AnswerSubmitPayload,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit an answer to a specific question in the interview session.
    Evaluates response accuracy, communication flow, and problem solving, return feedback.
    """
    service = InterviewService(db)
    
    # Verify session belongs to user
    session = await service.get_session(id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found or access denied."
        )

    # Verify question is part of this session
    question_ids = [q.id for q in session.questions]
    if payload.question_id not in question_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The specified question does not belong to this interview session."
        )

    try:
        answer = await service.submit_answer(
            question_id=payload.question_id,
            answer_text=payload.answer
        )
        return answer
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate answer: {str(e)}"
        )


@router.post("/{id}/finish", response_model=InterviewSessionResponse, status_code=status.HTTP_200_OK)
async def finish_interview_session(
    id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Explicitly finalize the interview session. Calculates readiness score, average scores,
    and structures the permanent interview feedback report.
    """
    service = InterviewService(db)
    session = await service.get_session(id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found or access denied."
        )

    try:
        completed_session = await service.compile_report(id)
        return completed_session
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile report: {str(e)}"
        )


@router.get("", response_model=List[InterviewSessionResponse], status_code=status.HTTP_200_OK)
async def list_interview_history(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all mock interview sessions and history details for the authenticated user.
    """
    service = InterviewService(db)
    history = await service.session_repo.get_by_user_id(user_id=current_user.id)
    return history


@router.get("/analytics", response_model=InterviewAnalyticsResponse, status_code=status.HTTP_200_OK)
async def get_interview_analytics(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Compute interview readiness trends, average scores, recommended practice area, and historical stats.
    """
    service = InterviewService(db)
    analytics = await service.get_user_analytics(user_id=current_user.id)
    return analytics


@router.get("/{id}", response_model=InterviewSessionResponse, status_code=status.HTTP_200_OK)
async def get_interview_session_details(
    id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch comprehensive details for a single interview session, including questions, answers, and report card.
    """
    service = InterviewService(db)
    session = await service.get_session(id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found or access denied."
        )
    return session


@router.delete("/{id}", response_model=InterviewSessionResponse, status_code=status.HTTP_200_OK)
async def delete_interview_session(
    id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a specific mock interview session.
    """
    service = InterviewService(db)
    session = await service.get_session(id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found or access denied."
        )

    deleted_session = await service.delete_session(id)
    return deleted_session
