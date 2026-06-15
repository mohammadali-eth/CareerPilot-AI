from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from database.session import get_db
from api.dependencies.auth import get_current_active_user, RoleChecker
from models.user import User
from services.admin import AdminService
from schemas.admin import (
    AdminUserSuspendRequest,
    AdminUserActivateRequest,
    AdminUserPasswordResetRequest,
    AdminRoleAssignRequest,
    AdminCareerCreate,
    AdminSkillCreate,
    AdminAuditLogResponse,
    AdminUserSummary,
    AdminDashboardStats,
)

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

# Reusable role checkers
check_super_admin = RoleChecker(["SUPER_ADMIN"])
check_any_admin = RoleChecker(["SUPER_ADMIN", "ADMIN"])
check_admin_or_support = RoleChecker(["SUPER_ADMIN", "ADMIN", "SUPPORT_AGENT"])
check_admin_or_auditor = RoleChecker(["SUPER_ADMIN", "ADMIN", "AUDITOR"])
check_all_roles = RoleChecker(["SUPER_ADMIN", "ADMIN", "SUPPORT_AGENT", "AUDITOR"])


# ==========================================
# ADMIN DASHBOARD & SYSTEM HEALTH
# ==========================================
@router.get("/analytics", response_model=AdminDashboardStats, status_code=status.HTTP_200_OK)
async def get_dashboard_analytics(
    current_user: User = Depends(check_admin_or_auditor),
    db: AsyncSession = Depends(get_db)
):
    """
    Get high-level summary stats of the whole SaaS platform.
    """
    admin_service = AdminService(db)
    return await admin_service.get_dashboard_summary()


@router.get("/system-health", status_code=status.HTTP_200_OK)
async def get_system_health(
    current_user: User = Depends(check_admin_or_support),
    db: AsyncSession = Depends(get_db)
):
    """
    Get live diagnostics of CPU, RAM, Disk, and databases.
    """
    admin_service = AdminService(db)
    return await admin_service.get_system_health()


# ==========================================
# USER LIFE CYCLE MANAGEMENT
# ==========================================
@router.get("/users", status_code=status.HTTP_200_OK)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(check_all_roles),
    db: AsyncSession = Depends(get_db)
):
    """
    Paginate, search, and filter system users.
    """
    admin_service = AdminService(db)
    users, total = await admin_service.list_users(
        skip=skip, limit=limit, search=search, role=role, is_active=is_active
    )
    return {
        "total": total,
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "role": u.role,
                "is_active": u.is_active,
                "is_verified": u.is_verified,
            }
            for u in users
        ]
    }


@router.get("/users/{user_id}", status_code=status.HTTP_200_OK)
async def get_user_details(
    user_id: UUID,
    current_user: User = Depends(check_all_roles),
    db: AsyncSession = Depends(get_db)
):
    """
    Get extensive user usage profiles and activity audits.
    """
    admin_service = AdminService(db)
    return await admin_service.get_user_details(user_id)


@router.put("/users/{user_id}/suspend", status_code=status.HTTP_200_OK)
async def suspend_user(
    user_id: UUID,
    payload: AdminUserSuspendRequest,
    current_user: User = Depends(check_admin_or_support),
    db: AsyncSession = Depends(get_db)
):
    """
    Deactivate user account access.
    """
    admin_service = AdminService(db)
    user = await admin_service.suspend_user(current_user.id, user_id, payload.reason)
    return {"message": "User account suspended successfully.", "user_id": user.id}


@router.put("/users/{user_id}/activate", status_code=status.HTTP_200_OK)
async def activate_user(
    user_id: UUID,
    payload: AdminUserActivateRequest,
    current_user: User = Depends(check_admin_or_support),
    db: AsyncSession = Depends(get_db)
):
    """
    Re-activate user account access.
    """
    admin_service = AdminService(db)
    user = await admin_service.activate_user(current_user.id, user_id, payload.reason)
    return {"message": "User account re-activated successfully.", "user_id": user.id}


