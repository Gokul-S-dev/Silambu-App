from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class NotificationBase(BaseModel):
    title: str
    message: str
    action_type: str


class NotificationCreate(NotificationBase):
    user_id: int


class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EmergencyRequest(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    message: Optional[str] = "Emergency! I need help."

