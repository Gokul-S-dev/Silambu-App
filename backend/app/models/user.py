from datetime import datetime
from typing import Optional
from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    phone: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True
    )

    password_hash: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )

    google_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=True
    )

    expo_push_token: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True
    )

    avatar_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=func.now(),
        nullable=False
    )

    child = relationship("Child", backref="user", uselist=False)