from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import ForeignKey, String, Text, JSON, DateTime, func, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base


class CareerRecommendation(Base):
    """
    SQLAlchemy model representing a batch of career recommendations generated for a user.
    """
    __tablename__ = "career_recommendations"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    recommendation_version: Mapped[str] = mapped_column(String(50), default="1.0", nullable=False)
    recommendation_result: Mapped[dict] = mapped_column(JSON, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User")
    matches: Mapped[list["CareerMatch"]] = relationship("CareerMatch", back_populates="recommendation", cascade="all, delete-orphan")


class CareerMatch(Base):
    """
    SQLAlchemy model representing an individual career match within a recommendation batch.
    """
    __tablename__ = "career_matches"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    recommendation_id: Mapped[UUID] = mapped_column(ForeignKey("career_recommendations.id", ondelete="CASCADE"), nullable=False, index=True)
    career_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    match_score: Mapped[int] = mapped_column(Integer, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)

    # Relationships
    recommendation: Mapped["CareerRecommendation"] = relationship("CareerRecommendation", back_populates="matches")
