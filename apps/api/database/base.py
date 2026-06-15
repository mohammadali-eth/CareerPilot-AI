from datetime import datetime
from sqlalchemy import DateTime, MetaData
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.sql import func

# Custom naming convention to prevent lock-collisions or manual constraint naming conflicts
POSTGRES_NAMING_CONVENTIONS = {
    "ix": "idx_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

# Core MetaData container
metadata = MetaData(naming_convention=POSTGRES_NAMING_CONVENTIONS)


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy database models.
    Enforces unified metadata schemas and auditing timestamps.
    """
    metadata = metadata

    # Common audit fields automatically shared by all models
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

# Import all models to ensure they are registered on Base.metadata
from models.user import User, Profile, AuthToken # noqa

