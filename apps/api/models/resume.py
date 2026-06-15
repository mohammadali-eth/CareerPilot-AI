from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import ForeignKey, String, Text, JSON, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base


class Resume(Base):
    """
    SQLAlchemy model representing a parsed resume document.
    """
    __tablename__ = "resume"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    extracted_data: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User")
    scores: Mapped[list["ResumeScore"]] = relationship("ResumeScore", back_populates="resume", cascade="all, delete-orphan")
    ats_reports: Mapped[list["ATSReport"]] = relationship("ATSReport", back_populates="resume", cascade="all, delete-orphan")


class ResumeScore(Base):
    """
    SQLAlchemy model representing structural/content resume assessments.
    """
    __tablename__ = "resume_score"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    resume_id: Mapped[UUID] = mapped_column(ForeignKey("resume.id", ondelete="CASCADE"), nullable=False)
    overall_score: Mapped[int] = mapped_column(nullable=False)
    structure_score: Mapped[int] = mapped_column(nullable=False)
    content_score: Mapped[int] = mapped_column(nullable=False)
    suggestions: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)

    # Relationships
    resume: Mapped["Resume"] = relationship("Resume", back_populates="scores")


class ATSReport(Base):
    """
    SQLAlchemy model representing ATS (Applicant Tracking System) keyword relevance scores.
    """
    __tablename__ = "ats_report"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    resume_id: Mapped[UUID] = mapped_column(ForeignKey("resume.id", ondelete="CASCADE"), nullable=False)
    ats_score: Mapped[int] = mapped_column(nullable=False)
    missing_keywords: Mapped[list] = mapped_column(JSON, nullable=False)
    formatting_issues: Mapped[list] = mapped_column(JSON, nullable=False)
    relevance_score: Mapped[int] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)

    # Relationships
    resume: Mapped["Resume"] = relationship("Resume", back_populates="ats_reports")
