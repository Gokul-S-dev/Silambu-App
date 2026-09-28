import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppColors } from "@/constants/colors";
import { Icon } from "@/components/ui/Icon";
import type { Child } from "@/types";

export function ChildSafetyCard({ child }: { child: Child }) {
  const isSafe = child.status === "safe";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.childInfo}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{child.name.charAt(0)}</Text>
            </View>
            <View style={[styles.pulseDot, { backgroundColor: isSafe ? AppColors.green : AppColors.red }]} />
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.eyebrow}>MONITORED CHILD</Text>
            <Text style={styles.name}>{child.name}</Text>
            <Text style={styles.age}>Age {child.age || 8} · Smart Band Active</Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: isSafe ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)" }]}>
          <View style={[styles.statusDot, { backgroundColor: isSafe ? AppColors.green : AppColors.red }]} />
          <Text style={[styles.statusText, { color: isSafe ? AppColors.green : AppColors.red }]}>
            {isSafe ? "ALL SAFE" : "ALERT"}
          </Text>
        </View>
      </View>

      <View style={styles.telemetryBar}>
        <View style={styles.telemetryItem}>
          <Icon name="battery" size={15} color="#94A3B8" />
          <Text style={styles.telemetryText}>94% Battery</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.telemetryItem}>
          <Icon name="wifi" size={15} color="#94A3B8" />
          <Text style={styles.telemetryText}>4G Live GPS</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.telemetryItem}>
          <Icon name="lock" size={15} color="#94A3B8" />
          <Text style={styles.telemetryText}>Band Clasped</Text>
        </View>
      </View>

      <View style={styles.zoneRow}>
        <Icon name="shield" size={16} color={AppColors.tealLight} />
        <Text style={styles.zoneText}>Current Safe Zone: </Text>
        <Text style={styles.zoneBold}>School Campus, Adyar</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0B132B",
    borderRadius: 24,
    padding: 22,
    marginTop: 18,
    shadowColor: "#0B132B",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  childInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#1C2A4A",
    borderWidth: 2,
    borderColor: AppColors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  pulseDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#0B132B",
  },
  nameBlock: {
    marginLeft: 14,
  },
  eyebrow: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 2,
  },
  age: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  telemetryBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 18,
  },
  telemetryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  telemetryText: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  zoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  zoneText: {
    color: "#94A3B8",
    fontSize: 12,
    marginLeft: 8,
  },
  zoneBold: {
    color: "#F1F5F9",
    fontSize: 12,
    fontWeight: "700",
  },
});