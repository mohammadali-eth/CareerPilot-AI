from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base


class AuditLog(Base):
    """
    SQLAlchemy model representing system audit logs for logins, role changes, exports, etc.
    """
    __tablename__ = "audit_logs"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[Optional[UUID]] = mapped_column(
        ForeignKey("user.id", ondelete="SET NULL"), nullable=True, index=True
    )
    action_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)  # LOGIN, ROLE_CHANGE, etc.
    description: Mapped[str] = mapped_column(String(1000), nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), nullable=False, index=True
    )

    # Relationship
    user = relationship("User", foreign_keys=[user_id])


class AdminAction(Base):
    """
    SQLAlchemy model tracking administrative interventions (user deactivation, deletes, etc.)
    """
    __tablename__ = "admin_actions"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    admin_id: Mapped[UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True
    )
    target_user_id: Mapped[Optional[UUID]] = mapped_column(
        ForeignKey("user.id", ondelete="SET NULL"), nullable=True, index=True
    )
    action_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)  # SUSPEND, ACTIVATE, DELETE, PASSWORD_RESET
    reason: Mapped[str] = mapped_column(String(1000), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), nullable=False, index=True
    )

    # Relationships
    admin = relationship("User", foreign_keys=[admin_id])
    target_user = relationship("User", foreign_keys=[target_user_id])


class SystemMetric(Base):
    """
    SQLAlchemy model storing system resource utilization snapshots for performance auditing
    """
    __tablename__ = "system_metrics"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    cpu_usage: Mapped[float] = mapped_column(Float, default=0.0)
    ram_usage: Mapped[float] = mapped_column(Float, default=0.0)
    disk_usage: Mapped[float] = mapped_column(Float, default=0.0)
    api_status: Mapped[str] = mapped_column(String(50), default="healthy")
    db_status: Mapped[str] = mapped_column(String(50), default="healthy")
    queue_status: Mapped[str] = mapped_column(String(50), default="healthy")
    worker_status: Mapped[str] = mapped_column(String(50), default="healthy")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), nullable=False, index=True
    )


class AIUsageMetric(Base):
    """
    SQLAlchemy model recording token usage consumption, model cost estimative, and API latency.
    """
    __tablename__ = "ai_usage_metrics"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[Optional[UUID]] = mapped_column(
        ForeignKey("user.id", ondelete="SET NULL"), nullable=True, index=True
    )
    provider: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # openai, gemini
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    input_tokens: Mapped[int] = mapped_column(Integer, default=0)
    output_tokens: Mapped[int] = mapped_column(Integer, default=0)
    cost_estimate: Mapped[float] = mapped_column(Float, default=0.0)
    latency_ms: Mapped[int] = mapped_column(Integer, default=0)
    status_code: Mapped[int] = mapped_column(Integer, default=200, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), nullable=False, index=True
    )

    # Relationship
    user = relationship("User", foreign_keys=[user_id])
