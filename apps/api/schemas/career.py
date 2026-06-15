import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from uuid import UUID
from pydantic import BaseModel, Field, model_validator


class SalaryInsights(BaseModel):
    entry_level: str
    mid_level: str
    senior_level: str


class MarketDemand(BaseModel):
    demand_score: int
    growth_trend: str
    industry_adoption: str
    future_outlook: str


class CareerMatchDetails(BaseModel):
    career_name: str
    match_score: int
    confidence_score: float
    why_it_matches: str
    required_skills: List[str]
    missing_skills: List[str]
    recommended_next_steps: List[str]
    estimated_learning_time: str
    growth_potential: str
    salary_insights: SalaryInsights
    market_demand: MarketDemand


class CareerMatchResponse(BaseModel):
    id: UUID
    recommendation_id: UUID
    career_name: str
    match_score: int
    confidence_score: float
    explanation: str
    details: Optional[CareerMatchDetails] = None

    class Config:
        from_attributes = True

    @model_validator(mode="before")
    @classmethod
    def parse_explanation_details(cls, data: Any) -> Any:
        # Handle cases where data is an ORM object
        if hasattr(data, "explanation"):
            explanation_str = getattr(data, "explanation", "")
            if isinstance(explanation_str, str) and explanation_str.strip():
                try:
                    parsed = json.loads(explanation_str)
                    # Dynamically set a temporary attribute on the object
                    setattr(data, "details", parsed)
                except Exception:
                    pass
        # Handle cases where data is a raw dictionary
        elif isinstance(data, dict):
            explanation_str = data.get("explanation", "")
            if isinstance(explanation_str, str) and explanation_str.strip():
                try:
                    data["details"] = json.loads(explanation_str)
                except Exception:
                    pass
        return data


class CareerRecommendationResponse(BaseModel):
    id: UUID
    user_id: UUID
    recommendation_version: str
    recommendation_result: Dict[str, Any]
    generated_at: datetime
    matches: List[CareerMatchResponse] = []

    class Config:
        from_attributes = True
