from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4
from sqlalchemy import ForeignKey, String, Text, JSON, DateTime, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base


class InterviewSession(Base):
    """
    SQLAlchemy model representing an interview simulation session.
    """
    __tablename__ = "interview_sessions"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    interview_type: Mapped[str] = mapped_column(String(100), nullable=False)
    target_career: Mapped[str] = mapped_column(String(255), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), nullable=False)
    score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    readiness_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    report: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User")
    questions: Mapped[List["InterviewQuestion"]] = relationship(
        "InterviewQuestion",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="InterviewQuestion.created_at"
    )


class InterviewQuestion(Base):
    """
    SQLAlchemy model representing a dynamically generated interview question.
    """
    __tablename__ = "interview_questions"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    session_id: Mapped[UUID] = mapped_column(ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    question: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), nullable=False)

    # Relationships
    session: Mapped["InterviewSession"] = relationship("InterviewSession", back_populates="questions")
    answer: Mapped[Optional["InterviewAnswer"]] = relationship(
        "InterviewAnswer",
        back_populates="question",
        uselist=False,
        cascade="all, delete-orphan"
    )


class InterviewAnswer(Base):
    """
    SQLAlchemy model representing the user's answer and AI evaluation feedback.
    """
    __tablename__ = "interview_answers"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    question_id: Mapped[UUID] = mapped_column(ForeignKey("interview_questions.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    feedback: Mapped[dict] = mapped_column(JSON, nullable=False)

    # Relationships
    question: Mapped["InterviewQuestion"] = relationship("InterviewQuestion", back_populates="answer")
