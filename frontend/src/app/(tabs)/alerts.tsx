import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert as NativeAlert,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Icon, type IconName } from "@/components/ui/Icon";
import { AppColors } from "@/constants/colors";
import { fetchNotifications, markNotificationAsRead, type Notification } from "@/services/notifications";

type AlertCategory = "all" | "iot_sos" | "health" | "movement_alert";

interface SafetyAlertItem {
  id: string;
  category: "sos" | "geofence" | "health";
  title: string;
  description: string;
  timestamp: string;
  location: string;
  severity: "critical" | "warning" | "info";
  resolved: boolean;
}

const initialAlerts: SafetyAlertItem[] = [
  {
    id: "alert-001",
    category: "sos",
    title: "Emergency SOS Beacon Triggered",
    description: "3-second distress button pressed on Aarav's Silambu Smart Band.",
    timestamp: "12 mins ago",
    location: "Vidya Mandir School, Adyar",
    severity: "critical",
    resolved: false,
  },
  {
    id: "alert-002",
    category: "geofence",
    title: "Safe Geofence Perimeter Warning",
    description: "Approaching 400m boundary of designated School Safe Zone.",
    timestamp: "2 hours ago",
    location: "Canal Bank Road, Chennai",
    severity: "warning",
    resolved: true,
  },
  {
    id: "alert-003",
    category: "health",
    title: "Elevated Heart Rate Spike",
    description: "Heart rate peaked at 124 BPM during physical sports session. Returned to nominal resting rate (74 BPM).",
    timestamp: "Yesterday, 4:15 PM",
    location: "School Sports Ground",
    severity: "info",
    resolved: true,
  },
];

