import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert as NativeAlert,
  Platform,
  Linking,
} from "react-native";
import { Icon } from "@/components/ui/Icon";
import { AppColors } from "@/constants/colors";
import { mockChild, mockLocation } from "@/services/api";

interface SafeZone {
  id: string;
  name: string;
  address: string;
  radius: string;
  status: "active" | "inactive";
  distance: string;
}

const safeZones: SafeZone[] = [
  {
    id: "zone-1",
    name: "School Campus (Adyar)",
    address: "Vidya Mandir Senior Secondary, Chennai",
    radius: "400m",
    status: "active",
    distance: "Current Location",
  },
  {
    id: "zone-2",
    name: "Home (Besant Nagar)",
    address: "4th Main Road, Besant Nagar, Chennai",
    radius: "200m",
    status: "inactive",
    distance: "3.4 km away",
  },
  {
    id: "zone-3",
    name: "Grandparents (T. Nagar)",
    address: "Venkatnarayana Road, T. Nagar, Chennai",
    radius: "300m",
    status: "inactive",
    distance: "6.8 km away",
  },
];

export default function LocationScreen() {
  const [selectedZone, setSelectedZone] = useState<string>("zone-1");
  const [liveLocation, setLiveLocation] = useState<{latitude: number, longitude: number} | null>(null);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/v1/iot/state`);
        const data = await response.json();
        
        const reading = data?.latest_reading;
        if (reading && reading.latitude && reading.longitude) {
            setLiveLocation((prev) => {
                if (!prev || prev.latitude !== reading.latitude || prev.longitude !== reading.longitude) {
                    return { latitude: reading.latitude, longitude: reading.longitude };
                }
                return prev;
            });
        }
      } catch (error) {
        console.log("Error fetching live state in location", error);
      }
    };
    
    fetchState();
    const timer = setInterval(fetchState, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentLat = liveLocation?.latitude || mockLocation.latitude;
  const currentLon = liveLocation?.longitude || mockLocation.longitude;

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLon}`;
    Linking.openURL(url).catch(() => {
      NativeAlert.alert("Error", "Could not open Google Maps.");
    });
  };

  const handleRefreshLocation = () => {
    NativeAlert.alert("GPS Ping Sent", "Pinging Aarav's Silambu Band for high-accuracy GPS fix.");
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>SATELLITE TELEMETRY</Text>
          <Text style={styles.title}>Live Radar Map</Text>
        </View>
        <Pressable style={styles.refreshBtn} onPress={handleRefreshLocation}>
          <Icon name="refresh" size={16} color={AppColors.teal} />
          <Text style={styles.refreshText}>Ping</Text>
        </Pressable>
      </View>

      {/* Google Map Card */}
      <View style={[styles.radarCard, { overflow: "hidden" }]}>
        {Platform.OS === "web" ? (
          <iframe
            title="Google Maps"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            src={`https://maps.google.com/maps?q=${currentLat},${currentLon}&z=16&output=embed`}
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", textAlign: "center", padding: 20 }}>
              Google Maps requires react-native-maps on mobile. Please open Google Maps using the button below.
            </Text>
          </View>
        )}
      </View>

      {/* Primary Location Details Card */}
      <View style={styles.locationCard}>
        <View style={styles.locationRow}>
          <View style={styles.pinCircle}>
            <Icon name="map-pin" size={20} color={AppColors.teal} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.placeName}>School Campus, Adyar</Text>
            <Text style={styles.placeAddress}>
              Vidya Mandir School, Canal Bank Rd, Gandhi Nagar, Chennai
            </Text>
            <Text style={styles.placeTime}>{mockLocation.timestamp} · Signal: 98%</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.btnRow}>
          <Pressable style={styles.primaryBtn} onPress={openGoogleMaps}>
            <Icon name="navigation" size={16} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Open Google Maps</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryBtn}
            onPress={() => {
              NativeAlert.alert("Geofence Boundary", "School safe perimeter set to 400m radius.");
            }}
          >
            <Icon name="shield" size={16} color={AppColors.ink} />
            <Text style={styles.secondaryBtnText}>Set Perimeter</Text>
          </Pressable>
        </View>
      </View>

      {/* Safe Geofences Section */}
      <View style={styles.geofenceSection}>
        <View style={styles.geofenceHeader}>
          <View>
            <Text style={styles.eyebrow}>SAFE BOUNDARIES</Text>
            <Text style={styles.sectionTitle}>Designated Geofences</Text>
          </View>
          <View style={styles.zoneActiveBadge}>
            <Text style={styles.zoneActiveBadgeText}>1 ACTIVE ZONE</Text>
          </View>
        </View>

        {safeZones.map((zone) => {
          const isActive = zone.status === "active";
          return (
            <Pressable
              key={zone.id}
              style={[
                styles.zoneCard,
                isActive && styles.zoneCardActive,
              ]}
              onPress={() => setSelectedZone(zone.id)}
            >
              <View
                style={[
                  styles.zoneIconBox,
                  { backgroundColor: isActive ? AppColors.tealSoft : AppColors.surfaceSubtle },
                ]}
              >
                <Icon
                  name={isActive ? "check-circle" : "shield"}
                  size={18}
                  color={isActive ? AppColors.teal : AppColors.muted}
                />
              </View>

              <View style={styles.zoneInfo}>
                <View style={styles.zoneTitleRow}>
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  {isActive && (
                    <View style={styles.insidePill}>
                      <Text style={styles.insidePillText}>INSIDE SAFE ZONE</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.zoneAddress}>{zone.address}</Text>
                <Text style={styles.zoneMeta}>
                  Perimeter: {zone.radius} · {zone.distance}
                </Text>
              </View>
            </Pressable>
          );
        })}
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
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: AppColors.tealSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  refreshText: {
    color: AppColors.tealDark,
    fontSize: 12,
    fontWeight: "800",
  },
  radarCard: {
    height: 320,
    backgroundColor: "#0B132B",
    borderRadius: 24,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#0B132B",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  radarRingOuter: {
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 1,
    borderColor: "rgba(13, 148, 136, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  radarRingMiddle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: "rgba(13, 148, 136, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  radarRingInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    borderColor: "rgba(20, 184, 166, 0.5)",
    backgroundColor: "rgba(13, 148, 136, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  crosshairH: {
    position: "absolute",
    width: "100%",
    height: 1,
    backgroundColor: "rgba(13, 148, 136, 0.15)",
  },
  crosshairV: {
    position: "absolute",
    height: "100%",
    width: 1,
    backgroundColor: "rgba(13, 148, 136, 0.15)",
  },
  childBeaconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  beaconPulse: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(16, 185, 129, 0.3)",
  },
  beaconDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppColors.tealLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  beaconInitial: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  satelliteBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.green,
  },
  satelliteBadgeText: {
    color: "#CBD5E1",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  radarStatsRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "rgba(11, 19, 43, 0.9)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  statCell: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  statLabel: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  statValue: {
    color: "#F8FAFC",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },
  locationCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 20,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: AppColors.line,
    shadowColor: AppColors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  pinCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.tealSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  locationInfo: {
    flex: 1,
  },
  placeName: {
    color: AppColors.ink,
    fontSize: 17,
    fontWeight: "800",
  },
  placeAddress: {
    color: AppColors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  placeTime: {
    color: AppColors.tealDark,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: AppColors.line,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: AppColors.teal,
    borderRadius: 14,
    paddingVertical: 12,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: AppColors.surfaceSubtle,
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: AppColors.line,
  },
  secondaryBtnText: {
    color: AppColors.ink,
    fontSize: 13,
    fontWeight: "700",
  },
  geofenceSection: {
    marginTop: 24,
  },
  geofenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  sectionTitle: {
    color: AppColors.ink,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 2,
  },
  zoneActiveBadge: {
    backgroundColor: AppColors.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  zoneActiveBadgeText: {
    color: AppColors.greenDark,
    fontSize: 10,
    fontWeight: "800",
  },
  zoneCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: AppColors.line,
  },
  zoneCardActive: {
    borderColor: AppColors.teal,
    backgroundColor: "rgba(13, 148, 136, 0.02)",
  },
  zoneIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  zoneInfo: {
    flex: 1,
    marginLeft: 12,
  },
  zoneTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  zoneName: {
    color: AppColors.ink,
    fontSize: 15,
    fontWeight: "800",
  },
  insidePill: {
    backgroundColor: AppColors.greenSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  insidePillText: {
    color: AppColors.greenDark,
    fontSize: 9,
    fontWeight: "800",
  },
  zoneAddress: {
    color: AppColors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  zoneMeta: {
    color: AppColors.tealDark,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
  },
});