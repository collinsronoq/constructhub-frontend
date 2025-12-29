import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine, AsyncConnection
from alembic import context
import os

# Load dotenv for DATABASE_URL
from dotenv import load_dotenv

load_dotenv("backend/.env")

# Alembic Config object
config = context.config
fileConfig(str(config.config_file_name))

# Import your models so autogenerate can detect schema changes
from app.models.base import Base
import app.models  # noqa: F401  - imports register all mapped models

target_metadata = Base.metadata


def _get_database_url() -> str:
    """
    Resolve the database URL from env or alembic.ini fallback.
    """
    url = os.getenv("DATABASE_URL")
    if url:
        return url
    return config.get_main_option("sqlalchemy.url")


def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = _get_database_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online():
    """Run migrations in 'online' mode with async support."""
    
    url = _get_database_url()
    
    # Create async engine (same as in database.py)
    connectable = create_async_engine(
        url,
        poolclass=pool.NullPool,  # good for migrations
        echo=False,
    )

    async with connectable.begin() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
