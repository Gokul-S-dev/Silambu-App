import type {
    ActivityData,
    Alert,
    Child,
    HealthData,
    LocationData,
} from "@/types";

export const mockChild: Child = {
  id: "child-001",
  name: "Aarav",
  age: 8,
  status: "warning",
};

export const mockHealth: HealthData = {
  heartRate: 114,
  spo2: 98,
  timestamp: "Just now",
};

export const mockLocation: LocationData = {
  latitude: 10.908133,
  longitude: 76.979870,
  label: "Last known location",
  timestamp: "Updated just now",
};

export const mockActivity: ActivityData = {
  activity: "Walking",
  status: "normal",
};

export const mockAlerts: Alert[] = [
  {
    id: "alert-1",
    type: "health",
    message: "LOW HEART RATE: 41 BPM.",
    timestamp: "2 min ago",
  }
];
