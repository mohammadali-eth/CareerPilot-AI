import os
import sys
import uuid
from datetime import datetime, timezone
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient

# Add current apps/api folder to path to allow resolution of core and database modules
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "apps", "api"))

from main import app
from database.session import get_db
from api.dependencies.auth import get_current_active_user
from models.user import User
from models.interview import InterviewSession, InterviewQuestion, InterviewAnswer
from services.interview import InterviewService

# Mock user setup
mock_user_id = uuid.uuid4()
mock_user = User(
    id=mock_user_id,
    email="interviewer@careerpilot.ai",
    is_active=True,
    is_verified=True,
    role="user"
)

# Mock user has profile
mock_profile = MagicMock()
mock_profile.current_experience_level = "Intermediate"
mock_profile.target_role = "Senior Backend Developer"
mock_user.profile = mock_profile


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


@pytest.mark.asyncio
async def test_question_generation_fallback():
    """Test fallback question generation when LLM is unavailable"""
    db = AsyncMock()
    service = InterviewService(db)
    
    # Check fallback generator
    questions = service._generate_fallback_questions(
        target_career="Senior Backend Engineer",
        interview_type="Technical Interview",
        difficulty="Intermediate",
        count=3,
        skill_gaps=["Docker"]
    )
    
    assert len(questions) == 3
    assert questions[0]["difficulty"] == "Intermediate"
    assert "microservices" in questions[0]["question"] or "architectural" in questions[0]["question"] or "concurrency" in questions[0]["question"] or "bottleneck" in questions[0]["question"] or "explain" in questions[0]["question"]


@pytest.mark.asyncio
async def test_answer_evaluation_fallback():
    """Test fallback answer evaluation logic"""
    db = AsyncMock()
    service = InterviewService(db)
    
    score, feedback = service._evaluate_fallback_answer(
        question_text="What is microservices architecture?",
        answer_text="Microservices architecture is a modern architectural style that structures an application as a collection of small, loosely coupled services. Each service is highly maintainable, testable, and independently deployable. They are typically organized around specific business capabilities and communicate over lightweight protocols like HTTP REST APIs or message brokers. By decoupling these components, teams can develop, test, and deploy services independently, allowing for faster release cycles and better system fault tolerance. However, it introduces complex challenges like distributed data management, network latency, and service discovery configurations.",
        difficulty="Intermediate"
    )
    
    assert score >= 50
    assert "strengths" in feedback
    assert "weaknesses" in feedback
    assert "criteria_scores" in feedback
    assert feedback["criteria_scores"]["technical_accuracy"] >= 50


def test_start_interview_api(client):
    """Test POST /api/v1/interviews/start endpoint"""
    mock_session = MagicMock(spec=InterviewSession)
    mock_session.id = uuid.uuid4()
    mock_session.user_id = mock_user_id
    mock_session.interview_type = "Technical Interview"
    mock_session.target_career = "Senior Backend Developer"
    mock_session.difficulty = "Intermediate"
    mock_session.score = None
    mock_session.readiness_score = None
    mock_session.status = "in_progress"
    mock_session.started_at = datetime.now(timezone.utc)
    mock_session.completed_at = None
    mock_session.report = None
    mock_session.created_at = datetime.now(timezone.utc)
    mock_session.updated_at = datetime.now(timezone.utc)
    
    # Mock questions
    q1 = MagicMock(spec=InterviewQuestion)
    q1.id = uuid.uuid4()
    q1.session_id = mock_session.id
    q1.question = "Explain DB Indexing."
    q1.category = "Technical"
    q1.difficulty = "Intermediate"
    q1.answer = None
    q1.created_at = datetime.now(timezone.utc)
    q1.updated_at = datetime.now(timezone.utc)
    mock_session.questions = [q1]

    async def mock_start_session(*args, **kwargs):
        return mock_session

    with patch("services.interview.InterviewService.start_session", mock_start_session):
        payload = {
            "target_career": "Senior Backend Developer",
            "interview_type": "Technical Interview",
            "difficulty": "Intermediate",
            "question_count": 5
        }
        response = client.post("/api/v1/interviews/start", json=payload)
        assert response.status_code == 201
        json_data = response.json()
        assert json_data["id"] == str(mock_session.id)
        assert json_data["status"] == "in_progress"
        assert len(json_data["questions"]) == 1
        assert json_data["questions"][0]["question"] == "Explain DB Indexing."


