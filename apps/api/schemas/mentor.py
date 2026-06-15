from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class ChatMessageResponse(BaseModel):
    id: UUID
    session_id: UUID
    role: str
    content: str
    token_usage: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSessionResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    summary: Optional[str] = None
    pinned: bool
    archived: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatSessionDetailResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    summary: Optional[str] = None
    pinned: bool
    archived: bool
    messages: List[ChatMessageResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatCreateRequest(BaseModel):
    content: str = Field(..., description="Message text to send to the AI Mentor")
    session_id: Optional[UUID] = Field(None, description="Active session ID to continue discussion")


class ChatSessionUpdateRequest(BaseModel):
    title: Optional[str] = None
    pinned: Optional[bool] = None
    archived: Optional[bool] = None
    summary: Optional[str] = None


class ChatExportResponse(BaseModel):
    id: UUID
    session_id: UUID
    export_type: str
    export_url: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationInsightsResponse(BaseModel):
    most_discussed_topics: List[str]
    top_weaknesses: List[str]
    top_strengths: List[str]
    career_trends: List[str]
    improvement_actions: List[str]


class MentorDashboardResponse(BaseModel):
    recent_sessions: List[ChatSessionResponse]
    insights: ConversationInsightsResponse
    recommended_actions: List[str]
    latest_advice: str
