import os
import sys
import uuid
import pytest
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient

# Add current apps/api folder to path to allow resolution of core and database modules
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "apps", "api"))

from main import app
from database.session import get_db
from api.dependencies.auth import get_current_active_user
from models.user import User
from models.mentor import ChatSession, ChatMessage, ChatExport

mock_user_id = uuid.uuid4()
mock_user = User(
    id=mock_user_id,
    email="mentor_test@careerpilot.ai",
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


def test_chat_with_mentor(client, monkeypatch):
    session_id = uuid.uuid4()
    msg_id = uuid.uuid4()
    
    async def mock_send_chat(*args, **kwargs):
        return {
            "session_id": session_id,
            "message": {
                "id": msg_id,
                "role": "assistant",
                "content": "Keep learning system design.",
                "created_at": "2026-06-15T12:00:00Z"
            }
        }

    monkeypatch.setattr(
        "services.mentor.MentorService.send_chat_message",
        mock_send_chat
    )

    response = client.post(
        "/api/v1/mentor/chat",
        json={"content": "How do I improve my design skills?", "session_id": str(session_id)}
    )
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["session_id"] == str(session_id)
    assert json_data["message"]["content"] == "Keep learning system design."


def test_get_mentor_dashboard(client, monkeypatch):
    async def mock_get_dashboard(*args, **kwargs):
        return {
            "recent_sessions": [],
            "insights": {
                "most_discussed_topics": ["Docker", "APIs"],
                "top_weaknesses": ["Caching"],
                "top_strengths": ["HTML/CSS"],
                "career_trends": ["React 19 adoption"],
                "improvement_actions": ["Deploy project"]
            },
            "recommended_actions": ["Deploy project"],
            "latest_advice": "Focus on backend architecture."
        }

    monkeypatch.setattr(
        "services.mentor.MentorService.get_dashboard_data",
        mock_get_dashboard
    )

    response = client.get("/api/v1/mentor/dashboard")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["latest_advice"] == "Focus on backend architecture."
    assert json_data["insights"]["most_discussed_topics"] == ["Docker", "APIs"]


def test_list_chat_sessions(client, monkeypatch):
    session_id = uuid.uuid4()
    mock_session = MagicMock(spec=ChatSession)
    mock_session.id = session_id
    mock_session.user_id = mock_user_id
    mock_session.title = "Backend Prep"
    mock_session.summary = "A quick summary"
    mock_session.pinned = False
    mock_session.archived = False
    mock_session.created_at = datetime.utcnow()
    mock_session.updated_at = datetime.utcnow()

    async def mock_list_sessions(*args, **kwargs):
        return [mock_session]

    monkeypatch.setattr(
        "repositories.mentor.ChatSessionRepository.get_by_user_id_sorted",
        mock_list_sessions
    )

    response = client.get("/api/v1/mentor/sessions")
    assert response.status_code == 200
    json_data = response.json()
    assert len(json_data) == 1
    assert json_data[0]["id"] == str(session_id)
    assert json_data[0]["title"] == "Backend Prep"


def test_get_chat_session_details(client, monkeypatch):
    session_id = uuid.uuid4()
    mock_session = MagicMock(spec=ChatSession)
    mock_session.id = session_id
    mock_session.user_id = mock_user_id
    mock_session.title = "Backend Prep"
    mock_session.summary = "A quick summary"
    mock_session.pinned = False
    mock_session.archived = False
    mock_session.created_at = datetime.utcnow()
    mock_session.updated_at = datetime.utcnow()
    
    mock_message = MagicMock(spec=ChatMessage)
    mock_message.id = uuid.uuid4()
    mock_message.session_id = session_id
    mock_message.role = "user"
    mock_message.content = "Test message"
    mock_message.token_usage = 100
    mock_message.created_at = datetime.utcnow()
    
    mock_session.messages = [mock_message]

    async def mock_get_session(*args, **kwargs):
        return mock_session

    monkeypatch.setattr(
        "repositories.mentor.ChatSessionRepository.get_by_id_and_user_id",
        mock_get_session
    )

    response = client.get(f"/api/v1/mentor/sessions/{session_id}")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["id"] == str(session_id)
    assert len(json_data["messages"]) == 1
    assert json_data["messages"][0]["content"] == "Test message"


def test_update_chat_session(client, monkeypatch):
    session_id = uuid.uuid4()
    mock_session = MagicMock(spec=ChatSession)
    mock_session.id = session_id
    mock_session.user_id = mock_user_id
    mock_session.title = "Backend Prep"
    mock_session.summary = "A quick summary"
    mock_session.pinned = False
    mock_session.archived = False
    mock_session.created_at = datetime.utcnow()
    mock_session.updated_at = datetime.utcnow()

    async def mock_get_session(*args, **kwargs):
        return mock_session

    async def mock_update_session(*args, **kwargs):
        mock_session.title = "Updated Advisory"
        mock_session.pinned = True
        return mock_session

    monkeypatch.setattr(
        "repositories.mentor.ChatSessionRepository.get_by_id_and_user_id",
        mock_get_session
    )
    monkeypatch.setattr(
        "repositories.mentor.ChatSessionRepository.update",
        mock_update_session
    )

    response = client.put(
        f"/api/v1/mentor/sessions/{session_id}",
        json={"title": "Updated Advisory", "pinned": True}
    )
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["title"] == "Updated Advisory"
    assert json_data["pinned"] is True


def test_delete_chat_session(client, monkeypatch):
    session_id = uuid.uuid4()
    mock_session = MagicMock(spec=ChatSession)
    mock_session.id = session_id
    mock_session.user_id = mock_user_id
    mock_session.title = "Backend Prep"
    mock_session.summary = "A quick summary"
    mock_session.pinned = False
    mock_session.archived = False
    mock_session.created_at = datetime.utcnow()
    mock_session.updated_at = datetime.utcnow()

    async def mock_get_session(*args, **kwargs):
        return mock_session

    async def mock_remove_session(*args, **kwargs):
        return mock_session

    monkeypatch.setattr(
        "repositories.mentor.ChatSessionRepository.get_by_id_and_user_id",
        mock_get_session
    )
    monkeypatch.setattr(
        "repositories.mentor.ChatSessionRepository.remove",
        mock_remove_session
    )

    response = client.delete(f"/api/v1/mentor/sessions/{session_id}")
    assert response.status_code == 200
    assert response.json()["id"] == str(session_id)


def test_export_chat_session(client, monkeypatch):
    session_id = uuid.uuid4()
    export_id = uuid.uuid4()
    
    async def mock_export(*args, **kwargs):
        return {
            "id": export_id,
            "session_id": session_id,
            "export_type": "markdown",
            "export_url": "/api/v1/mentor/exports/session.md",
            "created_at": "2026-06-15T12:00:00Z"
        }

    monkeypatch.setattr(
        "services.mentor.MentorService.export_session",
        mock_export
    )

    response = client.post(
        f"/api/v1/mentor/sessions/{session_id}/export",
        json={"export_type": "markdown"}
    )
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["id"] == str(export_id)
    assert json_data["export_type"] == "markdown"
