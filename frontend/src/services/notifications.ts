import { Platform } from "react-native";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

// Use the same dynamic API fetch logic from auth or duplicate it if needed
// For simplicity, we can import it if it was exported, or redefine a simple fetch wrapper.
// Let's create a specialized fetch for authenticated requests.

import { getCurrentUser } from "./auth";

async function getAuthHeaders() {
  let token = null;
  try {
    token = await SecureStore.getItemAsync("access_token");
  } catch (e) {}

  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
}

function getCandidateBaseUrls(): string[] {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  const candidates: string[] = [];

  const hostUri = Constants.expoConfig?.hostUri;
  const detectedHost = hostUri ? hostUri.split(":")[0] : null;

  if (Platform.OS === "web") {
    if (envUrl) candidates.push(envUrl);
    candidates.push("http://localhost:8000");
    candidates.push("http://127.0.0.1:8000");
  } else {
    if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
      candidates.push(envUrl);
    }
    if (detectedHost) {
      candidates.push(`http://${detectedHost}:8000`);
    }
    if (Platform.OS === "android") {
      candidates.push("http://10.0.2.2:8000");
      candidates.push("http://10.10.136.88:8000");
    }
    if (envUrl) candidates.push(envUrl);
    candidates.push("http://localhost:8000");
    candidates.push("http://127.0.0.1:8000");
  }
  return Array.from(new Set(candidates.filter(Boolean)));
}

let cachedBaseUrl: string | null = null;

async function apiFetch(endpoint: string, init: RequestInit): Promise<Response> {
  const cleanPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (cachedBaseUrl) {
    try {
      const response = await fetch(`${cachedBaseUrl}${cleanPath}`, init);
      return response;
    } catch {
      cachedBaseUrl = null;
    }
  }

  const candidates = getCandidateBaseUrls();
  let lastError: any = null;

  for (const base of candidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(`${base}${cleanPath}`, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      cachedBaseUrl = base;
      return response;
    } catch (err: any) {
      lastError = err;
    }
  }

  throw new Error(`Unable to connect: ${lastError?.message || lastError}`);
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  action_type: string;
  is_read: boolean;
  created_at: string;
}

export async function fetchNotifications(): Promise<Notification[]> {
  const headers = await getAuthHeaders();
  const response = await apiFetch("/api/v1/notifications", {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return response.json();
}

export async function markNotificationAsRead(id: number): Promise<Notification> {
  const headers = await getAuthHeaders();
  const response = await apiFetch(`/api/v1/notifications/${id}/read`, {
    method: "PUT",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }

  return response.json();
}

export async function sendSosAlert(): Promise<void> {
  const headers = await getAuthHeaders();
  // Using the new IoT endpoint for the button as well, or the frontend could have its own endpoint.
  // We'll use the IoT endpoint and pass a generated device_id for the frontend.
  const user = await getCurrentUser();
  const response = await apiFetch("/api/v1/iot/sos", {
    method: "POST",
    headers,
    body: JSON.stringify({
      device_id: "frontend-app",
      user_id: user?.id ? parseInt(user.id, 10) : null,
      status: "critical"
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send SOS");
  }
}