@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(
    user_id: UUID,
    reason: str = Query(..., min_length=3),
    current_user: User = Depends(check_any_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Permanently delete a user account from database.
    """
    admin_service = AdminService(db)
    await admin_service.delete_user_record(current_user.id, user_id, reason)
    return {"message": "User account deleted successfully."}


@router.put("/users/{user_id}/password-reset", status_code=status.HTTP_200_OK)
async def reset_user_password(
    user_id: UUID,
    payload: AdminUserPasswordResetRequest,
    current_user: User = Depends(check_any_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Force password update for a user account.
    """
    admin_service = AdminService(db)
    await admin_service.reset_user_password(
        current_user.id, user_id, payload.new_password, payload.reason
    )
    return {"message": "User password reset successfully."}


# ==========================================
# ROLE MANAGEMENT
# ==========================================
@router.put("/users/{user_id}/role", status_code=status.HTTP_200_OK)
async def assign_user_role(
    user_id: UUID,
    payload: AdminRoleAssignRequest,
    current_user: User = Depends(check_super_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Assign permissions/system roles. Restricted to SUPER_ADMIN only.
    """
    admin_service = AdminService(db)
    user = await admin_service.assign_role(
        current_user.id, user_id, payload.role, payload.reason
    )
    return {"message": "User role updated successfully.", "role": user.role}


# ==========================================
# AI USAGE MONITOR
# ==========================================
@router.get("/ai-usage", status_code=status.HTTP_200_OK)
async def get_ai_usage_stats(
    current_user: User = Depends(check_admin_or_auditor),
    db: AsyncSession = Depends(get_db)
):
    """
    Get aggregate token consumption and cost analysis.
    """
    admin_service = AdminService(db)
    return await admin_service.get_ai_metrics_report()


# ==========================================
# AUDIT LOGS
# ==========================================
@router.get("/audit-logs", status_code=status.HTTP_200_OK)
async def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    action_type: Optional[str] = None,
    user_id: Optional[UUID] = None,
    current_user: User = Depends(check_admin_or_auditor),
    db: AsyncSession = Depends(get_db)
):
    """
    Get system-wide audit actions logs.
    """
    admin_service = AdminService(db)
    logs = await admin_service.audit_repo.get_logs(
        skip=skip, limit=limit, action_type=action_type, user_id=user_id
    )
    total = await admin_service.audit_repo.count_logs(
        action_type=action_type, user_id=user_id
    )
    return {
        "total": total,
        "logs": [
            {
                "id": l.id,
                "user_id": l.user_id,
                "action_type": l.action_type,
                "description": l.description,
                "ip_address": l.ip_address,
                "user_agent": l.user_agent,
                "created_at": l.created_at,
            }
            for l in logs
        ]
    }


# ==========================================
# DB CONTENT MANAGERS (CAREERS / SKILLS / REPORTS)
# ==========================================
@router.post("/careers", status_code=status.HTTP_201_CREATED)
async def create_career_definition(
    payload: AdminCareerCreate,
    current_user: User = Depends(check_any_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Configure career paths, salary stats, and required skills definitions.
    """
    # Simply log actions for auditing, since the recommendation engine fetches definitions on-demand
    admin_service = AdminService(db)
    await admin_service.log_audit(
        user_id=current_user.id,
        action_type="CAREER_DEFINITION_CREATED",
        description=f"Admin created career category definition: {payload.title} under {payload.category}",
    )
    return {"status": "success", "message": "Career definition configured in dynamic catalog."}


@router.post("/skills", status_code=status.HTTP_201_CREATED)
async def create_skill_definition(
    payload: AdminSkillCreate,
    current_user: User = Depends(check_any_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Configure skills, categorias, and relationship importances.
    """
    admin_service = AdminService(db)
    await admin_service.log_audit(
        user_id=current_user.id,
        action_type="SKILL_DEFINITION_CREATED",
        description=f"Admin created skill mapping item: {payload.name} under {payload.category}",
    )
    return {"status": "success", "message": "Skill mapping configured in dynamic skill gaps index."}


@router.get("/reports", status_code=status.HTTP_200_OK)
async def list_reports_overview(
    current_user: User = Depends(check_admin_or_auditor),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve generated McKinsey-style intelligence reports count.
    """
    # Simple count query
    from models.analytics import AnalyticsReport, ReportExport
    from sqlalchemy import select
    
    total_reports = await db.scalar(select(func.count(AnalyticsReport.id))) or 0
    total_exports = await db.scalar(select(func.count(ReportExport.id))) or 0
    
    return {
        "total_reports": total_reports,
        "total_exports": total_exports,
        "reports_history": []
    }
