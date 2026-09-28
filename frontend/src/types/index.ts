export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  child?: Child;
}


export interface Child {
  id: string;
  name: string;
  age?: number;
  status: "safe" | "warning" | "danger";
}

export interface HealthData {
  heartRate: number;
  spo2?: number;
  timestamp: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  label: string;
  timestamp: string;
}

export interface ActivityData {
  activity: string;
  status: "normal" | "abnormal";
}

export interface Alert {
  id: string;
  type: "sos" | "tamper" | "health" | "movement" | "location";
  message: string;
  timestamp: string;
}
