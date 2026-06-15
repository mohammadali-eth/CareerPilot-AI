from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from core.config import settings

# Create asynchronous database connection engine
# Echo enables SQL query logging in local development mode
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True
)

# Async session factory
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency injection hook.
    Spins up a new isolated async database session per request,
    guaranteeing automatic rollback on error and resource cleanup/close on completion.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
            
            
async def init_db() -> None:
    """
    Utility initialization helper to verify connection state.
    Actual tables creation should be managed via Alembic migrations.
    """
    from sqlalchemy import text
    async with engine.begin() as conn:
        # Verify connection test
        await conn.execute(text("SELECT 1"))