export default function AlertsScreen() {
  const [filter, setFilter] = useState<AlertCategory>("all");
  const [alerts, setAlerts] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAlerts = async () => {
    try {
      const data = await fetchNotifications();
      setAlerts(data);
    } catch (error) {
      console.log("Failed to load alerts", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAlerts();
      // Optional polling
      const interval = setInterval(loadAlerts, 10000);
      return () => clearInterval(interval);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  const filteredAlerts = alerts.filter((item) => {
    if (filter === "all") return true;
    return item.action_type === filter;
  });

  const handleResolveAlert = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setAlerts((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_read: true } : item
        )
      );
      NativeAlert.alert("Alert Resolved", "Incident has been acknowledged and marked resolved.");
    } catch (error) {
      NativeAlert.alert("Error", "Failed to resolve alert.");
    }
  };

  const getSeverityStyle = (actionType: string) => {
    if (actionType.includes("sos")) {
        return {
          badgeBg: AppColors.redSoft,
          badgeColor: AppColors.redDark,
          borderColor: "rgba(239, 68, 68, 0.3)",
          icon: "shield-alert" as IconName,
          label: "CRITICAL"
        };
    } else if (actionType.includes("warning") || actionType.includes("tamper")) {
        return {
          badgeBg: AppColors.amberSoft,
          badgeColor: AppColors.amberDark,
          borderColor: "rgba(245, 158, 11, 0.3)",
          icon: "alert-triangle" as IconName,
          label: "WARNING"
        };
    } else {
        return {
          badgeBg: AppColors.skySoft,
          badgeColor: AppColors.sky,
          borderColor: "rgba(2, 132, 199, 0.2)",
          icon: "activity" as IconName,
          label: "INFO"
        };
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>SECURITY & INCIDENTS</Text>
          <Text style={styles.title}>Safety Alerts</Text>
        </View>
        <View style={styles.statusPill}>
          <View style={styles.greenDot} />
          <Text style={styles.statusPillText}>MONITORING ACTIVE</Text>
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {(
          [
            { id: "all", label: `All (${alerts.length})` },
            { id: "iot_sos", label: "IoT SOS" },
            { id: "movement_alert", label: "Movement" },
            { id: "health", label: "Health" },
          ] as { id: AlertCategory; label: string }[]
        ).map((chip) => {
          const isActive = filter === chip.id;
          return (
            <Pressable
              key={chip.id}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setFilter(chip.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive,
                ]}
              >
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* SOS Protocol Banner */}
      <View style={styles.sosBanner}>
        <View style={styles.sosIconCircle}>
          <Icon name="shield" size={18} color={AppColors.tealDark} />
        </View>
        <View style={styles.sosBannerContent}>
          <Text style={styles.sosBannerTitle}>Guardian Emergency Dispatch</Text>
          <Text style={styles.sosBannerSubtitle}>
            When Aarav holds the Silambu band SOS button, cloud servers push real-time GPS coordinates to your registered device.
          </Text>
        </View>
      </View>

      {/* Alerts List */}
      <View style={styles.alertsList}>
        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Icon name="check-circle" size={40} color={AppColors.green} />
            <Text style={styles.emptyTitle}>No alerts in this category</Text>
            <Text style={styles.emptySubtitle}>
              All vital signs and location boundaries are within normal parameters.
            </Text>
          </View>
        ) : (
          filteredAlerts.map((item) => {
            const conf = getSeverityStyle(item.action_type);
            return (
              <View
                key={item.id}
                style={[
                  styles.alertCard,
                  { borderColor: conf.borderColor },
                  !item.is_read && styles.alertCardUnresolved,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.badge, { backgroundColor: conf.badgeBg }]}>
                    <Icon name={conf.icon} size={13} color={conf.badgeColor} />
                    <Text style={[styles.badgeText, { color: conf.badgeColor }]}>
                      {conf.label}
                    </Text>
                  </View>

                  <View style={styles.headerRight}>
                    <Text style={styles.timeText}>{new Date(item.created_at).toLocaleString()}</Text>
                    {item.is_read ? (
                      <View style={styles.resolvedPill}>
                        <Text style={styles.resolvedPillText}>RESOLVED</Text>
                      </View>
                    ) : (
                      <View style={styles.openPill}>
                        <Text style={styles.openPillText}>ACTIVE</Text>
                      </View>
                    )}
                  </View>
                </View>

                <Text style={styles.alertTitle}>{item.title}</Text>
                <Text style={styles.alertDesc}>{item.message}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.locationMeta}>
                    <Icon name="activity" size={14} color={AppColors.muted} />
                    <Text style={styles.metaLocationText}>{item.action_type}</Text>
                  </View>

                  {!item.is_read && (
                    <Pressable
                      style={styles.resolveBtn}
                      onPress={() => handleResolveAlert(item.id)}
                    >
                      <Icon name="check-circle" size={14} color="#FFFFFF" />
                      <Text style={styles.resolveBtnText}>Acknowledge</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AppColors.canvas,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  eyebrow: {
    color: AppColors.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    color: AppColors.ink,
    fontSize: 26,
    fontWeight: "800",
    marginTop: 2,
    letterSpacing: -0.5,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: AppColors.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.green,
  },
  statusPillText: {
    color: AppColors.greenDark,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterContainer: {
    gap: 8,
  },
  filterChip: {
    backgroundColor: AppColors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppColors.line,
  },
  filterChipActive: {
    backgroundColor: AppColors.ink,
    borderColor: AppColors.ink,
  },
  filterChipText: {
    color: AppColors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  sosBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: AppColors.tealSoft,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(13, 148, 136, 0.2)",
    gap: 12,
  },
  sosIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  sosBannerContent: {
    flex: 1,
  },
  sosBannerTitle: {
    color: AppColors.tealDark,
    fontSize: 14,
    fontWeight: "800",
  },
  sosBannerSubtitle: {
    color: AppColors.ink,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
    opacity: 0.8,
  },
  alertsList: {
    gap: 14,
  },
  alertCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    shadowColor: AppColors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  alertCardUnresolved: {
    backgroundColor: "#FFFFFF",
    shadowColor: AppColors.red,
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeText: {
    color: AppColors.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  resolvedPill: {
    backgroundColor: AppColors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  resolvedPillText: {
    color: AppColors.muted,
    fontSize: 9,
    fontWeight: "800",
  },
  openPill: {
    backgroundColor: AppColors.redSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  openPillText: {
    color: AppColors.redDark,
    fontSize: 9,
    fontWeight: "800",
  },
  alertTitle: {
    color: AppColors.ink,
    fontSize: 16,
    fontWeight: "800",
  },
  alertDesc: {
    color: AppColors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.line,
  },
  locationMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
  },
  metaLocationText: {
    color: AppColors.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  resolveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: AppColors.teal,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resolveBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  emptyCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 20,
    padding: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: AppColors.line,
  },
  emptyTitle: {
    color: AppColors.ink,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 14,
  },
  emptySubtitle: {
    color: AppColors.muted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 4,
  },
});