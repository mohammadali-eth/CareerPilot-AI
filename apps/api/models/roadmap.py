from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import ForeignKey, String, Text, JSON, DateTime, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base


class Roadmap(Base):
    """
    SQLAlchemy model representing a personalized career learning roadmap generated for a user.
    """
    __tablename__ = "roadmaps"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    target_career: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    timeline: Mapped[str] = mapped_column(String(100), nullable=False)
    estimated_completion: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)
    roadmap_data: Mapped[dict] = mapped_column(JSON, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User")
    milestones: Mapped[list["RoadmapMilestone"]] = relationship(
        "RoadmapMilestone",
        back_populates="roadmap",
        cascade="all, delete-orphan",
        order_by="RoadmapMilestone.target_date"
    )
    progress_records: Mapped[list["RoadmapProgress"]] = relationship(
        "RoadmapProgress",
        back_populates="roadmap",
        cascade="all, delete-orphan"
    )


class RoadmapMilestone(Base):
    """
    SQLAlchemy model representing a distinct milestone within a roadmap.
    """
    __tablename__ = "roadmap_milestones"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    roadmap_id: Mapped[UUID] = mapped_column(ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    target_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completion_percentage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    roadmap: Mapped["Roadmap"] = relationship("Roadmap", back_populates="milestones")
    progress_records: Mapped[list["RoadmapProgress"]] = relationship(
        "RoadmapProgress",
        back_populates="milestone",
        cascade="all, delete-orphan"
    )


class RoadmapProgress(Base):
    """
    SQLAlchemy model representing the user's progress tracking for a roadmap milestone.
    """
    __tablename__ = "roadmap_progress"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    roadmap_id: Mapped[UUID] = mapped_column(ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False, index=True)
    milestone_id: Mapped[UUID] = mapped_column(ForeignKey("roadmap_milestones.id", ondelete="CASCADE"), nullable=False, index=True)
    progress: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    roadmap: Mapped["Roadmap"] = relationship("Roadmap", back_populates="progress_records")
    milestone: Mapped["RoadmapMilestone"] = relationship("RoadmapMilestone", back_populates="progress_records")
