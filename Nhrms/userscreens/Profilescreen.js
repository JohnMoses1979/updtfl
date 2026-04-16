/**
 * userscreens/Profilescreen.js
 *
 * ── Changes vs original ──────────────────────────────────────
 *  • Reads { name, email, empId, designation } from UserContext
 *    so the profile auto-populates after login
 *  • Logout clears the UserContext via logout()
 *  • ALL original styles / layout / colours UNTOUCHED
 * ─────────────────────────────────────────────────────────────
 */
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { useUser } from "../context/UserContext";
import { useState, useEffect } from "react";
import { Image } from "react-native";
import { BASE_URL } from "../api/config";
const C = {
  bg: "#112235",
  orange: "#2F6E8E",
  white: "#FFFFFF",
  gray: "#AAAAAA",
  graySoft: "#7E7E7E",
  darkCard: "#0f1e30",
  border: "#1a3a5c",
  avatarBg: "#163352",
};
function TopNav({ onBack }) {
  return (
    <View style={styles.topNav}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.navTitle}>My Profile</Text>
      <View style={styles.rightSpace} />
    </View>
  );
}
function ProfileHeader({ profile, avatarSize, profileImageUri }) {
  const hasName = !!profile?.name;
  const hasRole = !!profile?.designation;
  const getInitials = (name = "") => {
    const parts = name.trim().split(" ").filter(Boolean);
    if (!parts.length) return "";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "";
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  };
  const initials = hasName ? getInitials(profile.name) : "";
  return (
    <View style={styles.profileHeader}>
      <View style={[styles.avatarBox, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}>
        {profileImageUri
          ? <Image source={{ uri: profileImageUri }} style={{ width: "100%", height: "100%" }} />
          : initials
            ? <Text style={[styles.avatarInitials, { fontSize: avatarSize * 0.3 }]}>{initials}</Text>
            : <Text style={[styles.avatarFallback, { fontSize: avatarSize * 0.34 }]}>👤</Text>}
      </View>
      {(hasName || hasRole) && (
        <View style={styles.profileInfo}>
          {hasName && <Text style={styles.profileName}>{profile.name}</Text>}
          {/* Show designation under name */}
          {hasRole && <Text style={styles.profileRole}>{profile.designation}</Text>}
          {/* Employee ID badge */}
          {profile?.empId && (
            <Text style={[styles.profileRole, { fontSize: 12, marginTop: 2, opacity: 0.75 }]}>
              ID: {profile.empId}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
function MenuSection({ title, items }) {
  if (!items?.length) return null;
  return (
    <View style={styles.menuSection}>
      <Text style={styles.menuSectionTitle}>{title}</Text>
      <View style={styles.menuCard}>
        {items.map((item, i) => (
          <TouchableOpacity
            key={`${item.label}-${i}`}
            style={[styles.menuRow, i < items.length - 1 && styles.menuRowBorder]}
            onPress={item.onPress}
            activeOpacity={0.75}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: item.iconBg || "#1a3a5c" }]}>
                <Text style={styles.menuIconEmoji}>{item.icon}</Text>
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
function ContactSection({ email, phone }) {
  const rows = [];
  if (email) rows.push({ icon: "✉️", value: email, bg: "#0f2a3a" });
  if (phone) rows.push({ icon: "📞", value: phone, bg: "#0f1e30" });
  if (!rows.length) return null;
  return (
    <View style={styles.menuSection}>
      <Text style={styles.menuSectionTitle}>CONTACT</Text>
      <View style={styles.menuCard}>
        {rows.map((row, i) => (
          <View key={`${row.value}-${i}`}
            style={[styles.menuRow, i < rows.length - 1 && styles.menuRowBorder]}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: row.bg }]}>
                <Text style={styles.menuIconEmoji}>{row.icon}</Text>
              </View>
              <Text style={styles.menuLabel} numberOfLines={1} ellipsizeMode="tail">
                {row.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
export default function ProfileScreen({ onBack, onNavigate }) {
  const { user, logout } = useUser();
  const { width } = useWindowDimensions();
  const [profileImageUri, setProfileImageUri] = useState(null);

  useEffect(() => {
    if (!user?.empId) return;
    fetch(`${BASE_URL}/api/employees/by-empid/${user.empId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.profileImage) setProfileImageUri(data.profileImage);
      })
      .catch(() => { });
  }, [user?.empId]);
  const isSmallPhone = width < 360;
  const avatarSize = width < 360 ? 92 : width < 420 ? 104 : 114;
  // Build profile from real user data (falls back to empty strings gracefully)
  const profile = {
    name: user?.name || "",
    email: user?.email || "",
    empId: user?.empId || "",
    designation: user?.designation || "",
    phone: user?.phone || "",
  };
  const accountItems = [
    {
      label: "Personal Data",
      icon: "👤",
      iconBg: "#0f2035",
      onPress: () => onNavigate?.("personalData"),
    },
    {
      label: "Payroll & Tax",
      icon: "🎫",
      iconBg: "#0f1e30",
      onPress: () => Alert.alert("Payroll & Tax", "Coming soon."),
    },
  ];
  const settingsItems = [
    {
      label: "Change Password",
      icon: "⚙️",
      iconBg: "#0f1e3a",
      onPress: () => Alert.alert("Change Password", "Coming soon."),
    },
    {
      label: "FAQ and Help",
      icon: "🗂️",
      iconBg: "#0f1e3a",
      onPress: () => Alert.alert("FAQ and Help", "Coming soon."),
    },
    {
      label: "Logout",
      icon: "🚪",
      iconBg: "#1a2535",
      onPress: () => {
        // Direct logout without Alert confirmation — works on web + mobile
        logout();
        onNavigate?.("logout");
      },
    },
  ];
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={styles.blueStrip} />
      <TopNav onBack={onBack} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: isSmallPhone ? 28 : 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header populated from logged-in user */}
        <ProfileHeader profile={profile} avatarSize={avatarSize} profileImageUri={profileImageUri} />
        {/* Contact section — email from backend */}
        <ContactSection email={profile.email} phone={profile.phone} />
        <MenuSection title="ACCOUNT" items={accountItems} />
        <MenuSection title="SETTINGS" items={settingsItems} />
      </ScrollView>
    </SafeAreaView>
  );
}
// ── Styles (100% original — zero changes) ────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  blueStrip: {
    position: "absolute", top: 0, left: 0, right: 0, height: 180,
    backgroundColor: C.orange,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  topNav: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 14,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.darkCard,
    alignItems: "center", justifyContent: "center",
  },
  backArrow: { color: C.white, fontSize: 18, fontWeight: "700" },
  navTitle: {
    flex: 1, color: C.white, fontSize: 17,
    fontWeight: "700", textAlign: "center",
  },
  rightSpace: { width: 40 },
  profileHeader: {
    alignItems: "center", paddingTop: 8, paddingBottom: 22, paddingHorizontal: 16,
  },
  avatarBox: {
    backgroundColor: C.avatarBg, alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: C.bg, overflow: "hidden",
  },
  avatarInitials: { color: C.white, fontWeight: "800" },
  avatarFallback: { color: C.white },
  profileInfo: { alignItems: "center", marginTop: 14 },
  profileName: { color: C.white, fontSize: 22, fontWeight: "700", textAlign: "center" },
  profileRole: { color: C.orange, fontSize: 13, marginTop: 4, textAlign: "center" },
  menuSection: { paddingHorizontal: 16, marginBottom: 18 },
  menuSectionTitle: { color: C.gray, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 10 },
  menuCard: {
    backgroundColor: C.darkCard, borderRadius: 16, overflow: "hidden",
    borderWidth: 1, borderColor: C.border,
  },
  menuRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 15, paddingHorizontal: 15, minHeight: 60,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  menuLeft: { flexDirection: "row", alignItems: "center", flex: 1, paddingRight: 10 },
  menuIconBox: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  menuIconEmoji: { fontSize: 17 },
  menuLabel: { color: C.white, fontSize: 14, fontWeight: "500", flexShrink: 1 },
  menuArrow: { color: C.graySoft, fontSize: 20, fontWeight: "400", marginLeft: 10 },
});
