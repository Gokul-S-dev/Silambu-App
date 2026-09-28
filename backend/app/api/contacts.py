from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.emergency_contact import EmergencyContact
from app.schemas.emergency_contact import EmergencyContactCreate, EmergencyContactResponse

router = APIRouter(
    prefix="/api/v1/contacts",
    tags=["Contacts"],
)

@router.get("", response_model=List[EmergencyContactResponse])
def get_contacts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch all emergency contacts for the current user."""
    contacts = db.query(EmergencyContact).filter(
        EmergencyContact.user_id == current_user.id
    ).order_by(EmergencyContact.created_at.desc()).all()
    
    return contacts

@router.post("", response_model=EmergencyContactResponse)
def create_contact(
    data: EmergencyContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new emergency contact."""
    new_contact = EmergencyContact(
        user_id=current_user.id,
        name=data.name,
        phone_number=data.phone_number,
        relation=data.relation
    )
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    return new_contact

@router.delete("/{contact_id}")
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an emergency contact."""
    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == contact_id,
        EmergencyContact.user_id == current_user.id
    ).first()

    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    db.delete(contact)
    db.commit()
    return {"detail": "Contact deleted successfully"}
