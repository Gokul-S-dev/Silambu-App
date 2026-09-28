import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Switch,
  Alert as NativeAlert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { AppColors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "@/services/profile";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [tamperAlarmEnabled, setTamperAlarmEnabled] = useState(true);
  const [liveGpsEnabled, setLiveGpsEnabled] = useState(true);

  const [form, setForm] = useState({
    name: user?.name || "Guardian",
    phone: user?.phone || "+91 8667581651",
    childName: user?.child?.name || "Aarav",
    childAge: user?.child?.age ? String(user.child.age) : "8",
  });

  useEffect(() => {
    if (user) {
        setForm({
            name: user.name || "Guardian",
            phone: user.phone || "+91 8667581651",
            childName: user.child?.name || "Aarav",
            childAge: user.child?.age ? String(user.child.age) : "8",
        });
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
        await updateProfile(form.name, form.phone, form.childName, form.childAge);
        NativeAlert.alert("Success", "Profile updated successfully.");
        setIsEditing(false);
    } catch (e) {
        NativeAlert.alert("Error", "Failed to update profile.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    NativeAlert.alert("Log Out", "Are you sure you want to log out of Silambu?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const displayName = user?.name || "Gokul";
  const displayEmail = user?.email || "sggokul762@gmail.com";
  const displayPhone = user?.phone || "+91 8667581651";

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>GUARDIAN ACCOUNT</Text>
        <View style={styles.headerRow}>
            <Text style={styles.title}>Response Profile</Text>
            {isEditing ? (
                <Pressable onPress={handleSave} disabled={isSaving} style={styles.editBtn}>
                    {isSaving ? <ActivityIndicator size="small" color={AppColors.teal} /> : <Text style={styles.editBtnText}>Save</Text>}
                </Pressable>
            ) : (
                <Pressable onPress={() => setIsEditing(true)} style={styles.editBtn}>
                    <Text style={styles.editBtnText}>Edit</Text>
                </Pressable>
            )}
        </View>
      </View>

      {/* Identity Card */}
      <View style={styles.identityCard}>
        <View style={styles.identityTop}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.verifiedDot}>
              <Icon name="check-circle" size={14} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.identityTextGroup}>
            {isEditing ? (
                <TextInput
                    style={styles.input}
                    value={form.name}
                    onChangeText={(val) => setForm({ ...form, name: val })}
                    placeholder="Guardian Name"
                />
            ) : (
                <Text style={styles.name}>{form.name}</Text>
            )}
            <Text style={styles.email}>{displayEmail}</Text>
            <View style={styles.googleBadge}>
              <Icon name="sparkles" size={12} color={AppColors.teal} />
              <Text style={styles.googleBadgeText}>Google Connected Account</Text>
            </View>
          </View>
        </View>

        <View style={styles.identityDivider} />

        <View style={styles.identityPhoneRow}>
          <Icon name="phone" size={15} color={AppColors.muted} />
          {isEditing ? (
              <TextInput
                  style={styles.inputPhone}
                  value={form.phone}
                  onChangeText={(val) => setForm({ ...form, phone: val })}
                  placeholder="Emergency Contact"
                  keyboardType="phone-pad"
              />
          ) : (
              <Text style={styles.phoneText}>Emergency Contact: {form.phone}</Text>
          )}
        </View>
      </View>

      {/* Child Profile Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>CHILD DETAILS</Text>
      </View>

      <View style={styles.identityCard}>
          <View style={styles.identityPhoneRow}>
            <Icon name="user" size={15} color={AppColors.muted} />
            {isEditing ? (
                <TextInput
                    style={styles.inputPhone}
                    value={form.childName}
                    onChangeText={(val) => setForm({ ...form, childName: val })}
                    placeholder="Child's Name"
                />
            ) : (
                <Text style={styles.phoneText}>Name: {form.childName}</Text>
            )}
          </View>
          <View style={styles.identityDivider} />
          <View style={styles.identityPhoneRow}>
            <Icon name="user" size={15} color={AppColors.muted} />
            {isEditing ? (
                <TextInput
                    style={styles.inputPhone}
                    value={form.childAge}
                    onChangeText={(val) => setForm({ ...form, childAge: val })}
                    placeholder="Child's Age"
                    keyboardType="numeric"
                />
            ) : (
                <Text style={styles.phoneText}>Age: {form.childAge}</Text>
            )}
          </View>
      </View>

      {/* Paired Smart Band Hardware Card */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>PAIRED HARDWARE DEVICE</Text>
      </View>

      <View style={styles.hardwareCard}>
        <View style={styles.hardwareTop}>
          <View style={styles.hardwareIconBox}>
            <Icon name="radio" size={22} color={AppColors.tealLight} />
          </View>
          <View style={styles.hardwareMeta}>
            <Text style={styles.hardwareModel}>Silambu KidGuard S-900</Text>
            <Text style={styles.hardwareId}>Serial: #SB-2026-CHN-884</Text>
          </View>
          <View style={styles.pairedPill}>
            <View style={styles.pairedDot} />
            <Text style={styles.pairedText}>SYNCED</Text>
          </View>
        </View>

        <View style={styles.hardwareGrid}>
          <View style={styles.hwGridItem}>
            <Text style={styles.hwLabel}>BATTERY</Text>
            <Text style={styles.hwValue}>94% (Good)</Text>
          </View>
          <View style={styles.hwDivider} />
          <View style={styles.hwGridItem}>
            <Text style={styles.hwLabel}>FIRMWARE</Text>
            <Text style={styles.hwValue}>v2.4.1</Text>
          </View>
          <View style={styles.hwDivider} />
          <View style={styles.hwGridItem}>
            <Text style={styles.hwLabel}>CELLULAR</Text>
            <Text style={styles.hwValue}>4G LTE</Text>
          </View>
          <View style={styles.hwDivider} />
          <View style={styles.hwGridItem}>
            <Text style={styles.hwLabel}>BLE LINK</Text>
            <Text style={styles.hwValue}>Active</Text>
          </View>
        </View>
      </View>

      {/* Safety & Monitoring Preferences */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>MONITORING PREFERENCES</Text>
      </View>

      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingTextGroup}>
            <Text style={styles.settingTitle}>Push Notifications</Text>
            <Text style={styles.settingSubtitle}>Instant SOS & tamper push alerts</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: AppColors.line, true: AppColors.teal }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingDivider} />

        <View style={styles.settingRow}>
          <View style={styles.settingTextGroup}>
            <Text style={styles.settingTitle}>Tamper Detection Alarm</Text>
            <Text style={styles.settingSubtitle}>Sound alarm if band is forcefully removed</Text>
          </View>
          <Switch
            value={tamperAlarmEnabled}
            onValueChange={setTamperAlarmEnabled}
            trackColor={{ false: AppColors.line, true: AppColors.teal }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingDivider} />

        <View style={styles.settingRow}>
          <View style={styles.settingTextGroup}>
            <Text style={styles.settingTitle}>High Precision Live GPS</Text>
            <Text style={styles.settingSubtitle}>1-second interval satellite refresh</Text>
          </View>
          <Switch
            value={liveGpsEnabled}
            onValueChange={setLiveGpsEnabled}
            trackColor={{ false: AppColors.line, true: AppColors.teal }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Emergency Hotlines */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>EMERGENCY HELPLINES (INDIA)</Text>
      </View>

      <View style={styles.helplinesCard}>
        <View style={styles.helplineRow}>
          <View style={styles.helplineInfo}>
            <Text style={styles.helplineName}>Child Helpline</Text>
            <Text style={styles.helplineDesc}>National Child Protection 24/7</Text>
          </View>
          <View style={styles.helplineBadge}>
            <Text style={styles.helplineNumber}>1098</Text>
          </View>
        </View>

        <View style={styles.settingDivider} />

        <View style={styles.helplineRow}>
          <View style={styles.helplineInfo}>
            <Text style={styles.helplineName}>All-In-One Emergency</Text>
            <Text style={styles.helplineDesc}>Police, Ambulance & Fire</Text>
          </View>
          <View style={styles.helplineBadge}>
            <Text style={styles.helplineNumber}>112</Text>
          </View>
        </View>
      </View>

      {/* Log Out Button */}
      <Pressable onPress={handleLogout} style={styles.logoutBtn}>
        <Icon name="log-out" size={18} color={AppColors.red} />
        <Text style={styles.logoutBtnText}>Log Out of Silambu</Text>
      </Pressable>

      <Text style={styles.versionText}>
        Silambu Child Safety System · Build 2026.09.17
      </Text>
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
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: AppColors.tealSoft,
      borderRadius: 12,
  },
  editBtnText: {
      color: AppColors.tealDark,
      fontWeight: "700",
      fontSize: 14,
  },
  input: {
      borderBottomWidth: 1,
      borderBottomColor: AppColors.line,
      fontSize: 18,
      fontWeight: "800",
      color: AppColors.ink,
      paddingVertical: 4,
      marginBottom: 4,
  },
  inputPhone: {
      borderBottomWidth: 1,
      borderBottomColor: AppColors.line,
      fontSize: 13,
      fontWeight: "600",
      color: AppColors.ink,
      flex: 1,
      paddingVertical: 2,
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
  identityCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: AppColors.line,
    shadowColor: AppColors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  identityTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: AppColors.inkDark,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },
  verifiedDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: AppColors.teal,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: AppColors.surface,
  },
  identityTextGroup: {
    flex: 1,
  },
  name: {
    color: AppColors.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  email: {
    color: AppColors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  googleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: AppColors.tealSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  googleBadgeText: {
    color: AppColors.tealDark,
    fontSize: 10,
    fontWeight: "800",
  },
  identityDivider: {
    height: 1,
    backgroundColor: AppColors.line,
    marginVertical: 14,
  },
  identityPhoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  phoneText: {
    color: AppColors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 10,
  },
  sectionTitle: {
    color: AppColors.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  hardwareCard: {
    backgroundColor: "#0B132B",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  hardwareTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  hardwareIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(13, 148, 136, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  hardwareMeta: {
    flex: 1,
  },
  hardwareModel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  hardwareId: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 2,
  },
  pairedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pairedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.green,
  },
  pairedText: {
    color: AppColors.green,
    fontSize: 9,
    fontWeight: "900",
  },
  hardwareGrid: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  hwGridItem: {
    flex: 1,
    alignItems: "center",
  },
  hwDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  hwLabel: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "800",
  },
  hwValue: {
    color: "#F8FAFC",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },
  settingsCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.line,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingTextGroup: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    color: AppColors.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  settingSubtitle: {
    color: AppColors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    backgroundColor: AppColors.line,
    marginVertical: 6,
  },
  helplinesCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.line,
  },
  helplineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  helplineInfo: {
    flex: 1,
  },
  helplineName: {
    color: AppColors.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  helplineDesc: {
    color: AppColors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  helplineBadge: {
    backgroundColor: AppColors.redSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  helplineNumber: {
    color: AppColors.redDark,
    fontSize: 13,
    fontWeight: "900",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: AppColors.surface,
    borderWidth: 1.5,
    borderColor: AppColors.red,
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 24,
  },
  logoutBtnText: {
    color: AppColors.red,
    fontWeight: "800",
    fontSize: 14,
  },
  versionText: {
    color: AppColors.muted,
    fontSize: 11,
    textAlign: "center",
    marginTop: 20,
    fontWeight: "600",
  },
});