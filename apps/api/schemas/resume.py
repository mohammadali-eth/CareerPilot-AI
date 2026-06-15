from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel


class ResumeScoreBase(BaseModel):
    id: UUID
    overall_score: int
    structure_score: int
    content_score: int
    suggestions: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class ATSReportBase(BaseModel):
    id: UUID
    ats_score: int
    missing_keywords: List[str]
    formatting_issues: List[str]
    relevance_score: int
    created_at: datetime

    class Config:
        from_attributes = True


class ResumeResponse(BaseModel):
    id: UUID
    user_id: UUID
    filename: str
    file_path: str
    extracted_data: Dict[str, Any]
    created_at: datetime
    scores: List[ResumeScoreBase] = []
    ats_reports: List[ATSReportBase] = []

    class Config:
        from_attributes = True


class ResumeAnalysisResult(BaseModel):
    resume: ResumeResponse
    latest_score: Optional[ResumeScoreBase] = None
    latest_ats_report: Optional[ATSReportBase] = None

    class Config:
        from_attributes = True
