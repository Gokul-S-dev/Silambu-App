import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert as NativeAlert,
} from "react-native";

import { router } from "expo-router";

import { ChildSafetyCard } from "@/components/ChildSafetyCard";
import { MetricCard } from "@/components/MetricCard";
import { SafetyOverview } from "@/components/SafetyOverview";
import { SOSButton } from "@/components/SOSButton";
import { EmergencyDetector } from "@/components/EmergencyDetector";
import { Icon } from "@/components/ui/Icon";
import { AppColors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { mockActivity, mockChild, mockHealth, mockLocation } from "@/services/api";
import * as Notifications from 'expo-notifications';
import { useRef } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function DashboardScreen() {
  const { user } = useAuth();
  const [sirenActive, setSirenActive] = useState(false);
  const [liveData, setLiveData] = useState<any>(null);

  const lastAlertTimeRef = useRef<{ heart: number, fall: number }>({ heart: 0, fall: 0 });

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    };
    requestPermissions();

    const fetchState = async () => {
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/v1/iot/state`);
        const data = await response.json();
        setLiveData(data);

        const reading = data?.latest_reading;
        const prediction = data?.latest_prediction;
        const now = Date.now();

        if (reading) {
           const isFall = reading.scenario === 'fall' || prediction?.prediction === 'fall';
           const isHighHeartRate = reading.heart_rate > 120; 

           if (isFall && (now - lastAlertTimeRef.current.fall > 60000)) {
               lastAlertTimeRef.current.fall = now;
               await Notifications.scheduleNotificationAsync({
                   content: {
                       title: "🚨 Fall Detected!",
                       body: "Silambu band detected a potential fall.",
                   },
                   trigger: null,
               });
           }

           if (isHighHeartRate && (now - lastAlertTimeRef.current.heart > 60000)) {
               lastAlertTimeRef.current.heart = now;
               await Notifications.scheduleNotificationAsync({
                   content: {
                       title: "⚠️ High Heart Rate Alert",
                       body: `Abnormal heart rate detected: ${reading.heart_rate} BPM`,
                   },
                   trigger: null,
               });
           }
        }
      } catch (error) {
        console.log("Error fetching live state", error);
      }
    };
    
    // Initial fetch
    fetchState();
    const timer = setInterval(fetchState, 3000);
    return () => clearInterval(timer);
  }, []);

  const reading = liveData?.latest_reading;
  const prediction = liveData?.latest_prediction;

  const heartRate = reading ? reading.heart_rate : mockHealth.heartRate;
  const spo2 = reading ? reading.spo2 : mockHealth.spo2;
  const activity = reading ? reading.activity : mockActivity.activity;
  
  // Determine if there is an emergency state
  const isEmergency = reading?.scenario === 'fall' || reading?.scenario === 'emergency' || prediction?.prediction === 'fall';


  const handleTriggerSiren = () => {
    const nextState = !sirenActive;
    setSirenActive(nextState);
    NativeAlert.alert(
      nextState ? "Siren Triggered" : "Siren Silenced",
      nextState
        ? "Audible beacon activated on Aarav's Silambu Smart Band."
        : "Silambu Smart Band returned to silent monitoring mode."
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <EmergencyDetector />
      {/* Top Guardian Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarMini}>
            <Text style={styles.avatarMiniText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "G"}
            </Text>
            <View style={styles.avatarDot} />
          </View>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.name || "Guardian"} 👋
            </Text>
            <Text style={styles.tagline}>Silambu Protection Active</Text>
          </View>
        </View>

        <View style={styles.liveBadge}>
          <View style={styles.pulsingGreen} />
          <Text style={styles.liveText}>ONLINE</Text>
        </View>
      </View>

      {/* Main Child Monitored Card */}
      <ChildSafetyCard child={mockChild} />

      {/* Quick Action Tiles */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        <View style={styles.actionsGrid}>
          <Pressable
            style={[styles.actionBtn, sirenActive && styles.actionBtnActive]}
            onPress={handleTriggerSiren}
          >
            <View
              style={[
                styles.actionIconCircle,
                sirenActive ? styles.iconCircleActive : { backgroundColor: AppColors.amberSoft },
              ]}
            >
              <Icon
                name="volume-2"
                size={18}
                color={sirenActive ? "#FFFFFF" : AppColors.amberDark}
              />
            </View>
            <Text style={styles.actionLabel}>
              {sirenActive ? "Stop Siren" : "Ring Band"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.actionBtn}
            onPress={() => router.push("/location")}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: AppColors.tealSoft }]}>
              <Icon name="navigation" size={18} color={AppColors.tealDark} />
            </View>
            <Text style={styles.actionLabel}>Live GPS</Text>
          </Pressable>

          <Pressable
            style={styles.actionBtn}
            onPress={() => router.push("/alerts")}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: AppColors.redSoft }]}>
              <Icon name="shield-alert" size={18} color={AppColors.redDark} />
            </View>
            <Text style={styles.actionLabel}>SOS Logs</Text>
          </Pressable>

          <Pressable
            style={styles.actionBtn}
            onPress={() => router.push("/profile")}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: AppColors.indigoSoft }]}>
              <Icon name="sliders" size={18} color={AppColors.indigo} />
            </View>
            <Text style={styles.actionLabel}>Settings</Text>
          </Pressable>
        </View>
      </View>

      {/* Vitals & Telemetry */}
      <View style={styles.vitalsSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>LIVE BIOMETRICS</Text>
          <Text style={styles.timestampBadge}>Updated just now</Text>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            label="Heart rate"
            value={`${heartRate} BPM`}
            detail={isEmergency ? "Elevated" : "Resting state"}
            iconName="heart"
            accent={isEmergency ? AppColors.red : AppColors.redSoft}
            badgeText={isEmergency ? "High" : "Normal"}
            badgeColor={isEmergency ? AppColors.red : AppColors.green}
            progressPercent={72}
          />
          <MetricCard
            label="Blood Oxygen"
            value={`${spo2}%`}
            detail={spo2 < 90 ? "Requires attention" : "Optimal level"}
            iconName="activity"
            accent={AppColors.sky}
            badgeText={spo2 < 90 ? "Low" : "Healthy"}
            badgeColor={spo2 < 90 ? AppColors.amber : AppColors.green}
            progressPercent={99}
          />
        </View>

        <View style={[styles.metricsGrid, { marginTop: 12 }]}>
          <MetricCard
            label="Activity"
            value={activity.charAt(0).toUpperCase() + activity.slice(1)}
            detail={isEmergency ? "Action required" : "Monitored"}
            iconName="zap"
            accent={isEmergency ? AppColors.red : AppColors.indigo}
            badgeText={isEmergency ? "Alert" : "Active"}
            badgeColor={isEmergency ? AppColors.red : AppColors.indigo}
            progressPercent={55}
          />
          <MetricCard
            label="Smart Band"
            value="94%"
            detail="~18 hrs battery"
            iconName="battery"
            accent={AppColors.teal}
            badgeText="Connected"
            badgeColor={AppColors.teal}
            progressPercent={94}
          />
        </View>
      </View>

      {/* Geofence & Location Preview Banner */}
      <View style={styles.locationBanner}>
        <View style={styles.locationTop}>
          <View style={styles.locationIconBox}>
            <Icon name="map-pin" size={20} color={AppColors.teal} />
          </View>
          <View style={styles.locationMeta}>
            <Text style={styles.locationCardSub}>CURRENT POSITION</Text>
            <Text style={styles.locationName}>{mockLocation.label}</Text>
            <Text style={styles.locationSubText}>
              Chennai, Tamil Nadu · {mockLocation.timestamp}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.locationCta}
          onPress={() => router.push("/location")}
        >
          <Text style={styles.locationCtaText}>Open Live Radar Map</Text>
          <Icon name="chevron-right" size={16} color={AppColors.teal} />
        </Pressable>
      </View>


      {/* Emergency Action */}
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        <SOSButton />
      </View>

      {/* System Integrity & Hardware Status */}
      <SafetyOverview />
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
    alignItems: "center",
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarMini: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.inkDark,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarMiniText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  avatarDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: AppColors.green,
    borderWidth: 2,
    borderColor: AppColors.canvas,
  },
  greeting: {
    color: AppColors.ink,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  tagline: {
    color: AppColors.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: AppColors.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  pulsingGreen: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: AppColors.green,
  },
  liveText: {
    color: AppColors.greenDark,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  actionsSection: {
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: AppColors.muted,
    marginBottom: 10,
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: AppColors.line,
    shadowColor: AppColors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  actionBtnActive: {
    backgroundColor: AppColors.redSoft,
    borderColor: AppColors.red,
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconCircleActive: {
    backgroundColor: AppColors.red,
  },
  actionLabel: {
    color: AppColors.ink,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  vitalsSection: {
    marginTop: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  timestampBadge: {
    color: AppColors.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  locationBanner: {
    backgroundColor: AppColors.surface,
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
    borderColor: AppColors.line,
    shadowColor: AppColors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  locationTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  locationIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: AppColors.tealSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  locationMeta: {
    flex: 1,
  },
  locationCardSub: {
    color: AppColors.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  locationName: {
    color: AppColors.ink,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4,
  },
  locationSubText: {
    color: AppColors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  locationCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.line,
  },
  locationCtaText: {
    color: AppColors.teal,
    fontWeight: "800",
    fontSize: 13,
  },
});