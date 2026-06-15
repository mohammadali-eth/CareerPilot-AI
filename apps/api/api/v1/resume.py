from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, status

from database.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from api.dependencies.auth import get_current_active_user
from models.user import User

from schemas.resume import ResumeResponse, ResumeAnalysisResult
from services.resume import ResumeAnalyzerService
from repositories.resume import ResumeRepository

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("/upload", response_model=ResumeAnalysisResult, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload a resume (PDF/DOCX) for extraction and ATS/Content scoring.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is missing."
        )

    # Validate file extension
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in ["pdf", "docx"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported document format. Only PDF and DOCX files are accepted."
        )

    # Enforce maximum upload file size constraint (10MB)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    if file_size > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the maximum allowed limit of 10MB."
        )

    try:
        # Read file bytes
        file_bytes = await file.read()
        
        # Invoke parser service
        analyzer_service = ResumeAnalyzerService(db)
        resume_obj, score_obj, ats_obj = await analyzer_service.analyze_and_store(
            user_id=current_user.id,
            filename=file.filename,
            file_bytes=file_bytes,
            file_type=file.content_type
        )
        
        return {
            "resume": ResumeResponse.model_validate(resume_obj),
            "latest_score": score_obj,
            "latest_ats_report": ats_obj
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_420_METHOD_FAILURE if "unreadable" in str(e) else status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during file parsing: {str(e)}"
        )


@router.get("", response_model=List[ResumeResponse])
async def list_resumes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List all resumes and reports associated with the active user session.
    """
    repo = ResumeRepository(db)
    resumes = await repo.get_by_user_id(current_user.id)
    return resumes


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Retrieve single resume details with associated reports.
    """
    repo = ResumeRepository(db)
    resume = await repo.get_with_relations(resume_id)
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume report not found."
        )
        
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this report."
        )
        
    return resume


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a resume and all its related score and ATS logs.
    """
    repo = ResumeRepository(db)
    resume = await repo.get(resume_id)
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found."
        )
        
    if resume.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this resume."
        )
        
    await repo.remove(id=resume_id)
    return None
