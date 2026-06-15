from datetime import datetime, date
from typing import Optional, Dict, Any
from uuid import UUID, uuid4
from sqlalchemy import String, Integer, Float, ForeignKey, JSON, Date, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base


class AnalyticsReport(Base):
    """
    SQLAlchemy model representing a premium generated report containing SWOT,
    insights, scores, and recommended actions.
    """
    __tablename__ = "analytics_reports"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True
    )
    report_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    
    # Store SWOT analysis, breakdowns, scores, action plans, and structural blocks
    data: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="analytics_reports")
    exports: Mapped[list["ReportExport"]] = relationship(
        "ReportExport", back_populates="report", cascade="all, delete-orphan"
    )


class AnalyticsSnapshot(Base):
    """
    SQLAlchemy model representing a historical snapshot of user progress metrics,
    used to calculate and render trend charts and development heatmaps over time.
    """
    __tablename__ = "analytics_snapshots"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True
    )
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    
    # Snapshot key scores
    resume_score: Mapped[float] = mapped_column(Float, default=0.0)
    ats_score: Mapped[float] = mapped_column(Float, default=0.0)
    career_match_score: Mapped[float] = mapped_column(Float, default=0.0)
    skill_gap_score: Mapped[float] = mapped_column(Float, default=0.0)
    roadmap_completion: Mapped[float] = mapped_column(Float, default=0.0)
    interview_readiness: Mapped[float] = mapped_column(Float, default=0.0)
    learning_streak: Mapped[int] = mapped_column(Integer, default=0)
    career_readiness_score: Mapped[float] = mapped_column(Float, default=0.0)
    overall_growth_score: Mapped[float] = mapped_column(Float, default=0.0)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="analytics_snapshots")


class UserMetric(Base):
    """
    SQLAlchemy model representing the cached latest unified key metrics and career readiness breakdown.
    """
    __tablename__ = "user_metrics"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    
    # Real-time scores
    resume_score: Mapped[float] = mapped_column(Float, default=0.0)
    ats_score: Mapped[float] = mapped_column(Float, default=0.0)
    career_match_score: Mapped[float] = mapped_column(Float, default=0.0)
    skill_gap_score: Mapped[float] = mapped_column(Float, default=0.0)
    roadmap_completion: Mapped[float] = mapped_column(Float, default=0.0)
    interview_readiness: Mapped[float] = mapped_column(Float, default=0.0)
    learning_streak: Mapped[int] = mapped_column(Integer, default=0)
    career_readiness_score: Mapped[float] = mapped_column(Float, default=0.0)
    overall_growth_score: Mapped[float] = mapped_column(Float, default=0.0)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="metrics", uselist=False)


class ReportExport(Base):
    """
    SQLAlchemy model representing generated reports export records (PDF, CSV, XLSX).
    """
    __tablename__ = "report_exports"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True
    )
    report_id: Mapped[Optional[UUID]] = mapped_column(
        ForeignKey("analytics_reports.id", ondelete="SET NULL"), nullable=True, index=True
    )
    export_type: Mapped[str] = mapped_column(String(50), nullable=False)  # pdf, csv, excel, markdown
    export_url: Mapped[str] = mapped_column(String(1024), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="report_exports")
    report: Mapped[Optional["AnalyticsReport"]] = relationship("AnalyticsReport", back_populates="exports")
