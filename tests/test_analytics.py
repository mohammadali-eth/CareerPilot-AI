import os
import sys
import uuid
import pytest
from datetime import datetime, date
from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient

# Add current apps/api folder to path to allow resolution of core and database modules
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "apps", "api"))

from main import app
from database.session import get_db
from api.dependencies.auth import get_current_active_user
from models.user import User
from models.analytics import AnalyticsReport, AnalyticsSnapshot, UserMetric, ReportExport
from services.analytics import AnalyticsService

mock_user_id = uuid.uuid4()
mock_user = User(
    id=mock_user_id,
    email="analytics_test@careerpilot.ai",
    is_active=True,
    is_verified=True,
    role="user"
)


async def override_get_current_active_user():
    return mock_user


async def override_get_db():
    session = AsyncMock()
    yield session


@pytest.fixture
def client():
    app.dependency_overrides[get_current_active_user] = override_get_current_active_user
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_get_analytics_dashboard(client, monkeypatch):
    """
    Test GET /api/v1/analytics/dashboard endpoint
    """
    async def mock_get_dashboard(*args, **kwargs):
        return {
            "latest_metrics": {
                "id": str(uuid.uuid4()),
                "user_id": str(mock_user_id),
                "resume_score": 75.0,
                "ats_score": 80.0,
                "career_match_score": 85.0,
                "skill_gap_score": 90.0,
                "roadmap_completion": 45.0,
                "interview_readiness": 70.0,
                "learning_streak": 4,
                "career_readiness_score": 75.0,
                "overall_growth_score": 55.0,
                "created_at": "2026-06-15T12:00:00Z",
                "updated_at": "2026-06-15T12:00:00Z"
            },
            "snapshots": [],
            "recent_reports": [],
            "readiness_breakdown": {
                "career_readiness_score": 75.0,
                "resume_quality": {"score": 75.0, "weight": 0.15, "status": "Good", "description": "Desc"},
                "skill_coverage": {"score": 85.0, "weight": 0.20, "status": "Aligned", "description": "Desc"},
                "career_alignment": {"score": 85.0, "weight": 0.15, "status": "Optimal", "description": "Desc"},
                "roadmap_progress": {"score": 45.0, "weight": 0.20, "status": "Steady", "description": "Desc"},
                "interview_performance": {"score": 70.0, "weight": 0.20, "status": "Improving", "description": "Desc"},
                "learning_consistency": {"score": 40.0, "weight": 0.10, "status": "Average", "description": "Desc"},
                "overall_growth_score": 55.0
            },
            "growth_insights": {
                "strengths": ["Strong target alignment"],
                "weaknesses": ["ATS Gaps"],
                "opportunities": ["Growth areas"],
                "risks": ["Coding test speed"],
                "career_suggestions": "Practice daily.",
                "roadmap_suggestions": "Build projects.",
                "interview_suggestions": "Explain reasoning.",
                "next_steps": ["Fix spelling error"]
            }
        }

    monkeypatch.setattr(
        "services.analytics.AnalyticsService.get_dashboard_data",
        mock_get_dashboard
    )

    response = client.get("/api/v1/analytics/dashboard")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["latest_metrics"]["resume_score"] == 75.0
    assert json_data["readiness_breakdown"]["career_readiness_score"] == 75.0
    assert json_data["growth_insights"]["next_steps"] == ["Fix spelling error"]