def test_submit_answer_api(client):
    """Test POST /api/v1/interviews/{id}/answer endpoint"""
    session_id = uuid.uuid4()
    question_id = uuid.uuid4()
    
    # Mock Session and question check
    mock_session = MagicMock(spec=InterviewSession)
    mock_session.id = session_id
    mock_session.user_id = mock_user_id
    
    q1 = MagicMock(spec=InterviewQuestion)
    q1.id = question_id
    mock_session.questions = [q1]
    
    mock_answer = MagicMock(spec=InterviewAnswer)
    mock_answer.id = uuid.uuid4()
    mock_answer.question_id = question_id
    mock_answer.answer = "Indexing speeds up reads at the cost of writes."
    mock_answer.score = 85
    mock_answer.feedback = {"strengths": ["Clear definition"], "weaknesses": []}
    mock_answer.created_at = datetime.now(timezone.utc)
    mock_answer.updated_at = datetime.now(timezone.utc)

    async def mock_get_session(*args, **kwargs):
        return mock_session

    async def mock_submit_answer(*args, **kwargs):
        return mock_answer

    with patch("services.interview.InterviewService.get_session", mock_get_session), \
         patch("services.interview.InterviewService.submit_answer", mock_submit_answer):
        
        payload = {
            "question_id": str(question_id),
            "answer": "Indexing speeds up reads at the cost of writes."
        }
        response = client.post(f"/api/v1/interviews/{session_id}/answer", json=payload)
        assert response.status_code == 200
        json_data = response.json()
        assert json_data["question_id"] == str(question_id)
        assert json_data["score"] == 85
        assert "Clear definition" in json_data["feedback"]["strengths"]


def test_finish_interview_api(client):
    """Test POST /api/v1/interviews/{id}/finish endpoint"""
    session_id = uuid.uuid4()
    
    # Mock Session
    mock_session = MagicMock(spec=InterviewSession)
    mock_session.id = session_id
    mock_session.user_id = mock_user_id
    mock_session.interview_type = "Mock Full Interview"
    mock_session.target_career = "Backend Engineer"
    mock_session.difficulty = "Intermediate"
    mock_session.status = "completed"
    mock_session.score = 80
    mock_session.readiness_score = 88
    mock_session.report = {
        "overall_score": 80,
        "readiness_score": 88,
        "category_performance": {"Technical": 80},
        "strengths": ["Great analytical skills"],
        "weaknesses": ["Improve timing"],
        "recommended_next_steps": ["Read about system designs"]
    }
    mock_session.questions = []
    mock_session.created_at = datetime.now(timezone.utc)
    mock_session.updated_at = datetime.now(timezone.utc)

    async def mock_get_session(*args, **kwargs):
        return mock_session

    async def mock_compile_report(*args, **kwargs):
        return mock_session

    with patch("services.interview.InterviewService.get_session", mock_get_session), \
         patch("services.interview.InterviewService.compile_report", mock_compile_report):
        
        response = client.post(f"/api/v1/interviews/{session_id}/finish")
        assert response.status_code == 200
        json_data = response.json()
        assert json_data["status"] == "completed"
        assert json_data["score"] == 80
        assert json_data["readiness_score"] == 88
        assert json_data["report"]["overall_score"] == 80


def test_list_history_api(client):
    """Test GET /api/v1/interviews endpoint"""
    mock_session = MagicMock(spec=InterviewSession)
    mock_session.id = uuid.uuid4()
    mock_session.user_id = mock_user_id
    mock_session.interview_type = "Mock Full Interview"
    mock_session.target_career = "Backend Engineer"
    mock_session.difficulty = "Advanced"
    mock_session.score = 75
    mock_session.readiness_score = 82
    mock_session.status = "completed"
    mock_session.started_at = datetime.now(timezone.utc)
    mock_session.completed_at = datetime.now(timezone.utc)
    mock_session.report = None
    mock_session.questions = []
    mock_session.created_at = datetime.now(timezone.utc)
    mock_session.updated_at = datetime.now(timezone.utc)

    async def mock_get_by_user_id(*args, **kwargs):
        return [mock_session]

    with patch("repositories.interview.InterviewSessionRepository.get_by_user_id", mock_get_by_user_id):
        response = client.get("/api/v1/interviews")
        assert response.status_code == 200
        json_data = response.json()
        assert len(json_data) == 1
        assert json_data[0]["id"] == str(mock_session.id)
        assert json_data[0]["interview_type"] == "Mock Full Interview"


def test_get_analytics_api(client):
    """Test GET /api/v1/interviews/analytics endpoint"""
    mock_analytics = {
        "average_score": 78.5,
        "recent_scores": [
            {
                "session_id": str(uuid.uuid4()),
                "date": datetime.now(timezone.utc).isoformat(),
                "score": 78,
                "readiness_score": 85,
                "interview_type": "HR Interview"
            }
        ],
        "progress_over_time": [],
        "category_trends": [],
        "improvement_trends": [],
        "best_score": 78,
        "readiness_score": 85,
        "recommended_practice_area": "Behavioral",
        "history": []
    }

    async def mock_get_user_analytics(*args, **kwargs):
        return mock_analytics

    with patch("services.interview.InterviewService.get_user_analytics", mock_get_user_analytics):
        response = client.get("/api/v1/interviews/analytics")
        assert response.status_code == 200
        json_data = response.json()
        assert json_data["average_score"] == 78.5
        assert json_data["recommended_practice_area"] == "Behavioral"
        assert len(json_data["recent_scores"]) == 1
