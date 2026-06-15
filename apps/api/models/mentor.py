from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4
from sqlalchemy import Boolean, DateTime, ForeignKey, String, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base

class ChatSession(Base):
    """
    SQLAlchemy model representing an AI Mentor Chat Session.
    """
    __tablename__ = "chat_sessions"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    messages: Mapped[List["ChatMessage"]] = relationship(
        "ChatMessage",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="ChatMessage.created_at"
    )
    exports: Mapped[List["ChatExport"]] = relationship(
        "ChatExport",
        back_populates="session",
        cascade="all, delete-orphan"
    )


class ChatMessage(Base):
    """
    SQLAlchemy model representing a single message within a Chat Session.
    """
    __tablename__ = "chat_messages"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    session_id: Mapped[UUID] = mapped_column(ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    token_usage: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Custom message-specific timestamp to track conversation flow order accurately
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
        nullable=False
    )

    # Relationships
    session: Mapped["ChatSession"] = relationship("ChatSession", back_populates="messages")


class ChatExport(Base):
    """
    SQLAlchemy model representing an exported file resource for a Chat Session.
    """
    __tablename__ = "chat_exports"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    session_id: Mapped[UUID] = mapped_column(ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    export_type: Mapped[str] = mapped_column(String(50), nullable=False)
    export_url: Mapped[str] = mapped_column(String(1024), nullable=False)

    # Relationships
    session: Mapped["ChatSession"] = relationship("ChatSession", back_populates="exports")