def test_generate_career_report(client, monkeypatch):
    """
    Test POST /api/v1/analytics/reports endpoint
    """
    report_id = uuid.uuid4()
    
    async def mock_generate_report(*args, **kwargs):
        # Return a mock SQLAlchemy report object that matches AnalyticsReportResponse
        report = MagicMock(spec=AnalyticsReport)
        report.id = report_id
        report.user_id = mock_user_id
        report.report_type = "comprehensive"
        report.title = "Comprehensive Performance Report"
        report.summary = "Unified Score 75/100"
        report.data = {
            "breakdown": {"career_readiness_score": 75.0},
            "insights": {"next_steps": ["Update resume"]}
        }
        report.created_at = datetime.utcnow()
        return report

    monkeypatch.setattr(
        "services.analytics.AnalyticsService.generate_premium_report",
        mock_generate_report
    )

    response = client.post(
        "/api/v1/analytics/reports",
        json={"report_type": "comprehensive", "title": "Comprehensive Performance Report"}
    )
    assert response.status_code == 201
    json_data = response.json()
    assert json_data["id"] == str(report_id)
    assert json_data["report_type"] == "comprehensive"
    assert json_data["title"] == "Comprehensive Performance Report"


def test_list_career_reports(client, monkeypatch):
    """
    Test GET /api/v1/analytics/reports endpoint
    """
    report_id = uuid.uuid4()
    mock_report = MagicMock(spec=AnalyticsReport)
    mock_report.id = report_id
    mock_report.user_id = mock_user_id
    mock_report.report_type = "skills"
    mock_report.title = "Skills Report"
    mock_report.summary = "A skill report summary"
    mock_report.data = {}
    mock_report.created_at = datetime.utcnow()

    async def mock_list_reports(*args, **kwargs):
        return [mock_report]

    monkeypatch.setattr(
        "repositories.analytics.AnalyticsReportRepository.get_by_user_id_sorted",
        mock_list_reports
    )

    response = client.get("/api/v1/analytics/reports")
    assert response.status_code == 200
    json_data = response.json()
    assert len(json_data) == 1
    assert json_data[0]["id"] == str(report_id)
    assert json_data[0]["title"] == "Skills Report"


def test_export_career_report(client, monkeypatch):
    """
    Test POST /api/v1/analytics/reports/{id}/export endpoint
    """
    report_id = uuid.uuid4()
    export_id = uuid.uuid4()

    async def mock_export(*args, **kwargs):
        return {
            "id": export_id,
            "user_id": mock_user_id,
            "report_id": report_id,
            "export_type": "pdf",
            "export_url": f"/api/v1/analytics/exports/download/report_{report_id}.pdf",
            "created_at": datetime.utcnow()
        }

    monkeypatch.setattr(
        "services.analytics.AnalyticsService.export_report",
        mock_export
    )

    response = client.post(
        f"/api/v1/analytics/reports/{report_id}/export?export_type=pdf"
    )
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["id"] == str(export_id)
    assert json_data["export_type"] == "pdf"


def test_download_exported_file_validation(client):
    """
    Test path traversal protection on GET /api/v1/analytics/exports/download/{filename}
    """
    # Filename with invalid regex characters should fail validation with 400 Bad Request
    response = client.get("/api/v1/analytics/exports/download/report_name$.pdf")
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid export filename format."


@pytest.mark.asyncio
async def test_analytics_calculations():
    """
    Direct unit test of AnalyticsService calculations and SWOT fallback generation
    """
    db_session = AsyncMock()
    service = AnalyticsService(db_session)

    # 1. Verify SWOT fallback helper returns appropriate sections
    breakdown = {
        "career_readiness_score": 75.0,
        "resume_quality": {"score": 75.0, "status": "Good"},
        "skill_coverage": {"score": 80.0, "status": "Aligned"},
        "career_alignment": {"score": 85.0, "status": "Optimal"},
        "roadmap_progress": {"score": 40.0, "status": "Steady"},
        "interview_performance": {"score": 65.0, "status": "Improving"},
        "learning_consistency": {"score": 30.0, "status": "Average"}
    }
    
    swot = await service.generate_ai_insights(uuid.uuid4(), breakdown)
    assert "strengths" in swot
    assert "weaknesses" in swot
    assert "opportunities" in swot
    assert "risks" in swot
    assert len(swot["strengths"]) == 3
    assert len(swot["next_steps"]) == 3
