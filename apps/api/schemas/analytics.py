from datetime import datetime, date
from typing import List, Dict, Any, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class UserMetricResponse(BaseModel):
    id: UUID
    user_id: UUID
    resume_score: float
    ats_score: float
    career_match_score: float
    skill_gap_score: float
    roadmap_completion: float
    interview_readiness: float
    learning_streak: int
    career_readiness_score: float
    overall_growth_score: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AnalyticsSnapshotResponse(BaseModel):
    id: UUID
    user_id: UUID
    snapshot_date: date
    resume_score: float
    ats_score: float
    career_match_score: float
    skill_gap_score: float
    roadmap_completion: float
    interview_readiness: float
    learning_streak: int
    career_readiness_score: float
    overall_growth_score: float
    created_at: datetime

    class Config:
        from_attributes = True


class AnalyticsReportResponse(BaseModel):
    id: UUID
    user_id: UUID
    report_type: str
    title: str
    summary: Optional[str] = None
    data: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class ReportExportResponse(BaseModel):
    id: UUID
    user_id: UUID
    report_id: Optional[UUID] = None
    export_type: str
    export_url: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReportCreateRequest(BaseModel):
    report_type: str = Field("comprehensive", description="Type of report: 'comprehensive', 'skills', 'career', or 'interview'")
    title: Optional[str] = Field(None, description="Custom title for the generated report")


class CareerReadinessBreakdown(BaseModel):
    career_readiness_score: float
    resume_quality: Dict[str, Any]
    skill_coverage: Dict[str, Any]
    career_alignment: Dict[str, Any]
    roadmap_progress: Dict[str, Any]
    interview_performance: Dict[str, Any]
    learning_consistency: Dict[str, Any]
    overall_growth_score: float


class AnalyticsDashboardResponse(BaseModel):
    latest_metrics: Optional[UserMetricResponse] = None
    snapshots: List[AnalyticsSnapshotResponse] = []
    recent_reports: List[AnalyticsReportResponse] = []
    readiness_breakdown: Optional[CareerReadinessBreakdown] = None
    growth_insights: Dict[str, Any] = {}
