from pydantic import BaseModel
from typing import List
from datetime import datetime

class SensorReading(BaseModel):
    timestamp: str | datetime
    heart_rate: float
    spo2: float
    accel_x: float
    accel_y: float
    accel_z: float
    gyro_x: float
    gyro_y: float
    gyro_z: float
    latitude: float
    longitude: float
    speed: float
    activity: str
    tamper: int
    sos: int
    scenario: str

class PredictRequest(BaseModel):
    readings: List[SensorReading]
