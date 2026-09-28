import { Platform } from "react-native";
import Constants from "expo-constants";
import { getStorageItemAsync, setStorageItemAsync } from "@/utils/storage";
import { User } from "@/types";

async function getAuthHeaders() {
  let token = null;
  try {
    token = await getStorageItemAsync("access_token");
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

export async function updateProfile(
    name: string,
    phone: string,
    childName: string,
    childAge: string
): Promise<User> {
    const headers = await getAuthHeaders();
    const response = await apiFetch("/api/v1/profile", {
        method: "PUT",
        headers,
        body: JSON.stringify({
            name: name || undefined,
            phone: phone || undefined,
            child_name: childName || undefined,
            child_age: childAge ? parseInt(childAge, 10) : undefined,
        })
    });

    if (!response.ok) {
        throw new Error("Failed to update profile");
    }

    const updatedUser = await response.json();
    
    // Update local storage
    try {
        await setStorageItemAsync("user_data", JSON.stringify(updatedUser));
    } catch (e) {}
    
    return updatedUser;
}
