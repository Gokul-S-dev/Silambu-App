from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_DIR = BACKEND_DIR.parent

ENV_FILES = [
    PROJECT_DIR / ".env",
    BACKEND_DIR / ".env",
    Path(".env"),
]

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/college_db"
    SECRET_KEY: str = "change-this-to-a-long-random-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    SQLITE_FALLBACK_URL: str = f"sqlite:///{BACKEND_DIR / 'silambu.db'}"

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"

    model_config = SettingsConfigDict(
        env_file=[str(p) for p in ENV_FILES if p.exists()] or ".env",
        extra="ignore",
    )

settings = Settings()