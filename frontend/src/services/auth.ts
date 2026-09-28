import { Platform } from "react-native";
import Constants from "expo-constants";
import { getStorageItemAsync, setStorageItemAsync, deleteStorageItemAsync } from "@/utils/storage";
import type { User } from "@/types";

let currentUser: User | null = null;
let cachedBaseUrl: string | null = null;

/**
 * Returns candidate backend URLs based on environment, platform, and network.
 */
function getCandidateBaseUrls(): string[] {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  const candidates: string[] = [];

  // Extract host IP from Expo bundler (e.g. 10.10.136.88:8081 -> 10.10.136.88)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any)?.manifest?.debuggerHost;
  const detectedHost = hostUri ? hostUri.split(":")[0] : null;

  if (Platform.OS === "web") {
    if (envUrl) candidates.push(envUrl);
    candidates.push("http://localhost:8000");
    candidates.push("http://127.0.0.1:8000");
  } else {
    // Native (Android / iOS):
    // 1. If an explicit remote IP/domain (not localhost) is configured in env, try it first
    if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
      candidates.push(envUrl);
    }

    // 2. Dynamic Expo packager host IP (works seamlessly on physical Android/iOS phones & emulators)
    if (detectedHost) {
      candidates.push(`http://${detectedHost}:8000`);
    }

    // 3. Android-specific loopback / network fallbacks
    if (Platform.OS === "android") {
      // Android Studio Emulator gateway to Windows host
      candidates.push("http://10.0.2.2:8000");
      // Current Windows Wi-Fi LAN IP
      candidates.push("http://10.10.136.88:8000");
      // Hotspot / virtual adapter IP
      candidates.push("http://192.168.137.1:8000");
    }

    // 4. Last resort
    if (envUrl) candidates.push(envUrl);
    candidates.push("http://localhost:8000");
    candidates.push("http://127.0.0.1:8000");
  }

  // Deduplicate preserving order
  return Array.from(new Set(candidates.filter(Boolean)));
}

/**
 * Executes an API fetch with automatic host fallback so that Android emulators,
 * physical mobile devices on Wi-Fi, and web browsers all connect successfully.
 */
async function apiFetch(endpoint: string, init: RequestInit): Promise<Response> {
  const cleanPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // If a known working base URL was previously discovered, try it first
  if (cachedBaseUrl) {
    try {
      const response = await fetch(`${cachedBaseUrl}${cleanPath}`, init);
      return response;
    } catch {
      // Invalidated, re-discover below
      cachedBaseUrl = null;
    }
  }

  const candidates = getCandidateBaseUrls();
  let lastError: any = null;

  for (const base of candidates) {
    try {
      // 3.5s timeout per candidate to avoid locking UI
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    let token = null;
    try {
      token = await getStorageItemAsync("access_token");
    } catch (e) {
      console.log("Storage not available", e);
    }

    const headers = new Headers(init.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${base}${cleanPath}`, {
      ...init,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

      // Connection succeeded! Cache this base URL for subsequent calls
      cachedBaseUrl = base;
      return response;
    } catch (err: any) {
      lastError = err;
    }
  }

  throw new Error(
    `Unable to connect to Silambu backend at (${candidates.join(", ")}). Error: ${lastError?.message || lastError}`
  );
}

export async function getCurrentUser(): Promise<User | null> {
  if (currentUser) return currentUser;
  try {
    const userStr = await getStorageItemAsync("user_data");
    if (userStr) {
      currentUser = JSON.parse(userStr);
      return currentUser;
    }
  } catch (e) {
    console.log("Failed to get user data", e);
  }
  return null;
}

export async function login(email: string, password: string): Promise<User> {
  const response = await apiFetch("/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(errorData.detail || "Login failed");
  }

  const data = await response.json();
  
  if (data.access_token) {
    try {
      await setStorageItemAsync("access_token", data.access_token);
    } catch (e) {
      console.log("Failed to save token", e);
    }
  }

  currentUser = {
    id: data.user?.id ? String(data.user.id) : `guardian-${Date.now()}`,
    name: data.user?.name || "Guardian",
    email: data.user?.email || email,
    phone: data.user?.phone,
  };
  
  try {
    await setStorageItemAsync("user_data", JSON.stringify(currentUser));
  } catch (e) {
    console.log("Failed to save user", e);
  }
  
  return currentUser;
}

export async function signup(
  name: string,
  email: string,
  phone: string,
  password: string,
  childName?: string,
  childAge?: string,
): Promise<User> {
  const response = await apiFetch("/api/v1/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      name, 
      email, 
      phone, 
      password,
      child_name: childName || undefined,
      child_age: childAge ? parseInt(childAge, 10) : undefined,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Signup failed" }));
    throw new Error(errorData.detail || "Signup failed");
  }

  const user = await response.json();
  
  // Note: /signup might not return a token in some implementations. 
  // If it does, we can save it here. Assuming standard login handles it.
  if (user.access_token) {
    try {
      await setStorageItemAsync("access_token", user.access_token);
    } catch (e) {}
  }

  currentUser = {
    id: user.id ? String(user.id) : `guardian-${Date.now()}`,
    name: user.name || name,
    email: user.email || email,
    phone: user.phone || phone,
    child: user.child,
  };
  
  try {
    await setStorageItemAsync("user_data", JSON.stringify(currentUser));
  } catch (e) {}
  
  return currentUser;
}

export async function loginWithGoogle(idToken?: string, accessToken?: string): Promise<User> {
  const token = idToken || accessToken || "demo-google-token";
  const response = await apiFetch("/api/v1/auth/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_token: token,
      email: "sggokul762@gmail.com",
      name: "Gokul",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "Google sign-in failed" }));
    throw new Error(errorData.detail || "Google sign-in failed");
  }

  const data = await response.json();
  
  if (data.access_token) {
    try {
      await setStorageItemAsync("access_token", data.access_token);
    } catch (e) {}
  }

  currentUser = {
    id: data.user?.id ? String(data.user.id) : `guardian-${Date.now()}`,
    name: data.user?.name || "Gokul",
    email: data.user?.email || "sggokul762@gmail.com",
    phone: data.user?.phone,
    avatar_url: data.user?.avatar_url,
  };
  
  try {
    await setStorageItemAsync("user_data", JSON.stringify(currentUser));
  } catch (e) {}
  
  return currentUser;
}

export async function logout(): Promise<void> {
  currentUser = null;
  try {
    await deleteStorageItemAsync("access_token");
    await deleteStorageItemAsync("user_data");
  } catch (e) {
    console.log("Failed to clear auth data", e);
  }
}



