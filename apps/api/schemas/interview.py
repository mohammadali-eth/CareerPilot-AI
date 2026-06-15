from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field


class InterviewStartRequest(BaseModel):
    """
    Schema for initializing an interview simulation session.
    """
    target_career: str = Field(..., description="Target career role (e.g. Senior Frontend Engineer)")
    interview_type: str = Field(..., description="Type of interview: 'HR Interview', 'Technical Interview', 'Behavioral Interview', 'Project Discussion Interview', 'Career-Based Interview', or 'Mock Full Interview'")
    difficulty: str = Field(..., description="Difficulty level: 'Beginner', 'Intermediate', or 'Advanced'")
    question_count: int = Field(5, description="Number of questions (e.g., 5, 10, 20)", ge=1, le=20)
    time_limit: Optional[int] = Field(None, description="Time limit in minutes", ge=1)


class InterviewAnswerSubmitRequest(BaseModel):
    """
    Schema for submitting an answer to a specific interview question.
    """
    answer: str = Field(..., description="The user's response to the interview question")


class InterviewAnswerResponse(BaseModel):
    id: UUID
    question_id: UUID
    answer: str
    score: int
    feedback: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InterviewQuestionResponse(BaseModel):
    id: UUID
    session_id: UUID
    question: str
    category: str
    difficulty: str
    answer: Optional[InterviewAnswerResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InterviewSessionResponse(BaseModel):
    id: UUID
    user_id: UUID
    interview_type: str
    target_career: str
    difficulty: str
    score: Optional[int] = None
    readiness_score: Optional[int] = None
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    report: Optional[Dict[str, Any]] = None
    questions: List[InterviewQuestionResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ScoreHistoryEntry(BaseModel):
    session_id: UUID
    date: datetime
    score: int
    readiness_score: int
    interview_type: str


class CategoryTrendEntry(BaseModel):
    category: str
    average_score: float
    question_count: int


class InterviewAnalyticsResponse(BaseModel):
    average_score: float
    recent_scores: List[ScoreHistoryEntry]
    progress_over_time: List[Dict[str, Any]]
    category_trends: List[CategoryTrendEntry]
    improvement_trends: List[Dict[str, Any]]
    best_score: int
    readiness_score: int
    recommended_practice_area: str
    history: List[InterviewSessionResponse]
