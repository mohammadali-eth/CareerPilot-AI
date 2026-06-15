from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class AdminUserSuspendRequest(BaseModel):
    reason: str = Field(..., min_length=3, max_length=500)


class AdminUserActivateRequest(BaseModel):
    reason: str = Field(..., min_length=3, max_length=500)


class AdminUserPasswordResetRequest(BaseModel):
    new_password: str = Field(..., min_length=6, max_length=100)
    reason: str = Field(..., min_length=3, max_length=500)


class AdminRoleAssignRequest(BaseModel):
    role: str = Field(..., description="Role to assign: SUPER_ADMIN, ADMIN, SUPPORT_AGENT, AUDITOR, user")
    reason: str = Field(..., min_length=3, max_length=500)


class AdminCareerCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=100)
    category: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., min_length=10, max_length=1000)
    required_skills: List[str] = Field(default_factory=list)
    salary_data: Dict[str, Any] = Field(default_factory=dict)
    market_trends: Dict[str, Any] = Field(default_factory=dict)
    future_outlook: str = Field(..., min_length=5, max_length=1000)


class AdminSkillCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1, max_length=100)
    importance: str = Field("medium", pattern="^(low|medium|high)$")
    relationships: List[str] = Field(default_factory=list)
    mapping: Dict[str, Any] = Field(default_factory=dict)


class AdminAuditLogResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    action_type: str
    description: str
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class AdminActionResponse(BaseModel):
    id: UUID
    admin_id: UUID
    target_user_id: Optional[UUID]
    action_type: str
    reason: str
    created_at: datetime

    class Config:
        from_attributes = True


class AdminUserSummary(BaseModel):
    id: UUID
    email: EmailStr
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AdminDashboardStats(BaseModel):
    total_users: int
    active_users: int
    new_users_30d: int
    ai_requests: int
    reports_generated: int
    interviews_conducted: int
    roadmaps_created: int
    career_recommendations_generated: int
    system_health: str
