from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.models.user import User
from app.models.notification import Notification
from app.schemas.iot import PredictRequest
import httpx
from datetime import datetime

LATEST_DEVICE_STATE = {
    "latest_reading": None,
    "latest_prediction": None,
    "timestamp": None
}

router = APIRouter(
    prefix="/api/v1/iot",
    tags=["IoT"],
)

class IoTSosRequest(BaseModel):
    device_id: str
    user_id: int | None = None
    status: str | None = "critical"

@router.post("/sos", status_code=status.HTTP_201_CREATED)
def trigger_sos(
    data: IoTSosRequest,
    db: Session = Depends(get_db),
):
    """
    Endpoint for IoT devices to trigger an SOS.
    For demonstration, if user_id is not provided, it sends the alert to the first user in DB.
    """
    target_user_id = data.user_id
    if not target_user_id:
        # Fallback to the first user in the database
        first_user = db.query(User).first()
        if not first_user:
            raise HTTPException(status_code=400, detail="No users found to notify.")
        target_user_id = first_user.id
    else:
        user = db.query(User).filter(User.id == target_user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

    notification = Notification(
        user_id=target_user_id,
        title="SOS Alert (IoT)",
        message=f"SOS triggered by device {data.device_id}!",
        action_type="iot_sos"
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

    return {"message": "SOS triggered successfully", "notification_id": notification.id}

@router.post("/predict", status_code=status.HTTP_200_OK)
async def predict_iot_data(
    data: PredictRequest,
    db: Session = Depends(get_db)
):
    """
    Endpoint to receive IoT readings and forward them to the ML prediction model.
    """
    ML_MODEL_URL = "http://3.208.86.117:8000/predict"
    
    try:
        # Pydantic v1 vs v2: model_dump() vs dict()
        # The schema is simple so dict() usually works for v1, or model_dump() for v2.
        # Fastapi automatically handles JSON encoding but for httpx we need a dict
        payload = data.dict() if hasattr(data, "dict") else data.model_dump()
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                ML_MODEL_URL,
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            
            # Save the state globally for the dashboard to fetch
            if payload.get("readings") and len(payload["readings"]) > 0:
                LATEST_DEVICE_STATE["latest_reading"] = payload["readings"][-1]
                LATEST_DEVICE_STATE["latest_prediction"] = result
                LATEST_DEVICE_STATE["timestamp"] = datetime.utcnow().isoformat()
            
            # Trigger an SOS if the model detects a fall or emergency.
            prediction_label = result.get("prediction", "").lower()
            if prediction_label in ["fall", "emergency"]:
                # Notify the first user in DB as a fallback demonstration
                first_user = db.query(User).first()
                if first_user:
                    notification = Notification(
                        user_id=first_user.id,
                        title="EMERGENCY ALERT",
                        message=f"Model detected a {prediction_label.upper()} event!",
                        action_type="iot_sos"
                    )
                    db.add(notification)
                    db.commit()
            
            return result
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"ML Model Error: {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to communicate with ML Model: {str(e)}")

@router.get("/state", status_code=status.HTTP_200_OK)
def get_device_state():
    """
    Endpoint for frontend dashboard to fetch the most recent sensor reading 
    and prediction result.
    """
    return LATEST_DEVICE_STATE
