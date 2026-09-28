import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export async function setStorageItemAsync(key: string, value: string) {
  if (Platform.OS === "web") {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error("Local storage is unavailable:", e);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export async function getStorageItemAsync(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      if (typeof localStorage !== "undefined") {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.error("Local storage is unavailable:", e);
    }
    return null;
  } else {
    return await SecureStore.getItemAsync(key);
  }
}

export async function deleteStorageItemAsync(key: string) {
  if (Platform.OS === "web") {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.error("Local storage is unavailable:", e);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}
