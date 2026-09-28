import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, Alert as NativeAlert, ActivityIndicator } from "react-native";
import { AppColors } from "@/constants/colors";
import { Icon, type IconName } from "@/components/ui/Icon";
import { sendSosAlert } from "@/services/notifications";

interface SafetyFeature {
  title: string;
  detail: string;
  icon: IconName;
  status: string;
}

const features: SafetyFeature[] = [
  {
    title: "Anklet Status",
    detail: "Current physical wear status",
    icon: "lock",
    status: "WORN",
  },
  {
    title: "Force Sensor",
    detail: "Clasp tension & pressure reading",
    icon: "activity",
    status: "4095",
  },
  {
    title: "3-Axis Movement",
    detail: "Real-time movement velocity",
    icon: "navigation",
    status: "2.6 dps",
  },
  {
    title: "PPG Heart Rate Sensor",
    detail: "Real-time pulse rate & SpO2",
    icon: "heart",
    status: "Nominal",
  },
  {
    title: "Safe Geofence Guard",
    detail: "School Campus 500m radius",
    icon: "shield",
    status: "Inside Zone",
  },
];

export function SafetyOverview() {
  const [isSendingSos, setIsSendingSos] = useState(false);

  const handleSos = async () => {
    setIsSendingSos(true);
    try {
      await sendSosAlert();
      NativeAlert.alert("SOS Sent", "Emergency services and guardians have been notified.");
    } catch (e) {
      NativeAlert.alert("Error", "Failed to send SOS. Check network.");
    } finally {
      setIsSendingSos(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>DIAGNOSTICS</Text>
          <Text style={styles.title}>Silambu Safety Shield</Text>
        </View>
        <View style={styles.badge}>
          <Icon name="check-circle" size={14} color={AppColors.green} />
          <Text style={styles.badgeText}>ALL SYSTEMS GO</Text>
        </View>
      </View>

      <View style={styles.list}>
        {features.map((item, idx) => (
          <View
            key={item.title}
            style={[
              styles.itemRow,
              idx === features.length - 1 && styles.lastItemRow,
            ]}
          >
            <View style={styles.iconCircle}>
              <Icon name={item.icon} size={16} color={AppColors.teal} />
            </View>
            <View style={styles.meta}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDetail}>{item.detail}</Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable 
        style={styles.sosButton} 
        onPress={handleSos}
        disabled={isSendingSos}
      >
        {isSendingSos ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <>
            <Icon name="shield-alert" size={20} color="#FFF" />
            <Text style={styles.sosButtonText}>TRIGGER SOS</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppColors.line,
    padding: 20,
    marginTop: 20,
    shadowColor: AppColors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    fontSize: 18,
    fontWeight: "800",
    marginTop: 3,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: AppColors.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: AppColors.greenDark,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  list: {
    marginTop: 4,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.line,
  },
  lastItemRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.tealSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    color: AppColors.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  itemDetail: {
    color: AppColors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: AppColors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.line,
  },
  statusText: {
    color: AppColors.tealDark,
    fontSize: 11,
    fontWeight: "700",
  },
  sosButton: {
    backgroundColor: AppColors.red,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
    shadowColor: AppColors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sosButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
});