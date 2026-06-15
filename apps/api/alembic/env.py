import asyncio
import os
import sys
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Add current apps/api folder to path to allow resolution of core and database modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.config import settings
from database.base import Base
# Import all models to ensure they are registered on Base.metadata
from models.user import User, Profile, AuthToken # noqa
from models.resume import Resume, ResumeScore, ATSReport # noqa
from models.career import CareerRecommendation, CareerMatch # noqa
from models.roadmap import Roadmap, RoadmapMilestone, RoadmapProgress # noqa
from models.interview import InterviewSession, InterviewQuestion, InterviewAnswer # noqa

# Alembic Config object representing the INI values
config = context.config

# Setup logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set database metadata target for autogeneration
target_metadata = Base.metadata

# Set database URL dynamically from environment configuration
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:
    """Helper method to run migrations synchronously inside context transaction."""
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
