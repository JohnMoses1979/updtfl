/**
 * adminscreens/Adminleave.js
 * PROJECT A structure + PROJECT B leave approval/reject UI
 * API: GET /api/leave/admin/all, PUT /api/leave/admin/approve/{id}, PUT /api/leave/admin/reject/{id}
 *
 * FIX: mapLeave now reads l.employee?.name (not l.user?.name)
 *      because the Leave entity uses @ManyToOne employee association.
 *      LeaveCard now shows employee name + empId correctly.
 */
import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, StatusBar, Alert, ActivityIndicator, RefreshControl,
} from "react-native";
import { BASE_URL } from "../api/config";
const C = {
  bg: "#112235", card: "#FFFFFF", text: "#F0EDE8", textDark: "#0f1e30",
  muted: "#7A7570", red: "#FF4D6D", blue: "#4D9EFF", teal: "#2DD4BF",
};
function LeaveCard({ item, isPending, onApprove, onReject }) {
  const statusColor = {
    APPROVED: C.teal, REJECTED: C.red, REVIEW: "#F59E0B",
  }[item.status] ?? C.muted;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <View style={[styles.avatar, { backgroundColor: item.accentColor + "22", borderColor: item.accentColor }]}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View>
            {/* ── FIXED: shows real employee name ── */}
            <Text style={styles.empName}>{item.name}</Text>
            {/* ── Show empId under name if available ── */}
            {!!item.empId && (
              <Text style={styles.empIdText}>{item.empId}</Text>
            )}
            <View style={[styles.typeBadge, { borderColor: "#27AE60" }]}>
              <Text style={[styles.typeText, { color: "#27AE60" }]}>{item.leaveType}</Text>
            </View>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.appliedLabel}>Applied on</Text>
          <Text style={styles.appliedDate}>{item.appliedDate}</Text>
          {!isPending && (
            <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.infoBlock}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Leave Date</Text>
          <Text style={styles.infoValueBold}>{item.startDate} — {item.endDate}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Duration</Text>
          <Text style={styles.infoValueBold}>{item.totalDays} day(s)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Reason</Text>
          <Text style={styles.infoValueBold}>{item.reason}</Text>
        </View>
      </View>
      {isPending && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={onApprove}>
            <Text style={[styles.actionText, { color: C.teal }]}>APPROVE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={onReject}>
            <Text style={[styles.actionText, { color: C.red }]}>REJECT</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
const ACCENT_COLORS = ["#4D6FFF", "#2F6E8E", "#9B59B6", "#27AE60", "#E74C3C", "#F39C12"];
export default function AdminLeaveScreen({ onBack }) {
  const [activeTab, setActiveTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // ── FIX: read l.employee?.name instead of l.user?.name ──────────────────
  const mapLeave = (l, idx) => ({
    id: l.id,
    // employee association is now EAGER-loaded, so l.employee is always populated
    name: l.employee?.name ?? l.employee?.empId ?? "Unknown Employee",
    empId: l.employee?.empId ?? "",
    accentColor: ACCENT_COLORS[idx % ACCENT_COLORS.length],
    leaveType: l.leaveType ?? "—",
    appliedDate: l.appliedDate ?? "—",
    startDate: l.startDate ?? "—",
    endDate: l.endDate ?? "—",
    totalDays: l.totalDays ?? 0,
    reason: l.reason ?? "—",
    status: l.status,
  });
  const fetchLeaves = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/leave/admin/all`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      const pendingList = data
        .filter((l) => l.status === "REVIEW")
        .map(mapLeave);
      const historyList = data
        .filter((l) => l.status !== "REVIEW")
        .map(mapLeave);
      setPending(pendingList);
      setHistory(historyList);
    } catch (err) {
      Alert.alert("Error", err.message || "Cannot connect to server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => { fetchLeaves(); }, []);
  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/leave/admin/approve/${id}`, { method: "PUT" });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      fetchLeaves();
    } catch (err) {
      Alert.alert("Error", err.message || "Approve failed");
    }
  };
  const handleReject = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/api/leave/admin/reject/${id}`, { method: "PUT" });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      fetchLeaves();
    } catch (err) {
      Alert.alert("Error", err.message || "Reject failed");
    }
  };
  const list = activeTab === "pending" ? pending : history;
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backLabel}>Admin</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave Requests</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.tabBar}>
        {["pending", "history"].map((tab) => (
          <TouchableOpacity key={tab} style={styles.tabItem} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === "pending" ? "PENDING" : "HISTORY"}
            </Text>
            {activeTab === tab && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2F6E8E" />
        </View>
      ) : (
        <ScrollView
          style={styles.body}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchLeaves(true)}
              tintColor="#2F6E8E"
              colors={["#2F6E8E"]}
            />
          }
        >
          {list.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>{activeTab === "pending" ? "✅" : "📋"}</Text>
              <Text style={styles.emptyText}>
                {activeTab === "pending" ? "No pending requests" : "No history yet"}
              </Text>
            </View>
          ) : (
            list.map((item) => (
              <LeaveCard
                key={item.id}
                item={item}
                isPending={activeTab === "pending"}
                onApprove={() => handleApprove(item.id)}
                onReject={() => handleReject(item.id)}
              />
            ))
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 29, paddingBottom: 12, backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: "#0f1e30" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 2, minWidth: 60 },
  backArrow: { fontSize: 28, color: "#2F6E8E", lineHeight: 30, marginTop: -2 },
  backLabel: { fontSize: 15, color: "#2F6E8E", fontWeight: "600" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: C.text },
  tabBar: { flexDirection: "row", paddingHorizontal: 20, backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: "#0f1e30", paddingTop: 4, gap: 24 },
  tabItem: { paddingBottom: 10 },
  tabText: { fontSize: 13, fontWeight: "700", color: C.muted, letterSpacing: 0.5 },
  tabTextActive: { color: "#2F6E8E" },
  tabUnderline: { height: 2.5, backgroundColor: "#2F6E8E", borderRadius: 2, marginTop: 6 },
  body: { flex: 1, backgroundColor: C.bg, paddingTop: 16 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  card: { backgroundColor: C.card, marginHorizontal: 16, marginBottom: 16, borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  cardLeft: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  avatarEmoji: { fontSize: 22 },
  empName: { fontSize: 16, fontWeight: "700", color: C.textDark, marginBottom: 2 },
  // ── NEW: empId shown under name ──
  empIdText: { fontSize: 11, color: "#888", fontWeight: "600", marginBottom: 4 },
  typeBadge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 2, alignSelf: "flex-start" },
  typeText: { fontSize: 11, fontWeight: "600" },
  appliedLabel: { fontSize: 11, color: "#AAA" },
  appliedDate: { fontSize: 12, fontWeight: "600", color: C.textDark, marginBottom: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: "flex-end" },
  statusText: { fontSize: 11, fontWeight: "700" },
  infoBlock: { gap: 6, marginBottom: 14 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoLabel: { fontSize: 13, color: "#AAA", width: 110 },
  infoValueBold: { fontSize: 13, fontWeight: "700", color: C.textDark, flex: 1 },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  approveBtn: { backgroundColor: "#E8FAF7" },
  rejectBtn: { backgroundColor: "#FFF0F3" },
  actionText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: C.muted, fontWeight: "600" },
});