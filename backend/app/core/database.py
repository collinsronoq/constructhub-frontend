from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings
from app.core.logging import setup_logger
from app.models.base import Base

# settings.DATABASE_URL should be like:
# sqlite (dev):  sqlite+aiosqlite:///./dev.db
# postgres:       postgresql+asyncpg://user:pass@host:port/dbname

engine = create_async_engine(
    settings.DATABASE_URL,
    future=True,
    echo=settings.DEBUG,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    autoflush=False,
    # autocommit=False,
)

logger = setup_logger("core.database")

# dependency for FastAPI
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def ensure_database_schema():
    """
    Create tables if they do not exist (dev/local convenience).
    Prefer running Alembic migrations in production.
    """
    # Import models so they are registered on Base.metadata
    from app import models  # noqa: F401
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schema ensured")
    except Exception:
        logger.exception("Failed to ensure database schema")
        raise

