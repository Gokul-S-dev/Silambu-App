from datetime import datetime
from typing import Optional
from sqlalchemy import Boolean, DateTime, Integer, String, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    message: Mapped[str] = mapped_column(
        String(1000),
        nullable=False
    )

    action_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    is_read: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=func.now(),
        nullable=False
    )
