/**
 * adminscreens/Adminattendance.js
 *
 * ── What changed vs original ─────────────────────────────────
 *  1. Fetches real attendance data from GET /api/attendance?date=YYYY-MM-DD
 *  2. Beautiful card UI: gradient status badge, avatar initials, duration chip
 *  3. Pull-to-refresh support
 *  4. Full loading, empty, and error states
 *  5. "+ Log Entry" modal still works (falls back to local state when needed)
 *  6. Manual add now POSTs to /api/attendance/check-in if only empId given
 *  7. Responsive: works on mobile, tablet, and React Native Web / laptop
 *
 *  ALL original layout, navigation, colours, calendar, and month navigation
 *  are UNTOUCHED. Only the attendance card design and data source changed.
 * ─────────────────────────────────────────────────────────────
 */
// import React, { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   StatusBar,
//   Modal,
//   TextInput,
//   Platform,
//   KeyboardAvoidingView,
//   ActivityIndicator,
//   RefreshControl,
//   useWindowDimensions,
// } from "react-native";
// import { BASE_URL } from "../api/config";
// // ─── Theme (identical to existing admin screens) ──────────────
// const C = {
//   bg:        '#112235',
//   darkBrown: '#0f1e30',
//   deepBrown: '#1a3a5c',
//   card:      "#FFFFFF",
//   cardBg:    "#EFF6FF",
//   orange:    '#2F6E8E',
//   text:      "#F0EDE8",
//   textDark:  "#0f1e30",
//   muted:     "#7A7570",
//   mutedDark: "#888",
//   border:    "#E8E4DF",
//   success:   "#22C55E",
//   warning:   "#F59E0B",
//   error:     "#EF4444",
//   active:    "#3B82F6",
// };
// // Status colours
// const STATUS_CFG = {
//   Present: { bg: "#DCFCE7", text: "#16A34A", dot: "#22C55E", label: "Present" },
//   Active:  { bg: "#DBEAFE", text: "#1D4ED8", dot: "#3B82F6", label: "Active"  },
//   Absent:  { bg: "#FEE2E2", text: "#DC2626", dot: "#EF4444", label: "Absent"  },
// };
// const ACCENT_COLORS = [
//   "#4D6FFF","#2F6E8E","#9B59B6","#27AE60",
//   "#E74C3C","#F39C12","#2DD4BF","#FF6B9D",
// ];
// const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
// const MONTHS     = [
//   "January","February","March","April","May","June",
//   "July","August","September","October","November","December",
// ];
// // ─── Utility helpers ──────────────────────────────────────────
// function initials(name = "") {
//   return (name || "?")
//     .split(" ")
//     .filter(Boolean)
//     .map(w => w[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();
// }
// function accentFor(str = "") {
//   let hash = 0;
//   for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
//   return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
// }
// function getDaysInMonth(year, month) {
//   return new Date(year, month + 1, 0).getDate();
// }
// /**
//  * Format durationMinutes (number) → "H hr M min" or "Active" if -1.
//  */
// function formatDuration(minutes) {
//   if (minutes < 0) return "Active";
//   if (minutes === 0) return "0 min";
//   const h = Math.floor(minutes / 60);
//   const m = minutes % 60;
//   if (h === 0) return `${m} min`;
//   if (m === 0) return `${h} hr`;
//   return `${h} hr ${m} min`;
// }
// /**
//  * Build "YYYY-MM-DD" from a Date object.
//  */
// function toISODate(year, month, day) {
//   return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
// }
// // ─────────────────────────────────────────────────────────────
// //  BEAUTIFUL ATTENDANCE CARD
// // ─────────────────────────────────────────────────────────────
// function AttendanceCard({ record, cardWidth }) {
//   const status   = record.status || "Present";
//   const cfg      = STATUS_CFG[status] || STATUS_CFG.Present;
//   const color    = accentFor(record.empId || record.employeeName);
//   const initials_ = initials(record.employeeName);
//   // Duration chip
//   const duration = formatDuration(
//     typeof record.durationMinutes === "number" ? record.durationMinutes : -1
//   );
//   const checkIn  = record.checkIn  || record.checkin  || "—";
//   const checkOut = record.checkOut || record.checkout || "—";
//   const name     = record.employeeName || record.name || "Unknown";
//   const empId    = record.empId || record.id || "";
//   return (
//     <View style={[styles.attendanceCard, { width: cardWidth }]}>
//       {/* Top bar: avatar + name + status badge */}
//       <View style={styles.cardTopRow}>
//         {/* Avatar */}
//         <View style={[styles.cardAvatar, { backgroundColor: color + "22", borderColor: color }]}>
//           <Text style={[styles.cardAvatarText, { color }]}>{initials_}</Text>
//         </View>
//         {/* Name + ID */}
//         <View style={styles.cardNameBlock}>
//           <Text style={styles.cardName} numberOfLines={1}>{name}</Text>
//           <Text style={styles.cardEmpId}>{empId}</Text>
//         </View>
//         {/* Status badge */}
//         <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
//           <View style={[styles.statusDot, { backgroundColor: cfg.dot }]} />
//           <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
//         </View>
//       </View>
//       {/* Divider */}
//       <View style={styles.cardDivider} />
//       {/* Time row */}
//       <View style={styles.cardTimeRow}>
//         {/* Check-in */}
//         <View style={styles.timeBlock}>
//           <View style={styles.timeIconRow}>
//             <View style={[styles.timeIconDot, { backgroundColor: C.success }]} />
//             <Text style={styles.timeLabel}>Check-in</Text>
//           </View>
//           <Text style={[styles.timeValue, { color: C.success }]}>{checkIn}</Text>
//         </View>
//         {/* Arrow connector */}
//         <View style={styles.timeSeparator}>
//           <View style={styles.separatorLine} />
//           <View style={styles.separatorArrow} />
//         </View>
//         {/* Check-out */}
//         <View style={[styles.timeBlock, styles.timeBlockRight]}>
//           <View style={[styles.timeIconRow, { justifyContent: "flex-end" }]}>
//             <Text style={styles.timeLabel}>Check-out</Text>
//             <View style={[styles.timeIconDot, {
//               backgroundColor: checkOut === "—" ? C.muted : C.error,
//               marginLeft: 4, marginRight: 0,
//             }]} />
//           </View>
//           <Text style={[styles.timeValue, {
//             color: checkOut === "—" ? C.muted : C.error,
//             textAlign: "right",
//           }]}>{checkOut}</Text>
//         </View>
//       </View>
//       {/* Duration chip */}
//       <View style={styles.durationRow}>
//         <View style={[styles.durationChip, {
//           backgroundColor: status === "Active" ? "#DBEAFE" : "#F0FDF4",
//         }]}>
//           <Text style={[styles.durationIcon]}>⏱</Text>
//           <Text style={[styles.durationText, {
//             color: status === "Active" ? "#1D4ED8" : "#16A34A",
//           }]}>
//             {duration}
//           </Text>
//         </View>
//       </View>
//     </View>
//   );
// }
// // ─────────────────────────────────────────────────────────────
// //  MAIN SCREEN
// // ─────────────────────────────────────────────────────────────
// export default function AdminAttendanceScreen({ onBack }) {
//   const today = new Date();
//   const { width: screenWidth } = useWindowDimensions();
//   // ── Calendar state (unchanged from original) ─────────────
//   const [viewYear,     setViewYear]     = useState(today.getFullYear());
//   const [viewMonth,    setViewMonth]    = useState(today.getMonth());
//   const [selectedDate, setSelectedDate] = useState(today.getDate());
//   // ── Data state ────────────────────────────────────────────
//   const [records,      setRecords]      = useState([]);
//   const [loading,      setLoading]      = useState(false);
//   const [refreshing,   setRefreshing]   = useState(false);
//   const [error,        setError]        = useState(null);
//   // ── Add-entry modal state (kept from original) ────────────
//   const [addModalVisible, setAddModalVisible] = useState(false);
//   const [form, setForm] = useState({ name: "", empId: "", checkIn: "", checkOut: "" });
//   const [submitting, setSubmitting] = useState(false);
//   // ── Responsive card layout ────────────────────────────────
//   // On wide screens (tablet / web) show two columns, otherwise one.
//   const isWide   = screenWidth >= 768;
//   const PADDING  = 32;              // total horizontal padding
//   const GAP      = isWide ? 12 : 0; // gap between columns
//   const cardWidth = isWide
//     ? (screenWidth - PADDING - GAP) / 2
//     : screenWidth - PADDING;
//   // ─────────────────────────────────────────────────────────
//   // FETCH attendance from backend
//   // ─────────────────────────────────────────────────────────
//   const fetchAttendance = useCallback(async (isRefresh = false) => {
//     if (isRefresh) setRefreshing(true);
//     else setLoading(true);
//     setError(null);
//     const dateStr = toISODate(viewYear, viewMonth, selectedDate);
//     try {
//       const res = await fetch(
//         `${BASE_URL}/api/attendance?date=${dateStr}`,
//         { method: "GET", headers: { "Content-Type": "application/json" } }
//       );
//       if (!res.ok) {
//         throw new Error(`Server error ${res.status}`);
//       }
//       const data = await res.json();
//       // data is an array of AttendanceRecordDto
//       setRecords(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("[AdminAttendance] fetch error:", err.message);
//       setError(err.message || "Failed to load attendance");
//       setRecords([]);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [viewYear, viewMonth, selectedDate]);
//   // Re-fetch whenever the selected date changes
//   useEffect(() => {
//     fetchAttendance();
//   }, [fetchAttendance]);
//   // ─────────────────────────────────────────────────────────
//   // Month navigation (unchanged from original)
//   // ─────────────────────────────────────────────────────────
//   const prevMonth = () => {
//     if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
//     else setViewMonth(m => m - 1);
//     setSelectedDate(1);
//   };
//   const nextMonth = () => {
//     if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
//     else setViewMonth(m => m + 1);
//     setSelectedDate(1);
//   };
//   // ─────────────────────────────────────────────────────────
//   // Manual add entry (POSTs check-in to backend if empId given)
//   // ─────────────────────────────────────────────────────────
//   const handleAdd = async () => {
//     if (!form.name.trim() && !form.empId.trim()) return;
//     setSubmitting(true);
//     try {
//       // If an empId is provided, try to record via the API
//       if (form.empId.trim()) {
//         await fetch(`${BASE_URL}/api/attendance/check-in`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ empId: form.empId.trim() }),
//         });
//       }
//     } catch (err) {
//       console.warn("[AdminAttendance] manual add API call failed:", err.message);
//       // Fall through — we'll refresh to show whatever is in DB
//     }
//     setForm({ name: "", empId: "", checkIn: "", checkOut: "" });
//     setAddModalVisible(false);
//     setSubmitting(false);
//     // Refresh list from backend
//     fetchAttendance();
//   };
//   // ─────────────────────────────────────────────────────────
//   // Render
//   // ─────────────────────────────────────────────────────────
//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle="light-content" backgroundColor={C.darkBrown} />
//       {/* ── Header (unchanged) ── */}
//       <View style={styles.header}>
//         <View style={styles.topRow}>
//           <TouchableOpacity style={styles.backBtn} onPress={onBack}>
//             <Text style={styles.backArrow}>‹</Text>
//             <Text style={styles.backLabel}>Admin</Text>
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Attendance</Text>
//           <TouchableOpacity
//             style={styles.addEntryBtn}
//             onPress={() => setAddModalVisible(true)}
//           >
//             <Text style={{ color: C.orange, fontSize: 22 }}>+</Text>
//           </TouchableOpacity>
//         </View>
//         {/* Month navigation (unchanged) */}
//         <View style={styles.calNav}>
//           <TouchableOpacity onPress={prevMonth}>
//             <Text style={styles.calNavArrow}>‹</Text>
//           </TouchableOpacity>
//           <Text style={styles.calNavTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
//           <TouchableOpacity onPress={nextMonth}>
//             <Text style={styles.calNavArrow}>›</Text>
//           </TouchableOpacity>
//         </View>
//         {/* Horizontal date scroll (unchanged) */}
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.dateScroll}
//         >
//           {Array.from({ length: getDaysInMonth(viewYear, viewMonth) }, (_, i) => i + 1)
//             .map(day => {
//               const isSelected = selectedDate === day;
//               return (
//                 <TouchableOpacity
//                   key={day}
//                   style={[styles.dateItem, isSelected && styles.dateItemSelected]}
//                   onPress={() => setSelectedDate(day)}
//                 >
//                   <Text style={[styles.dateDay, isSelected && styles.dateDaySelected]}>
//                     {DAYS_SHORT[new Date(viewYear, viewMonth, day).getDay()]}
//                   </Text>
//                   <Text style={[styles.dateNumber, isSelected && styles.dateNumberSelected]}>
//                     {day}
//                   </Text>
//                 </TouchableOpacity>
//               );
//             })}
//         </ScrollView>
//       </View>
//       {/* ── Body ── */}
//       <ScrollView
//         style={styles.body}
//         contentContainerStyle={styles.bodyContent}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={() => fetchAttendance(true)}
//             tintColor={C.orange}
//             colors={[C.orange]}
//           />
//         }
//       >
//         {/* Date label */}
//         <View style={styles.dateCard}>
//           <Text style={styles.dateCardText}>
//             {MONTHS[viewMonth]} {selectedDate}, {viewYear}
//           </Text>
//           <Text style={styles.recordCount}>
//             {loading ? "Loading…" : `${records.length} record${records.length !== 1 ? "s" : ""}`}
//           </Text>
//         </View>
//         {/* ── Loading state ── */}
//         {loading && (
//           <View style={styles.centeredBox}>
//             <ActivityIndicator size="large" color={C.orange} />
//             <Text style={styles.loadingText}>Fetching attendance…</Text>
//           </View>
//         )}
//         {/* ── Error state ── */}
//         {!loading && error && (
//           <View style={styles.centeredBox}>
//             <Text style={styles.errorIcon}>⚠️</Text>
//             <Text style={styles.errorText}>Could not load records</Text>
//             <Text style={styles.errorSub}>{error}</Text>
//             <TouchableOpacity
//               style={styles.retryBtn}
//               onPress={() => fetchAttendance()}
//             >
//               <Text style={styles.retryBtnText}>Retry</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//         {/* ── Empty state ── */}
//         {!loading && !error && records.length === 0 && (
//           <View style={styles.centeredBox}>
//             <Text style={styles.emptyIcon}>📋</Text>
//             <Text style={styles.emptyText}>No attendance records</Text>
//             <Text style={styles.emptySub}>
//               Records appear here automatically after employees check in.
//             </Text>
//           </View>
//         )}
//         {/* ── Records (responsive grid) ── */}
//         {!loading && !error && records.length > 0 && (
//           isWide ? (
//             // Two-column grid on wide screens
//             <View style={styles.gridContainer}>
//               {records.map((rec, i) => (
//                 <AttendanceCard
//                   key={rec.id ?? i}
//                   record={rec}
//                   cardWidth={cardWidth}
//                 />
//               ))}
//             </View>
//           ) : (
//             // Single column on mobile
//             records.map((rec, i) => (
//               <AttendanceCard
//                 key={rec.id ?? i}
//                 record={rec}
//                 cardWidth={cardWidth}
//               />
//             ))
//           )
//         )}
//         <View style={{ height: 32 }} />
//       </ScrollView>
//       {/* ── Add Entry Modal (unchanged + enhanced) ── */}
//       <Modal visible={addModalVisible} transparent animationType="slide">
//         <KeyboardAvoidingView
//           style={styles.modalOverlay}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//           <View style={styles.modalSheet}>
//             <Text style={styles.sheetTitle}>Log Attendance</Text>
//             <Text style={styles.sheetSubtitle}>
//               Enter employee details to manually log attendance
//             </Text>
//             <Text style={styles.fieldLabel}>Employee Name</Text>
//             <TextInput
//               style={styles.fieldInput}
//               placeholder="Full name"
//               placeholderTextColor={C.muted}
//               value={form.name}
//               onChangeText={v => setForm(p => ({ ...p, name: v }))}
//             />
//             <Text style={styles.fieldLabel}>Employee ID (optional)</Text>
//             <TextInput
//               style={styles.fieldInput}
//               placeholder="e.g. EMP001"
//               placeholderTextColor={C.muted}
//               value={form.empId}
//               onChangeText={v => setForm(p => ({ ...p, empId: v }))}
//               autoCapitalize="characters"
//             />
//             <Text style={styles.fieldLabel}>Check-In Time</Text>
//             <TextInput
//               style={styles.fieldInput}
//               placeholder="e.g. 09:00"
//               placeholderTextColor={C.muted}
//               value={form.checkIn}
//               onChangeText={v => setForm(p => ({ ...p, checkIn: v }))}
//             />
//             <Text style={styles.fieldLabel}>Check-Out Time</Text>
//             <TextInput
//               style={styles.fieldInput}
//               placeholder="e.g. 17:30"
//               placeholderTextColor={C.muted}
//               value={form.checkOut}
//               onChangeText={v => setForm(p => ({ ...p, checkOut: v }))}
//             />
//             <View style={styles.modalActions}>
//               <TouchableOpacity
//                 style={styles.cancelBtn}
//                 onPress={() => { setAddModalVisible(false); setForm({ name:"",empId:"",checkIn:"",checkOut:"" }); }}
//               >
//                 <Text style={styles.cancelBtnText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.saveBtn, submitting && { opacity: 0.6 }]}
//                 onPress={handleAdd}
//                 disabled={submitting}
//               >
//                 {submitting
//                   ? <ActivityIndicator color="#FFF" size="small" />
//                   : <Text style={styles.saveBtnText}>Save</Text>}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>
//     </SafeAreaView>
//   );
// }
// // ─────────────────────────────────────────────────────────────
// //  STYLES
// // ─────────────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: C.darkBrown },
//   // ── Header (unchanged from original) ──────────────────────
//   header: { backgroundColor: C.darkBrown, paddingBottom: 12, paddingTop: 29 },
//   topRow: { flexDirection: "row", justifyContent: "space-between", padding: 16 },
//   backBtn: { flexDirection: "row", alignItems: "center" },
//   backArrow: { color: C.orange, fontSize: 24 },
//   backLabel: { color: C.orange, marginLeft: 4 },
//   headerTitle: { color: C.text, fontSize: 20, fontWeight: "700" },
//   addEntryBtn: {
//     width: 36, height: 36, borderRadius: 18,
//     borderWidth: 1, borderColor: C.orange,
//     alignItems: "center", justifyContent: "center",
//   },
//   calNav: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 12 },
//   calNavArrow: { color: C.orange, fontSize: 24 },
//   calNavTitle: { color: C.text, fontWeight: "700" },
//   dateScroll: { paddingHorizontal: 12 },
//   dateItem: {
//     width: 60, height: 72, borderRadius: 16,
//     backgroundColor: "#1a3a5c", marginRight: 10,
//     alignItems: "center", justifyContent: "center",
//   },
//   dateItemSelected: { backgroundColor: C.orange },
//   dateDay: { color: C.muted, fontSize: 12 },
//   dateDaySelected: { color: "#FFF" },
//   dateNumber: { color: C.text, fontSize: 20, fontWeight: "700" },
//   dateNumberSelected: { color: "#FFF" },
//   // ── Body ──────────────────────────────────────────────────
//   body: { flex: 1, backgroundColor: C.cardBg },
//   bodyContent: { paddingHorizontal: 16, paddingBottom: 20 },
//   dateCard: {
//     flexDirection: "row", justifyContent: "space-between",
//     alignItems: "center", paddingVertical: 14,
//   },
//   dateCardText: { fontWeight: "700", color: C.textDark, fontSize: 15 },
//   recordCount: { fontSize: 12, color: C.mutedDark, fontWeight: "600" },
//   // ── Responsive grid ───────────────────────────────────────
//   gridContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },
//   // ── Loading / error / empty ───────────────────────────────
//   centeredBox: {
//     alignItems: "center",
//     paddingTop: 48,
//     paddingBottom: 24,
//     gap: 8,
//   },
//   loadingText: { color: C.mutedDark, fontSize: 14, marginTop: 12 },
//   errorIcon:   { fontSize: 36 },
//   errorText:   { fontSize: 16, fontWeight: "700", color: C.textDark },
//   errorSub:    { fontSize: 13, color: C.mutedDark, textAlign: "center", paddingHorizontal: 20 },
//   retryBtn: {
//     marginTop: 12, backgroundColor: C.orange, borderRadius: 10,
//     paddingHorizontal: 24, paddingVertical: 10,
//   },
//   retryBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
//   emptyIcon:    { fontSize: 42, marginBottom: 4 },
//   emptyText:    { fontSize: 16, fontWeight: "700", color: C.textDark },
//   emptySub:     { fontSize: 13, color: C.mutedDark, textAlign: "center", paddingHorizontal: 30, lineHeight: 20 },
//   // ── Attendance Card ───────────────────────────────────────
//   attendanceCard: {
//     backgroundColor: C.card,
//     borderRadius: 18,
//     padding: 16,
//     marginBottom: 14,
//     // Subtle shadow
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.09,
//     shadowRadius: 10,
//     elevation: 4,
//     borderWidth: 1,
//     borderColor: "rgba(0,0,0,0.04)",
//   },
//   // Top row: avatar + name/id + badge
//   cardTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
//   cardAvatar: {
//     width: 46, height: 46, borderRadius: 23,
//     alignItems: "center", justifyContent: "center",
//     borderWidth: 2, marginRight: 12,
//   },
//   cardAvatarText: { fontWeight: "700", fontSize: 16 },
//   cardNameBlock: { flex: 1 },
//   cardName: { fontSize: 15, fontWeight: "700", color: C.textDark, marginBottom: 2 },
//   cardEmpId: { fontSize: 12, color: C.mutedDark, fontWeight: "500" },
//   // Status badge
//   statusBadge: {
//     flexDirection: "row", alignItems: "center", gap: 5,
//     paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
//   },
//   statusDot: { width: 7, height: 7, borderRadius: 4 },
//   statusText: { fontSize: 11, fontWeight: "700" },
//   // Divider
//   cardDivider: { height: 1, backgroundColor: "#F0EDE8", marginBottom: 12 },
//   // Time row
//   cardTimeRow: {
//     flexDirection: "row", alignItems: "center",
//     marginBottom: 10,
//   },
//   timeBlock: { flex: 1 },
//   timeBlockRight: { alignItems: "flex-end" },
//   timeIconRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
//   timeIconDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
//   timeLabel: { fontSize: 11, color: C.mutedDark, fontWeight: "600", letterSpacing: 0.3 },
//   timeValue: { fontSize: 20, fontWeight: "800" },
//   // Arrow separator between times
//   timeSeparator: { flexDirection: "row", alignItems: "center", marginHorizontal: 8, flex: 0.4 },
//   separatorLine: { flex: 1, height: 1.5, backgroundColor: "#E5E7EB" },
//   separatorArrow: {
//     width: 0, height: 0,
//     borderTopWidth: 5, borderTopColor: "transparent",
//     borderBottomWidth: 5, borderBottomColor: "transparent",
//     borderLeftWidth: 7, borderLeftColor: "#E5E7EB",
//   },
//   // Duration chip
//   durationRow: { alignItems: "flex-start" },
//   durationChip: {
//     flexDirection: "row", alignItems: "center", gap: 5,
//     paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
//   },
//   durationIcon: { fontSize: 12 },
//   durationText: { fontSize: 12, fontWeight: "700" },
//   // ── Add Modal (unchanged styling from original) ───────────
//   modalOverlay: { flex: 1, justifyContent: "flex-end" },
//   modalSheet: {
//     backgroundColor: "#0f1e30", padding: 24,
//     borderTopLeftRadius: 24, borderTopRightRadius: 24,
//   },
//   sheetTitle: { color: "#FFF", fontSize: 18, fontWeight: "700", marginBottom: 4 },
//   sheetSubtitle: { color: C.muted, fontSize: 13, marginBottom: 16 },
//   fieldLabel: {
//     color: C.muted, fontSize: 11, fontWeight: "600",
//     marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5,
//   },
//   fieldInput: {
//     backgroundColor: "#0f2035", color: "#FFF", padding: 14,
//     borderRadius: 12, marginBottom: 12, fontSize: 14,
//     borderWidth: 1, borderColor: "#1a3a5c",
//   },
//   modalActions: { flexDirection: "row", gap: 12, marginTop: 8 },
//   cancelBtn: {
//     flex: 1, paddingVertical: 14, borderRadius: 12,
//     borderWidth: 1, borderColor: "#1a3a5c", alignItems: "center",
//   },
//   cancelBtnText: { color: C.muted, fontSize: 15, fontWeight: "600" },
//   saveBtn: { flex: 2, backgroundColor: C.orange, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
//   saveBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
// });



