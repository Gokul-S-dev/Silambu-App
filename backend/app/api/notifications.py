from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.notification import Notification
from app.models.emergency_contact import EmergencyContact
from app.schemas.notification import NotificationResponse, EmergencyRequest

router = APIRouter(
    prefix="/api/v1/notifications",
    tags=["Notifications"],
)

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch all notifications for the current user."""
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()
    
    return notifications

@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a notification as read."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    db.commit()
    db.refresh(notification)
    
    return notification

@router.post("/emergency")
def trigger_emergency(
    data: EmergencyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trigger an emergency alert."""
    contacts = db.query(EmergencyContact).filter(
        EmergencyContact.user_id == current_user.id
    ).all()
    
    location_str = f"Lat: {data.latitude}, Lon: {data.longitude}" if data.latitude and data.longitude else "Location not available"
    full_message = f"{data.message}\nUser Location: {location_str}"
    
    # Mocking push notifications to Emergency Contacts
    print(f"--- EMERGENCY ALERT TRIGGERED BY {current_user.name} ({current_user.email}) ---")
    print(f"Message: {full_message}")
    for contact in contacts:
        print(f"Mock sending Push/SMS to Contact: {contact.name} ({contact.phone_number})")
        
    # Mocking push notification to Emergency Services
    print("Mock sending Alert to Emergency Services (Police/Ambulance).")
    
    # Store an in-app notification for the user to keep a record
    record = Notification(
        user_id=current_user.id,
        title="Emergency Alert Sent",
        message=f"Alert sent to {len(contacts)} contacts.",
        action_type="EMERGENCY_SENT"
    )
    db.add(record)
    db.commit()
    
    return {"detail": "Emergency alerts dispatched successfully."}
