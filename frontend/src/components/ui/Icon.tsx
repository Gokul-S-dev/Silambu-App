import React from "react";
import { View, Text, Platform, type ColorValue } from "react-native";

export type IconName =
  | "shield"
  | "heart"
  | "map-pin"
  | "bell"
  | "user"
  | "activity"
  | "battery"
  | "wifi"
  | "phone"
  | "chevron-right"
  | "alert-triangle"
  | "check-circle"
  | "lock"
  | "refresh"
  | "navigation"
  | "sparkles"
  | "power"
  | "settings"
  | "log-out"
  | "volume-2"
  | "clock"
  | "compass"
  | "layers"
  | "filter"
  | "crosshair"
  | "sliders"
  | "radio"
  | "shield-alert"
  | "zap";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string | ColorValue;
}

const SVG_PATHS: Record<IconName, string> = {
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  "map-pin": "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  battery: "M23 13v-2 M1 6h18v12H1z M6 10v4 M10 10v4 M14 10v4",
  wifi: "M5 12.55a11 11 0 0 1 14.08 0 M1.42 9a16 16 0 0 1 21.16 0 M8.53 16.11a6 6 0 0 1 6.95 0 M12 20h.01",
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
  "chevron-right": "M9 18l6-6-6-6",
  "alert-triangle": "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  "check-circle": "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3",
  lock: "M7 11V7a5 5 0 0 1 10 0v4 M3 11h18v11H3z",
  refresh: "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  navigation: "M3 11l19-9-9 19-2-8-8-2z",
  sparkles: "M12 2l2.4 7.2L21.6 12l-7.2 2.4L12 21.6l-2.4-7.2L2.4 12l7.2-2.4z",
  power: "M18.36 6.64a9 9 0 1 1-12.73 0 M12 2v10",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z",
  "log-out": "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  "volume-2": "M11 5L6 9H2v6h4l5 4V5z M19.07 4.93a10 10 0 0 1 0 14.14 M15.54 8.46a5 5 0 0 1 0 7.07",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2",
  compass: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z",
  layers: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  crosshair: "M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4 M4.93 19.07l2.83-2.83 M16.24 7.76l2.83-2.83",
  sliders: "M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6",
  radio: "M4.93 19.07a10 10 0 0 1 0-14.14 M7.76 16.24a6 6 0 0 1 0-8.48 M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M16.24 7.76a6 6 0 0 1 0 8.48 M19.07 4.93a10 10 0 0 1 0 14.14",
  "shield-alert": "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M12 8v4 M12 16h.01",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
};

export function Icon({ name, size = 20, color = "#0F172A" }: IconProps) {
  if (Platform.OS === "web") {
    const path = SVG_PATHS[name] || SVG_PATHS["shield"];
    return (
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        {React.createElement(
          "svg",
          {
            width: size,
            height: size,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: (color as string) || "#0F172A",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            style: { display: "block" },
          },
          React.createElement("path", { d: path })
        )}
      </View>
    );
  }

  // Fallback for native runtime
  const symbols: Record<IconName, string> = {
    shield: "🛡️",
    heart: "❤️",
    "map-pin": "📍",
    bell: "🔔",
    user: "👤",
    activity: "⚡",
    battery: "🔋",
    wifi: "📶",
    phone: "📞",
    "chevron-right": "›",
    "alert-triangle": "⚠️",
    "check-circle": "✅",
    lock: "🔒",
    refresh: "🔄",
    navigation: "🧭",
    sparkles: "✨",
    power: "⚡",
    settings: "⚙️",
    "log-out": "🚪",
    "volume-2": "🔊",
    clock: "⏱️",
    compass: "🧭",
    layers: "🥞",
    filter: "🔍",
    crosshair: "🎯",
    sliders: "🎛️",
    radio: "📡",
    "shield-alert": "🚨",
    zap: "⚡",
  };

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: size * 0.75, color }}>{symbols[name] || "•"}</Text>
    </View>
  );
}