/**
 * adminscreens/Adminattendance.js
 * PROJECT A API logic KEPT + PROJECT B UI improvements merged
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, StatusBar, Modal, TextInput, Platform,
  KeyboardAvoidingView, ActivityIndicator, RefreshControl,
} from "react-native";
import { BASE_URL } from "../api/config";

const C = {
  bg: "#112235",
  darkBrown: "#0f1e30",
  deepBrown: "#1a3a5c",
  card: "#FFFFFF",
  cardBg: "#EFF6FF",
  orange: "#2F6E8E",
  text: "#F0EDE8",
  textDark: "#0f1e30",
  muted: "#7A7570",
  mutedDark: "#888",
  border: "#E8E4DF",
  success: "#22C55E",
  error: "#EF4444",
};

const ACCENT_COLORS = [
  "#2F6E8E", "#4D6FFF", "#9B59B6", "#27AE60",
  "#E74C3C", "#F39C12", "#2DD4BF", "#FF6B9D",
];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function initials(name = "") {
  return (name || "?")
    .split(" ").filter(Boolean)
    .map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function formatDuration(minutes) {
  if (minutes === null || minutes === undefined || minutes < 0) return "Active";
  if (minutes === 0) return "0 min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

function toISODate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function accentFor(empId = "", index = 0) {
  if (!empId) return ACCENT_COLORS[index % ACCENT_COLORS.length];
  let hash = 0;
  for (let i = 0; i < empId.length; i++) {
    hash = empId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
}

function convertTo12Hr(time24) {
  if (!time24 || time24 === "—") return "—";
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${minute} ${ampm}`;
}

export default function AdminAttendanceScreen({ onBack }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today.getDate());

  const [todayRecords, setTodayRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form, setForm] = useState({ name: "", checkIn: "", checkOut: "" });

  const fetchAttendance = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setFetchError(null);

    const dateStr = toISODate(viewYear, viewMonth, selectedDate);
    try {
      const res = await fetch(`${BASE_URL}/api/attendance?date=${dateStr}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      // Merge check-in + check-out into one record per employee per day
      const mergeMap = {};
      if (Array.isArray(data)) {
        data.forEach((rec, idx) => {
          const key = `${rec.empId}_${rec.date}`;
          if (!mergeMap[key]) {
            mergeMap[key] = {
              name: rec.employeeName || rec.empId || "Unknown",
              empId: rec.empId || "",
              checkIn: rec.checkIn ? convertTo12Hr(rec.checkIn) : "—",
              checkOut: rec.checkOut ? convertTo12Hr(rec.checkOut) : "—",
              status: rec.status || "Active",
              color: accentFor(rec.empId, idx),
              duration: formatDuration(rec.durationMinutes),
            };
          } else {
            const ex = mergeMap[key];
            if (ex.checkIn === "—" && rec.checkIn) ex.checkIn = convertTo12Hr(rec.checkIn);
            if (ex.checkOut === "—" && rec.checkOut) ex.checkOut = convertTo12Hr(rec.checkOut);
            if (rec.checkOut) ex.status = "Present";
            if (rec.durationMinutes && rec.durationMinutes > 0)
              ex.duration = formatDuration(rec.durationMinutes);
          }
        });
      }
      setTodayRecords(Object.values(mergeMap));
    } catch (err) {
      console.error("[AdminAttendance] fetch error:", err.message);
      setFetchError(err.message || "Failed to load attendance");
      setTodayRecords([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [viewYear, viewMonth, selectedDate]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
    setSelectedDate(1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
    setSelectedDate(1);
  };

  // Manual add — local only (for override/testing scenarios)
  const handleAdd = () => {
    if (!form.name.trim()) return;
    const newEntry = {
      name: form.name.trim(),
      checkIn: form.checkIn.trim() || "—",
      checkOut: form.checkOut.trim() || "—",
      color: ACCENT_COLORS[todayRecords.length % ACCENT_COLORS.length],
      empId: "",
      status: "Present",
      duration: "—",
    };
    setTodayRecords((prev) => [...prev, newEntry]);
    setForm({ name: "", checkIn: "", checkOut: "" });
    setAddModalVisible(false);
  };

  const isPresent = (emp) => emp.checkIn !== "—";

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.darkBrown} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backArrow}>‹</Text>
            <Text style={styles.backLabel}>Admin</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Attendance</Text>
          <TouchableOpacity
            style={styles.addEntryBtn}
            onPress={() => setAddModalVisible(true)}
          >
            <Text style={{ color: C.orange, fontSize: 22 }}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Month Navigation */}
        <View style={styles.calNav}>
          <TouchableOpacity onPress={prevMonth}>
            <Text style={styles.calNavArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.calNavTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
          <TouchableOpacity onPress={nextMonth}>
            <Text style={styles.calNavArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Date Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateScroll}
        >
          {Array.from(
            { length: getDaysInMonth(viewYear, viewMonth) },
            (_, i) => i + 1
          ).map((day) => {
            const isSelected = selectedDate === day;
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dateItem, isSelected && styles.dateItemSelected]}
                onPress={() => setSelectedDate(day)}
              >
                <Text style={[styles.dateDay, isSelected && styles.dateDaySelected]}>
                  {DAYS_SHORT[new Date(viewYear, viewMonth, day).getDay()]}
                </Text>
                <Text style={[styles.dateNumber, isSelected && styles.dateNumberSelected]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Body */}
      <ScrollView
        style={styles.body}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAttendance(true)}
            tintColor={C.orange}
            colors={[C.orange]}
          />
        }
      >
        <View style={styles.dateCard}>
          <Text style={styles.dateCardText}>
            {MONTHS[viewMonth]} {selectedDate}, {viewYear}
          </Text>
          {!loading && todayRecords.length > 0 && (
            <Text style={styles.recordCount}>
              {todayRecords.length} record{todayRecords.length !== 1 ? "s" : ""}
            </Text>
          )}
        </View>

        {loading && (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={C.orange} />
            <Text style={[styles.emptySubText, { marginTop: 12 }]}>
              Loading attendance…
            </Text>
          </View>
        )}

        {!loading && fetchError && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={styles.emptyText}>Could not load records</Text>
            <Text style={styles.emptySubText}>{fetchError}</Text>
            <TouchableOpacity onPress={() => fetchAttendance()} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !fetchError && todayRecords.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No attendance records</Text>
            <Text style={styles.emptySubText}>
              Records appear here when employees check in.
            </Text>
          </View>
        )}

        {/* Employee Rows — PROJECT B improved UI */}
        {!loading && !fetchError &&
          todayRecords.map((emp, i) => (
            <View key={i} style={styles.empRow}>
              <View style={[styles.avatar, { backgroundColor: emp.color }]}>
                <Text style={styles.avatarText}>{initials(emp.name)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.empName}>{emp.name}</Text>
                <View style={styles.timePillRow}>
                  <View style={styles.pillIn}>
                    <View style={[styles.dot, { backgroundColor: "#1D9E75" }]} />
                    <Text style={styles.pillLabelIn}>In</Text>
                    <Text style={styles.pillTextIn}>{emp.checkIn}</Text>
                  </View>
                  <View style={styles.pillOut}>
                    <View style={[styles.dot, { backgroundColor: "#D85A30" }]} />
                    <Text style={styles.pillLabelOut}>Out</Text>
                    <Text style={styles.pillTextOut}>{emp.checkOut}</Text>
                  </View>
                  {emp.duration && emp.duration !== "—" && (
                    <View style={styles.pillDuration}>
                      <Text style={styles.pillTextDuration}>⏱ {emp.duration}</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={[
                styles.statusBadge,
                isPresent(emp) ? styles.badgePresent : styles.badgeAbsent,
              ]}>
                <Text style={[
                  styles.statusText,
                  isPresent(emp) ? styles.statusTextPresent : styles.statusTextAbsent,
                ]}>
                  {emp.status === "Active" ? "Active" : isPresent(emp) ? "Present" : "Absent"}
                </Text>
              </View>
            </View>
          ))
        }
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Log Attendance</Text>
            <Text style={styles.fieldLabel}>Employee Name</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. Arjun Kumar"
              placeholderTextColor={C.muted}
              value={form.name}
              onChangeText={(val) => setForm((p) => ({ ...p, name: val }))}
            />
            <Text style={styles.fieldLabel}>Check-In Time</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. 09:30 AM"
              placeholderTextColor={C.muted}
              value={form.checkIn}
              onChangeText={(val) => setForm((p) => ({ ...p, checkIn: val }))}
            />
            <Text style={styles.fieldLabel}>Check-Out Time</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="e.g. 06:00 PM"
              placeholderTextColor={C.muted}
              value={form.checkOut}
              onChangeText={(val) => setForm((p) => ({ ...p, checkOut: val }))}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setForm({ name: "", checkIn: "", checkOut: "" }); setAddModalVisible(false); }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f1e30" },
  header: { backgroundColor: "#0f1e30", paddingBottom: 12, paddingTop: 29 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  backBtn: { flexDirection: "row", alignItems: "center" },
  backArrow: { color: C.orange, fontSize: 24 },
  backLabel: { color: C.orange, marginLeft: 4 },
  headerTitle: { color: C.text, fontSize: 20, fontWeight: "700" },
  addEntryBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: C.orange, alignItems: "center", justifyContent: "center" },
  calNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, marginBottom: 12 },
  calNavArrow: { color: C.orange, fontSize: 24 },
  calNavTitle: { color: C.text, fontWeight: "700" },
  dateScroll: { paddingHorizontal: 12 },
  dateItem: { width: 60, height: 72, borderRadius: 16, backgroundColor: "#1a3a5c", marginRight: 10, alignItems: "center", justifyContent: "center" },
  dateItemSelected: { backgroundColor: C.orange },
  dateDay: { color: C.muted, fontSize: 12 },
  dateDaySelected: { color: "#FFF" },
  dateNumber: { color: C.text, fontSize: 20, fontWeight: "700" },
  dateNumberSelected: { color: "#FFF" },
  body: { flex: 1, backgroundColor: C.cardBg },
  dateCard: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateCardText: { fontWeight: "700", fontSize: 15, color: C.textDark },
  recordCount: { fontSize: 13, color: C.orange, fontWeight: "600" },
  emptyState: { alignItems: "center", marginTop: 60, gap: 6, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#444" },
  emptySubText: { fontSize: 13, color: "#999", textAlign: "center", lineHeight: 20 },
  retryBtn: { marginTop: 14, backgroundColor: C.orange, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
  retryBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  empRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", marginHorizontal: 12, marginTop: 10, padding: 14, borderRadius: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  empName: { fontWeight: "700", fontSize: 14, color: "#1a1a1a", marginBottom: 6 },
  timePillRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  pillIn: { flexDirection: "row", alignItems: "center", backgroundColor: "#E1F5EE", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 5 },
  pillOut: { flexDirection: "row", alignItems: "center", backgroundColor: "#FAECE7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 5 },
  pillDuration: { flexDirection: "row", alignItems: "center", backgroundColor: "#EFF6FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pillTextDuration: { fontSize: 11, fontWeight: "600", color: C.orange },
  dot: { width: 6, height: 6, borderRadius: 3 },
  pillLabelIn: { fontSize: 11, fontWeight: "700", color: "#0F6E56", textTransform: "uppercase", letterSpacing: 0.4 },
  pillLabelOut: { fontSize: 11, fontWeight: "700", color: "#993C1D", textTransform: "uppercase", letterSpacing: 0.4 },
  pillTextIn: { fontSize: 12, fontWeight: "600", color: "#0F6E56" },
  pillTextOut: { fontSize: 12, fontWeight: "600", color: "#993C1D" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: "center", flexShrink: 0 },
  badgePresent: { backgroundColor: "#E1F5EE" },
  badgeAbsent: { backgroundColor: "#F1EFE8" },
  statusText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  statusTextPresent: { color: "#0F6E56" },
  statusTextAbsent: { color: "#5F5E5A" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" },
  modalSheet: { backgroundColor: "#0f1e30", padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.orange, alignSelf: "center", marginBottom: 18 },
  sheetTitle: { color: "#FFF", fontSize: 18, fontWeight: "700", marginBottom: 20 },
  fieldLabel: { color: "#7A9BB5", fontSize: 12, fontWeight: "600", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  fieldInput: { backgroundColor: "#0f2035", color: "#FFF", padding: 14, borderRadius: 12, marginBottom: 16, fontSize: 15, borderWidth: 1, borderColor: "#1a3a5c" },
  modalBtnRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: C.orange },
  cancelBtnText: { color: C.orange, fontWeight: "700" },
  saveBtn: { flex: 2, backgroundColor: C.orange, padding: 14, borderRadius: 12, alignItems: "center" },
  saveBtnText: { color: "#FFF", fontWeight: "700" },
});