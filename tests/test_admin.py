import os
import sys
import uuid
import pytest
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient

# Add apps/api to path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "apps", "api"))

from main import app
from database.session import get_db
from api.dependencies.auth import get_current_active_user, RoleChecker
from models.user import User

# Mock user contexts
mock_user_admin = User(
    id=uuid.uuid4(),
    email="admin@careerpilot.ai",
    is_active=True,
    is_verified=True,
    role="ADMIN",
    is_superuser=True
)

mock_user_super = User(
    id=uuid.uuid4(),
    email="superadmin@careerpilot.ai",
    is_active=True,
    is_verified=True,
    role="SUPER_ADMIN",
    is_superuser=True
)

mock_regular_user = User(
    id=uuid.uuid4(),
    email="user@careerpilot.ai",
    is_active=True,
    is_verified=True,
    role="user",
    is_superuser=False
)

current_test_user = mock_user_admin


async def override_get_current_active_user():
    return current_test_user


async def override_get_db():
    session = AsyncMock()
    
    # Mock database responses for total users, active users, audits, etc.
    mock_executor = AsyncMock()
    mock_executor.scalar = MagicMock(return_value=10)
    mock_executor.scalars = MagicMock(return_value=MagicMock(all=MagicMock(return_value=[])))
    mock_executor.first = MagicMock(return_value=MagicMock(
        total_input_tokens=1000,
        total_output_tokens=500,
        total_cost=0.05,
        avg_latency=250.0,
        total_requests=2,
        failed_requests=0
    ))
    
    session.execute = AsyncMock(return_value=mock_executor)
    session.scalar = AsyncMock(return_value=5)
    session.get = AsyncMock(return_value=mock_regular_user)
    yield session


@pytest.fixture
def client():
    app.dependency_overrides[get_current_active_user] = override_get_current_active_user
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_admin_dashboard_unauthorized(client):
    """
    Test that standard users are blocked from admin endpoints
    """
    global current_test_user
    current_test_user = mock_regular_user

    res = client.get("/api/v1/admin/analytics")
    assert res.status_code == 403
    assert "permission" in res.json()["detail"].lower()


def test_admin_dashboard_authorized(client, monkeypatch):
    """
    Test authorized admin getting platform summary stats
    """
    global current_test_user
    current_test_user = mock_user_admin

    res = client.get("/api/v1/admin/analytics")
    assert res.status_code == 200
    data = res.json()
    assert "total_users" in data
    assert "ai_requests" in data


def test_system_health(client):
    """
    Test administrative system diagnostics endpoint
    """
    global current_test_user
    current_test_user = mock_user_admin

    res = client.get("/api/v1/admin/system-health")
    assert res.status_code == 200
    data = res.json()
    assert data["api_status"] == "healthy"
    assert "cpu_usage_pct" in data


def test_suspend_user_endpoint(client):
    """
    Test user deactivation moderation action
    """
    global current_test_user
    current_test_user = mock_user_admin

    target_id = str(uuid.uuid4())
    res = client.put(f"/api/v1/admin/users/{target_id}/suspend", json={"reason": "Terms violations"})
    assert res.status_code == 200
    assert "suspended" in res.json()["message"].lower()


def test_activate_user_endpoint(client):
    """
    Test user activation moderation action
    """
    global current_test_user
    current_test_user = mock_user_admin

    target_id = str(uuid.uuid4())
    res = client.put(f"/api/v1/admin/users/{target_id}/activate", json={"reason": "Appeals approved"})
    assert res.status_code == 200
    assert "activated" in res.json()["message"].lower()


def test_assign_role_escalation_protection(client):
    """
    Test that standard admin cannot change roles (restricted to SUPER_ADMIN)
    """
    global current_test_user
    current_test_user = mock_user_admin

    target_id = str(uuid.uuid4())
    res = client.put(
        f"/api/v1/admin/users/{target_id}/role",
        json={"role": "ADMIN", "reason": "Upgrade"}
    )
    assert res.status_code == 403


def test_assign_role_authorized(client):
    """
    Test that SUPER_ADMIN can assign roles successfully
    """
    global current_test_user
    current_test_user = mock_user_super

    target_id = str(uuid.uuid4())
    res = client.put(
        f"/api/v1/admin/users/{target_id}/role",
        json={"role": "SUPPORT_AGENT", "reason": "Upgrade to agent"}
    )
    assert res.status_code == 200
    assert "updated" in res.json()["message"].lower()


def test_ai_usage_stats(client):
    """
    Test AI token consumption analytics endpoint
    """
    global current_test_user
    current_test_user = mock_user_admin

    res = client.get("/api/v1/admin/ai-usage")
    assert res.status_code == 200
    data = res.json()
    assert "aggregate" in data
    assert "providers" in data


def test_audit_logs_endpoint(client):
    """
    Test audit log retrieval endpoint
    """
    global current_test_user
    current_test_user = mock_user_admin

    res = client.get("/api/v1/admin/audit-logs")
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "logs" in data
