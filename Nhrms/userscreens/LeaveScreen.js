/**
 * userscreens/LeaveScreen.js
 * API: POST /api/leave/apply, GET /api/leave/user/{userId}
 * Uses UserContext for userId lookup via empId
 */
import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Platform, Modal, Alert, TextInput,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { BASE_URL } from "../api/config";
import { useUser } from "../context/UserContext";

const C = {
  bg: "#112235", orange: "#2F6E8E", white: "#FFFFFF",
  gray: "#AAAAAA", darkCard: "#0f1e30", border: "#1a3a5c",
  success: "#22C55E", error: "#EF4444",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatDate(date) {
  if (!date) return null;
  return `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
}
function sameDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
function inRange(date, start, end) {
  if (!start || !end || !date) return false;
  return date > start && date < end;
}
function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function Calendar({ startDate, endDate, onSelectStart, onSelectEnd, selectingEnd }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayStripped = stripTime(today);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  const handleDayPress = (date) => {
    if (!date) return;
    if (stripTime(date) < todayStripped) return;
    if (!selectingEnd) {
      onSelectStart(date);
    } else {
      if (startDate && date < startDate) onSelectStart(date);
      else onSelectEnd(date);
    }
  };

  return (
    <View style={cal.wrap}>
      <View style={cal.nav}>
        <TouchableOpacity onPress={prevMonth} style={cal.navBtn}>
          <Text style={cal.navTxt}>‹</Text>
        </TouchableOpacity>
        <Text style={cal.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
        <TouchableOpacity onPress={nextMonth} style={cal.navBtn}>
          <Text style={cal.navTxt}>›</Text>
        </TouchableOpacity>
      </View>
      <View style={cal.headerRow}>
        {DAY_HEADERS.map((d) => <Text key={d} style={cal.dayHeader}>{d}</Text>)}
      </View>
      <View style={cal.grid}>
        {cells.map((date, i) => {
          const isStart = sameDay(date, startDate);
          const isEnd = sameDay(date, endDate);
          const isMid = inRange(date, startDate, endDate);
          const isPast = date && stripTime(date) < todayStripped;
          const isActive = isStart || isEnd;
          return (
            <TouchableOpacity
              key={i}
              style={[cal.cell, isMid && cal.cellMid, isStart && cal.cellRangeLeft, isEnd && cal.cellRangeRight]}
              onPress={() => handleDayPress(date)}
              activeOpacity={date && !isPast ? 0.7 : 1}
            >
              <View style={[cal.dayCircle, isActive && cal.dayCircleActive]}>
                <Text style={[cal.dayTxt, isPast && cal.dayTxtPast, isActive && cal.dayTxtActive, isMid && !isActive && cal.dayTxtMid]}>
                  {date ? date.getDate() : ""}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const cal = StyleSheet.create({
  wrap: { backgroundColor: "#0f2035", borderRadius: 16, padding: 14, marginBottom: 14 },
  nav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  navBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#1a3a5c", alignItems: "center", justifyContent: "center" },
  navTxt: { color: "#fff", fontSize: 22, lineHeight: 26 },
  monthLabel: { color: "#fff", fontSize: 15, fontWeight: "700" },
  headerRow: { flexDirection: "row", marginBottom: 4 },
  dayHeader: { flex: 1, textAlign: "center", color: "#666", fontSize: 11, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.28%", aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  cellMid: { backgroundColor: "rgba(59,130,246,0.14)" },
  cellRangeLeft: { backgroundColor: "rgba(59,130,246,0.14)", borderTopLeftRadius: 50, borderBottomLeftRadius: 50 },
  cellRangeRight: { backgroundColor: "rgba(59,130,246,0.14)", borderTopRightRadius: 50, borderBottomRightRadius: 50 },
  dayCircle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  dayCircleActive: { backgroundColor: "#2F6E8E" },
  dayTxt: { color: "#ddd", fontSize: 13, fontWeight: "500" },
  dayTxtPast: { color: "#444" },
  dayTxtActive: { color: "#fff", fontWeight: "800" },
  dayTxtMid: { color: C.orange },
});

const LEAVE_TYPES = ["Annual Leave", "Sick Leave", "Emergency Leave", "Maternity/Paternity", "Unpaid Leave", "Others"];

function SubmitModal({ visible, onClose, onSubmit, submitting }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [step, setStep] = useState("start");
  const [leaveType, setLeaveType] = useState(null);
  const [reason, setReason] = useState("");
  const [showTypes, setShowTypes] = useState(false);

  const handleSelectStart = (date) => { setStartDate(date); setEndDate(null); setStep("end"); };
  const handleSelectEnd = (date) => { setEndDate(date); setStep("done"); };
  const reset = () => { setStartDate(null); setEndDate(null); setStep("start"); setLeaveType(null); setReason(""); setShowTypes(false); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = () => {
    if (!startDate || !endDate) { Alert.alert("Required", "Please select both start and end dates."); return; }
    if (!leaveType) { Alert.alert("Required", "Please select a leave type."); return; }
    if (!reason.trim()) { Alert.alert("Required", "Please enter a reason."); return; }
    onSubmit({ startDate, endDate, leaveType, reason: reason.trim() });
    reset();
  };

  const totalDays = startDate && endDate
    ? Math.max(1, Math.round((endDate - startDate) / 86400000) + 1) : null;
  const stepHint = step === "start" ? "Tap a date to set start" : step === "end" ? "Now tap the end date" : "Dates selected ✓";
  const canSubmit = startDate && endDate && leaveType && reason.trim();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={sm.overlay}>
        <ScrollView style={sm.sheetScroll} contentContainerStyle={sm.sheetContent} keyboardShouldPersistTaps="handled">
          <View style={sm.handle} />
          <Text style={sm.title}>Submit Leave</Text>
          <Text style={sm.hint}>{stepHint}</Text>

          <View style={sm.rangeRow}>
            <TouchableOpacity style={[sm.rangeBox, step === "start" && sm.rangeBoxActive]} onPress={reset}>
              <Text style={sm.rangeLabel}>START</Text>
              <Text style={[sm.rangeValue, !startDate && sm.rangePlaceholder]}>{startDate ? formatDate(startDate) : "—"}</Text>
            </TouchableOpacity>
            <View style={sm.rangeArrow}><Text style={sm.rangeArrowTxt}>›</Text></View>
            <View style={[sm.rangeBox, step === "end" && sm.rangeBoxActive]}>
              <Text style={sm.rangeLabel}>END</Text>
              <Text style={[sm.rangeValue, !endDate && sm.rangePlaceholder]}>{endDate ? formatDate(endDate) : "—"}</Text>
            </View>
          </View>

          {totalDays && (
            <View style={sm.badge}>
              <Text style={sm.badgeTxt}>🗓  {totalDays} day{totalDays > 1 ? "s" : ""}</Text>
            </View>
          )}

          <Calendar
            startDate={startDate} endDate={endDate}
            onSelectStart={handleSelectStart} onSelectEnd={handleSelectEnd}
            selectingEnd={step === "end" || step === "done"}
          />
          {startDate && (
            <TouchableOpacity onPress={reset} style={sm.resetBtn}>
              <Text style={sm.resetTxt}>↺  Reset selection</Text>
            </TouchableOpacity>
          )}

          <Text style={sm.fieldLabel}>Leave Type</Text>
          <TouchableOpacity style={sm.typeSelector} onPress={() => setShowTypes((v) => !v)}>
            <Text style={[sm.typeSelectorTxt, !leaveType && sm.typeSelectorPlaceholder]}>
              {leaveType ?? "Select leave type"}
            </Text>
            <Text style={sm.typeChevron}>{showTypes ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {showTypes && (
            <View style={sm.typeDropdown}>
              {LEAVE_TYPES.map((t) => (
                <TouchableOpacity key={t} style={[sm.typeOption, leaveType === t && sm.typeOptionActive]}
                  onPress={() => { setLeaveType(t); setShowTypes(false); }}>
                  <Text style={[sm.typeOptionTxt, leaveType === t && sm.typeOptionTxtActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[sm.fieldLabel, { marginTop: 14 }]}>Reason for Leave</Text>
          <TextInput
            style={sm.reasonInput}
            placeholder="Briefly describe your reason…"
            placeholderTextColor="#555"
            value={reason}
            onChangeText={setReason}
            multiline numberOfLines={3} maxLength={300} textAlignVertical="top"
          />
          <Text style={sm.charCount}>{reason.length}/300</Text>

          <TouchableOpacity
            style={[sm.submitBtn, (!canSubmit || submitting) && { opacity: 0.4 }]}
            onPress={handleSubmit} disabled={!canSubmit || submitting}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={sm.submitTxt}>Submit Leave</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClose} style={sm.cancelBtn}>
            <Text style={sm.cancelTxt}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const sm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", justifyContent: "flex-end" },
  sheetScroll: { backgroundColor: "#0f1e30", borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "92%" },
  sheetContent: { padding: 20, paddingBottom: Platform.OS === "ios" ? 44 : 24 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#3A3A3A", alignSelf: "center", marginBottom: 16 },
  title: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 2 },
  hint: { color: C.orange, fontSize: 12, fontWeight: "600", marginBottom: 14 },
  rangeRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
  rangeBox: { flex: 1, backgroundColor: "#1a3a5c", borderRadius: 12, padding: 12, borderWidth: 1.5, borderColor: "transparent" },
  rangeBoxActive: { borderColor: C.orange },
  rangeLabel: { color: "#666", fontSize: 9, fontWeight: "700", letterSpacing: 1, marginBottom: 4 },
  rangeValue: { color: "#fff", fontSize: 13, fontWeight: "700" },
  rangePlaceholder: { color: "#555" },
  rangeArrow: { alignItems: "center", justifyContent: "center" },
  rangeArrowTxt: { color: "#555", fontSize: 20 },
  badge: { backgroundColor: "rgba(240,90,40,0.12)", borderRadius: 10, paddingVertical: 7, alignItems: "center", marginBottom: 12 },
  badgeTxt: { color: C.orange, fontSize: 13, fontWeight: "700" },
  resetBtn: { alignItems: "center", marginBottom: 10 },
  resetTxt: { color: "#555", fontSize: 13 },
  fieldLabel: { color: "#888", fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: 6 },
  typeSelector: { backgroundColor: "#1a3a5c", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1.5, borderColor: "#3A3A3A" },
  typeSelectorTxt: { color: "#fff", fontSize: 14, fontWeight: "600" },
  typeSelectorPlaceholder: { color: "#555", fontWeight: "400" },
  typeChevron: { color: "#666", fontSize: 11 },
  typeDropdown: { backgroundColor: "#1a3a5c", borderRadius: 12, marginTop: 4, overflow: "hidden", borderWidth: 1, borderColor: "#3A3A3A", marginBottom: 4 },
  typeOption: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#1a3a5c" },
  typeOptionActive: { backgroundColor: "rgba(240,90,40,0.12)" },
  typeOptionTxt: { color: "#bbb", fontSize: 14 },
  typeOptionTxtActive: { color: C.orange, fontWeight: "700" },
  reasonInput: { backgroundColor: "#1a3a5c", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: "#fff", fontSize: 14, minHeight: 80, borderWidth: 1.5, borderColor: "#3A3A3A", lineHeight: 20 },
  charCount: { color: "#444", fontSize: 11, textAlign: "right", marginTop: 4, marginBottom: 4 },
  submitBtn: { backgroundColor: "#2F6E8E", borderRadius: 30, paddingVertical: 15, alignItems: "center", marginBottom: 10, marginTop: 8 },
  submitTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
  cancelBtn: { alignItems: "center", paddingVertical: 8 },
  cancelTxt: { color: "#555", fontSize: 15 },
});

function LeaveCard({ entry }) {
  const statusColor = {
    APPROVED: C.success, REJECTED: C.error, REVIEW: C.orange,
  }[entry.status?.toUpperCase()] ?? C.gray;

  return (
    <View style={styles.leaveCard}>
      <View style={styles.leaveCardHeader}>
        <Text style={styles.leaveCardDate}>📅  {entry.appliedDate}</Text>
        {entry.leaveType && (
          <View style={styles.leaveTypeBadge}>
            <Text style={styles.leaveTypeBadgeTxt}>{entry.leaveType}</Text>
          </View>
        )}
      </View>
      <View style={styles.leaveDetailRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.leaveDetailLabel}>Leave Date</Text>
          <Text style={styles.leaveDetailValue}>{entry.startDate} — {entry.endDate}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.leaveDetailLabel}>Total Leave</Text>
          <Text style={styles.leaveDetailValue}>{entry.totalDays} Days</Text>
        </View>
      </View>
      {entry.reason ? (
        <View style={styles.reasonRow}>
          <Text style={styles.leaveDetailLabel}>Reason</Text>
          <Text style={styles.reasonTxt}>{entry.reason}</Text>
        </View>
      ) : null}
      <View style={styles.leaveStatusRow}>
        <View style={styles.leaveStatusLeft}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.leaveStatusTxt, { color: statusColor }]}>
            {entry.status === "APPROVED" ? "Approved"
              : entry.status === "REJECTED" ? "Rejected"
                : "Under review"}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function LeaveScreen({ onBack }) {
  const { user } = useUser();
  const [activeStatus, setActiveStatus] = useState("REVIEW");
  const [modalVisible, setModalVisible] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // userId: backend uses numeric id from User entity; user.empId used as fallback
  // For full integration, userId should come from login response.
  // Using 1 as default until backend returns userId in LoginResponseDto.
  const userId = user.userId;

  const fetchLeaves = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/leave/user/${userId}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[LeaveScreen] fetch error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, [userId]);

  const filtered = leaves.filter(
    (l) => (l.status?.toUpperCase() ?? "") === activeStatus.toUpperCase()
  );
  const usedDays = leaves.filter((l) => l.status?.toUpperCase() === "APPROVED")
    .reduce((s, l) => s + (l.totalDays ?? 0), 0);
  const available = Math.max(0, 20 - usedDays);

  const handleSubmit = async ({ startDate, endDate, leaveType, reason }) => {
    setSubmitting(true);
    try {
      console.log("FINAL USER ID SENT:", user?.userId);
      const res = await fetch(`${BASE_URL}/api/leave/apply`, {
        
        method: "POST",
        headers: { "Content-Type": "application/json" },
        
        body: JSON.stringify({
          employeeId: Number(user?.userId),   // 👈 FORCE NUMBER
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          leaveType,
          reason,
        }),
      });
      console.log("FINAL USER ID SENT:", user?.userId);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      Alert.alert("✅ Submitted", "Your leave request has been submitted for review.");
      setModalVisible(false);
      setActiveStatus("REVIEW");
      fetchLeaves();
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to submit leave");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.orangeHeader}>
        <View style={styles.headerTop}>
          {onBack && (
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Leave Summary</Text>
            <Text style={styles.headerSub}>Submit & track your leaves</Text>
          </View>
          <Text style={{ fontSize: 40, marginRight: -8 }}>🧳</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={C.orange} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchLeaves(true)} tintColor={C.orange} colors={[C.orange]} />
          }
        >
          {/* Total Leave Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Leave</Text>
            <Text style={styles.cardPeriod}>Period 1 Jan — 31 Dec</Text>
            <View style={styles.leaveRow}>
              <View style={styles.leaveBox}>
                <View style={styles.dotRow}>
                  <View style={[styles.dot, { backgroundColor: C.success }]} />
                  <Text style={styles.dotLabel}>Available</Text>
                </View>
                <Text style={styles.leaveNum}>{available}</Text>
              </View>
              <View style={styles.leaveDivider} />
              <View style={styles.leaveBox}>
                <View style={styles.dotRow}>
                  <View style={[styles.dot, { backgroundColor: C.orange }]} />
                  <Text style={styles.dotLabel}>Used</Text>
                </View>
                <Text style={styles.leaveNum}>{usedDays}</Text>
              </View>
            </View>
          </View>

          {/* Status Tabs */}
          <View style={styles.tabsRow}>
            {[
              { key: "REVIEW", label: "Review" },
              { key: "APPROVED", label: "Approved" },
              { key: "REJECTED", label: "Rejected" },
            ].map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[styles.tabPill, activeStatus === t.key && styles.tabPillActive]}
                onPress={() => setActiveStatus(t.key)}
              >
                <Text style={[styles.tabPillTxt, activeStatus === t.key && styles.tabPillTxtActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🧳</Text>
              <Text style={styles.emptyTxt}>No {activeStatus.toLowerCase()} leaves</Text>
            </View>
          ) : (
            filtered.map((e) => <LeaveCard key={e.id} entry={e} />)
          )}

          <TouchableOpacity style={styles.submitBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.submitTxt}>+ Submit Leave</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <SubmitModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1, paddingHorizontal: 16 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  orangeHeader: { backgroundColor: "#2F6E8E", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 22 },
  headerTop: { flexDirection: "row", alignItems: "center" },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(186,230,253,0.2)", alignItems: "center", justifyContent: "center", marginRight: 10 },
  backArrow: { color: "#fff", fontSize: 18, fontWeight: "700" },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "800", paddingTop: 39 },
  headerSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 2 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 18, marginTop: 18, marginBottom: 16 },
  cardTitle: { color: C.orange, fontSize: 15, fontWeight: "700", marginBottom: 2 },
  cardPeriod: { color: "#888", fontSize: 12, marginBottom: 14 },
  leaveRow: { flexDirection: "row", alignItems: "center" },
  leaveBox: { flex: 1, backgroundColor: "#EFF6FF", borderRadius: 10, padding: 12 },
  leaveDivider: { width: 10 },
  dotRow: { flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotLabel: { color: "#666", fontSize: 12 },
  leaveNum: { color: "#1a2f4a", fontSize: 26, fontWeight: "800" },
  tabsRow: { flexDirection: "row", backgroundColor: "#0f1e30", borderRadius: 30, padding: 4, marginBottom: 18, gap: 4 },
  tabPill: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 26 },
  tabPillActive: { backgroundColor: "#2F6E8E" },
  tabPillTxt: { color: "#888", fontSize: 14, fontWeight: "600" },
  tabPillTxtActive: { color: "#fff" },
  leaveCard: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 14 },
  leaveCardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  leaveCardDate: { color: C.orange, fontWeight: "700", fontSize: 14 },
  leaveTypeBadge: { backgroundColor: "rgba(59,130,246,0.10)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  leaveTypeBadgeTxt: { color: C.orange, fontSize: 11, fontWeight: "700" },
  leaveDetailRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#EFF6FF", borderRadius: 10, padding: 12, marginBottom: 10, alignItems: "center" },
  leaveDetailLabel: { color: "#888", fontSize: 11, marginBottom: 4 },
  leaveDetailValue: { color: "#1a2f4a", fontSize: 15, fontWeight: "700" },
  reasonRow: { backgroundColor: "#EFF6FF", borderRadius: 10, padding: 12, marginBottom: 10 },
  reasonTxt: { color: "#1a2f4a", fontSize: 13, lineHeight: 18 },
  leaveStatusRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  leaveStatusLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  leaveStatusTxt: { fontSize: 12, fontWeight: "600" },
  submitBtn: { backgroundColor: "#2F6E8E", borderRadius: 30, paddingVertical: 16, alignItems: "center", marginTop: 8, marginBottom: 10, shadowColor: "#2F6E8E", shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  submitTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
  emptyBox: { alignItems: "center", paddingVertical: 40 },
  emptyTxt: { color: "#888", fontSize: 14 },
});