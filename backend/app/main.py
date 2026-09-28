import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app.api.auth import router as auth_router
from app.api.iot import router as iot_router
from app.api.notifications import router as notifications_router
from app.api.profile import router as profile_router
from app.api.contacts import router as contacts_router
from app.db.base import Base
from app.db.session import engine
from app.models.user import User  # noqa: F401 - ensure models are registered
from app.models.notification import Notification  # noqa: F401 - ensure models are registered
from app.models.child import Child # noqa: F401 - ensure models are registered
from app.models.emergency_contact import EmergencyContact # noqa: F401 - ensure models are registered

logger = logging.getLogger("uvicorn.error")


def sync_db_schema(eng):
    try:
        inspector = inspect(eng)
        if "users" in inspector.get_table_names():
            existing_cols = {c["name"] for c in inspector.get_columns("users")}
            with eng.begin() as conn:
                if "name" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN name VARCHAR(255)"))
                if "phone" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(50)"))
                if "created_at" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
                if "google_id" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR(255)"))
                if "avatar_url" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500)"))
                if "expo_push_token" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN expo_push_token VARCHAR(255)"))
                try:
                    conn.execute(text("ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL"))
                except Exception:
                    pass
    except Exception as exc:
        logger.warning(f"Schema sync warning: {exc}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables gracefully at startup
    try:
        Base.metadata.create_all(bind=engine)
        sync_db_schema(engine)
        logger.info("Database initialized and tables verified.")
    except Exception as exc:
        logger.error(f"Failed to initialize database tables: {exc}")
    yield



app = FastAPI(
    title="Silambu API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration allowing mobile clients, Expo, web, and local development
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://.*",
    allow_origins=[
        "http://localhost:8081",
        "http://localhost:19006",
        "http://localhost:3000",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:3000",
        "http://10.0.2.2:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(iot_router)
app.include_router(notifications_router)
app.include_router(profile_router)
app.include_router(contacts_router)


@app.get("/")
def root():
    return {
        "message": "Silambu API is running",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    db_status = "ok"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"unhealthy: {exc}"

    return {
        "status": "healthy" if db_status == "ok" else "degraded",
        "database": db_status,
    }