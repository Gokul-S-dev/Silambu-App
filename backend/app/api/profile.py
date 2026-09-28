from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.child import Child
from app.schemas.auth import UserResponse

router = APIRouter(
    prefix="/api/v1/profile",
    tags=["Profile"],
)

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    child_name: Optional[str] = None
    child_age: Optional[int] = None
    expo_push_token: Optional[str] = None

@router.put("", response_model=UserResponse)
def update_profile(
    data: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update Guardian and Child details."""
    
    # Update User (Guardian)
    if data.name is not None:
        current_user.name = data.name.strip()
    if data.phone is not None:
        current_user.phone = data.phone.strip()
    if data.expo_push_token is not None:
        current_user.expo_push_token = data.expo_push_token.strip()
        
    # Update or Create Child
    if data.child_name is not None or data.child_age is not None:
        if current_user.child:
            if data.child_name is not None:
                current_user.child.name = data.child_name.strip()
            if data.child_age is not None:
                current_user.child.age = data.child_age
        else:
            if data.child_name:
                new_child = Child(
                    user_id=current_user.id,
                    name=data.child_name.strip(),
                    age=data.child_age
                )
                db.add(new_child)
                
    db.commit()
    db.refresh(current_user)
    
    return current_user
