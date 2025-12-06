from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings

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

# dependency for FastAPI
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

