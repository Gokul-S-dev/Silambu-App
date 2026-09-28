import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppColors } from "@/constants/colors";
import { Icon, type IconName } from "@/components/ui/Icon";

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  iconName?: IconName;
  accent?: string;
  badgeText?: string;
  badgeColor?: string;
  progressPercent?: number;
}

export function MetricCard({
  label,
  value,
  detail,
  iconName = "activity",
  accent = AppColors.teal,
  badgeText = "Normal",
  badgeColor = AppColors.green,
  progressPercent = 78,
}: MetricCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        <View style={[styles.iconBox, { backgroundColor: `${accent}15` }]}>
          <Icon name={iconName} size={16} color={accent} />
        </View>
      </View>

      <Text style={[styles.value, { color: AppColors.ink }]}>{value}</Text>

      {/* Mini Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: accent }]} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.detail}>{detail}</Text>
        <View style={[styles.badge, { backgroundColor: `${badgeColor}15` }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeText}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: AppColors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.line,
    shadowColor: AppColors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: AppColors.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 10,
    letterSpacing: -0.5,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: AppColors.surfaceSubtle,
    borderRadius: 2,
    marginVertical: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detail: {
    color: AppColors.muted,
    fontSize: 11,
    fontWeight: "500",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
});