import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

logger = logging.getLogger("uvicorn.error")


def get_engine():
    db_url = settings.DATABASE_URL
    if db_url.startswith("sqlite"):
        return create_engine(
            db_url,
            connect_args={"check_same_thread": False},
        )

    # Attempt PostgreSQL connection
    try:
        pg_engine = create_engine(
            db_url,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 2},
        )
        with pg_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info(f"Connected to PostgreSQL database: {db_url}")
        return pg_engine
    except Exception as exc:
        logger.warning(
            f"PostgreSQL connection failed ({exc}). "
            f"Falling back to local SQLite database at {settings.SQLITE_FALLBACK_URL}"
        )
        return create_engine(
            settings.SQLITE_FALLBACK_URL,
            connect_args={"check_same_thread": False},
        )


engine = get_engine()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()