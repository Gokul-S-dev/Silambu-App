from datetime import datetime
from sqlalchemy import DateTime, Integer, String, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

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

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    phone_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    relation: Mapped[str] = mapped_column(
        String(100),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=func.now(),
        nullable=False
    )
