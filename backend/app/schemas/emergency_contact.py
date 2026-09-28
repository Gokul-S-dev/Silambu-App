from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class EmergencyContactBase(BaseModel):
    name: str
    phone_number: str
    relation: Optional[str] = None

class EmergencyContactCreate(EmergencyContactBase):
    pass

class EmergencyContactResponse(EmergencyContactBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
