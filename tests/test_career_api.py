import os
import sys
import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient

# Add current apps/api folder to path to allow resolution of core and database modules
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "apps", "api"))

from main import app
from database.session import get_db
from api.dependencies.auth import get_current_active_user
from models.user import User

# Define dummy mock user
mock_user_id = uuid.uuid4()
mock_user = User(
    id=mock_user_id,
    email="testuser@careerpilot.ai",
    is_active=True,
    is_verified=True,
    role="user"
)


async def override_get_current_active_user():
    return mock_user


async def override_get_db():
    # Return a dummy mock async session
    session = AsyncMock()
    yield session


@pytest.fixture
def client():
    app.dependency_overrides[get_current_active_user] = override_get_current_active_user
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_generate_recommendation(client, monkeypatch):
    # Mock CareerRecommendationService
    mock_recommendation = MagicMock()
    mock_recommendation.id = uuid.uuid4()
    mock_recommendation.user_id = mock_user_id
    mock_recommendation.recommendation_version = "1.0"
    mock_recommendation.recommendation_result = {
        "user_data_snapshot": {"skills_count": 5, "experience_length": 1, "has_resume": True},
        "top_match_summary": "Backend Developer"
    }
    mock_recommendation.generated_at = MagicMock()
    mock_recommendation.generated_at.isoformat = lambda: "2026-06-15T12:00:00Z"
    
    # Mock matches list
    mock_match = MagicMock()
    mock_match.id = uuid.uuid4()
    mock_match.recommendation_id = mock_recommendation.id
    mock_match.career_name = "Backend Developer"
    mock_match.match_score = 85
    mock_match.confidence_score = 0.8
    mock_match.explanation = (
        '{"career_name": "Backend Developer", "match_score": 85, "confidence_score": 0.8, '
        '"why_it_matches": "Matched.", "required_skills": [], "missing_skills": [], '
        '"recommended_next_steps": [], "estimated_learning_time": "3 Months", "growth_potential": "High", '
        '"salary_insights": {"entry_level": "$70k", "mid_level": "$100k", "senior_level": "$140k"}, '
        '"market_demand": {"demand_score": 90, "growth_trend": "Increasing", "industry_adoption": "High", "future_outlook": "Strong"}}'
    )
    mock_recommendation.matches = [mock_match]

    async def mock_generate(*args, **kwargs):
        return mock_recommendation

    monkeypatch.setattr(
        "services.career.CareerRecommendationService.generate_recommendations",
        mock_generate
    )

    response = client.post("/api/v1/career-recommendations/generate")
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["id"] == str(mock_recommendation.id)
    assert json_data["recommendation_result"]["top_match_summary"] == "Backend Developer"
    assert len(json_data["matches"]) == 1
    assert json_data["matches"][0]["career_name"] == "Backend Developer"
    assert json_data["matches"][0]["details"]["salary_insights"]["entry_level"] == "$70k"


def test_list_recommendations(client, monkeypatch):
    mock_recommendation = MagicMock()
    mock_recommendation.id = uuid.uuid4()
    mock_recommendation.user_id = mock_user_id
    mock_recommendation.recommendation_version = "1.0"
    mock_recommendation.recommendation_result = {}
    mock_recommendation.generated_at = MagicMock()
    mock_recommendation.generated_at.isoformat = lambda: "2026-06-15T12:00:00Z"
    mock_recommendation.matches = []

    async def mock_get_history(*args, **kwargs):
        return [mock_recommendation]

    monkeypatch.setattr(
        "services.career.CareerRecommendationService.get_history",
        mock_get_history
    )

    response = client.get("/api/v1/career-recommendations/history")
    assert response.status_code == 200
    json_data = response.json()
    assert len(json_data) == 1
    assert json_data[0]["id"] == str(mock_recommendation.id)


def test_get_recommendation_by_id(client, monkeypatch):
    rec_id = uuid.uuid4()
    mock_recommendation = MagicMock()
    mock_recommendation.id = rec_id
    mock_recommendation.user_id = mock_user_id
    mock_recommendation.recommendation_version = "1.0"
    mock_recommendation.recommendation_result = {}
    mock_recommendation.generated_at = MagicMock()
    mock_recommendation.generated_at.isoformat = lambda: "2026-06-15T12:00:00Z"
    mock_recommendation.matches = []

    async def mock_get_rec(*args, **kwargs):
        return mock_recommendation

    monkeypatch.setattr(
        "services.career.CareerRecommendationService.get_recommendation",
        mock_get_rec
    )

    response = client.get(f"/api/v1/career-recommendations/{rec_id}")
    assert response.status_code == 200
    assert response.json()["id"] == str(rec_id)


def test_delete_recommendation(client, monkeypatch):
    rec_id = uuid.uuid4()

    async def mock_delete(*args, **kwargs):
        return None

    monkeypatch.setattr(
        "services.career.CareerRecommendationService.delete_recommendation",
        mock_delete
    )

    response = client.delete(f"/api/v1/career-recommendations/{rec_id}")
    assert response.status_code == 204
