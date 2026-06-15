from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, model_validator


class RoadmapGenerateRequest(BaseModel):
    """
    Schema for validating a request to generate a personalized career roadmap.
    """
    target_career: str = Field(..., description="Target career role (e.g. Senior Full Stack Developer)")
    timeline: str = Field(..., description="Target timeline (e.g. '3 Months', '6 Months', '12 Months')")
    weekly_hours: int = Field(..., description="Weekly study hours committed", ge=1)
    experience_level: str = Field(..., description="Current experience level ('Beginner', 'Intermediate', 'Advanced')")
    learning_style: str = Field(..., description="Preferred learning style ('Video', 'Reading', 'Practice', 'Mixed')")


class RoadmapProgressUpdateRequest(BaseModel):
    """
    Schema for updating user progress on a milestone.
    """
    milestone_id: UUID = Field(..., description="The ID of the milestone to update")
    progress: int = Field(..., ge=0, le=100, description="Progress percentage (0 to 100)")
    completed: bool = Field(..., description="Boolean flag representing if the milestone is fully completed")


class ProjectRecommendation(BaseModel):
    title: str
    difficulty: str
    estimated_duration: str
    skills_covered: List[str]
    portfolio_value: str
    why_recommended: str


class CertificationRecommendation(BaseModel):
    title: str
    priority_level: str
    career_impact: str
    estimated_completion_time: str
    reason_for_recommendation: str


class WeeklyTask(BaseModel):
    week_number: int
    theme: str
    tasks: List[str]


class MonthlyGoal(BaseModel):
    month_number: int
    goal: str
    focus_areas: List[str]


class LearningPhase(BaseModel):
    phase_number: int
    title: str
    description: str
    duration: str
    skills_covered: List[str]


class RoadmapData(BaseModel):
    career_goal: str
    success_probability: int
    learning_phases: List[LearningPhase]
    weekly_tasks: List[WeeklyTask]
    monthly_goals: List[MonthlyGoal]
    projects: List[ProjectRecommendation]
    certifications: List[CertificationRecommendation]
    interview_preparation: List[str]
    portfolio_improvements: List[str]
    why_milestones_exist_explanation: str
    why_skills_ordered_explanation: str
    employability_impact_explanation: str


class RoadmapProgressResponse(BaseModel):
    id: UUID
    roadmap_id: UUID
    milestone_id: UUID
    progress: int
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RoadmapMilestoneResponse(BaseModel):
    id: UUID
    roadmap_id: UUID
    title: str
    description: str
    target_date: datetime
    completion_percentage: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RoadmapResponse(BaseModel):
    id: UUID
    user_id: UUID
    target_career: str
    timeline: str
    estimated_completion: datetime
    status: str
    roadmap_data: RoadmapData
    created_at: datetime
    updated_at: datetime
    milestones: List[RoadmapMilestoneResponse] = []

    class Config:
        from_attributes = True
