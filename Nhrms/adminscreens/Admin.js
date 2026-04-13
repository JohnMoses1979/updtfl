// import React, { useEffect, useMemo, useState } from "react";
// import {
//   View, Text, TouchableOpacity, StyleSheet, ScrollView,
//   TextInput, SafeAreaView, StatusBar, Modal, KeyboardAvoidingView, Platform,
//   Image, ActivityIndicator,
// } from "react-native";
// import { messageApi } from "../api/messageApi";

// // ── Base URL (match your existing api/config.js) ──────────────────
// import { BASE_URL } from "../api/config"; // adjust path if needed

// const C = {
//   bg: '#112235', card: '#0f1e30', orange: '#3B82F6',
//   text: "#F0EDE8", muted: "#7A7570", border: '#1a3a5c', red: "#FF4D6D",
// };

// const TILES = [
//   { key: "employees", label: "Employee\nManagement", emoji: "👥", accent: "#4D6FFF" },
//   { key: "attendance", label: "ATTENDANCE", emoji: "📅", accent: "#2F6E8E" },
//   { key: "tasks", label: "Tasks", emoji: "⏱️", accent: "#2DD4A0" },
//   { key: "performance", label: "PERFORMANCE", emoji: "🏆", accent: "#FFB830" },
//   { key: "leave", label: "LEAVE", emoji: "🗓️", accent: "#4D9EFF" },
//   { key: "payroll", label: "Payrolls", emoji: "💼", accent: "#FFB830" },
// ];

// function getInitials(name = "") {
//   const parts = name.trim().split(" ").filter(Boolean);
//   if (!parts.length) return "A";
//   if (parts.length === 1) return parts[0][0]?.toUpperCase() || "A";
//   return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
// }

// // ── Month name helper ─────────────────────────────────────────────
// function getCurrentMonthName() {
//   return new Date().toLocaleString("default", { month: "long" });
// }

// function getCurrentMonthYear() {
//   const now = new Date();
//   return `${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`;
// }

// // ── Format payroll amount ─────────────────────────────────────────
// function formatPayroll(amount) {
//   if (!amount || amount === 0) return "₹0";
//   if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
//   if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
//   return `₹${Math.round(amount)}`;
// }

// export default function Admin({ onNavigate, profile = {} }) {
//   // ── Message modal state ───────────────────────────────────────
//   const [msgModalVisible, setMsgModalVisible] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [message, setMessage] = useState("");
//   const [customName, setCustomName] = useState("");
//   const [useCustom, setUseCustom] = useState(false);
//   const [employees, setEmployees] = useState([]);
//   const [loadingEmployees, setLoadingEmployees] = useState(false);
//   const [sending, setSending] = useState(false);

//   // ── Dashboard state ───────────────────────────────────────────
//   const [dashLoading, setDashLoading] = useState(true);
//   const [dashData, setDashData] = useState({
//     totalEmployees: 0,
//     presentToday: 0,
//     onLeave: 0,
//     pendingLeave: 0,
//     payrollAmount: 0,
//     payrollProcessed: false,
//   });

//   const displayName =
//     profile?.name ||
//     `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
//     "Admin";

//   // ── Fetch dashboard data from backend ────────────────────────
//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     setDashLoading(true);
//     try {
//       // Run all fetches in parallel
//       const [employeesRes, attendanceRes, leaveRes, payrollRes] = await Promise.allSettled([
//         fetch(`${BASE_URL}/api/employees`),
//         fetch(`${BASE_URL}/api/attendance?date=${new Date().toISOString().split("T")[0]}`),
//         fetch(`${BASE_URL}/api/leave/admin/all`),
//         fetch(`${BASE_URL}/api/payroll/admin/monthly`),
//       ]);

//       // ── Total employees ─────────────────────────────────────
//       let totalEmployees = 0;
//       if (employeesRes.status === "fulfilled" && employeesRes.value.ok) {
//         const empData = await employeesRes.value.json();
//         totalEmployees = Array.isArray(empData) ? empData.length : 0;
//       }

//       // ── Present today ───────────────────────────────────────
//       let presentToday = 0;
//       if (attendanceRes.status === "fulfilled" && attendanceRes.value.ok) {
//         const attData = await attendanceRes.value.json();
//         presentToday = Array.isArray(attData) ? attData.length : 0;
//       }

//       // ── On leave & pending ──────────────────────────────────
//       let onLeave = 0;
//       let pendingLeave = 0;
//       if (leaveRes.status === "fulfilled" && leaveRes.value.ok) {
//         const leaveData = await leaveRes.value.json();
//         if (Array.isArray(leaveData)) {
//           const today = new Date().toISOString().split("T")[0];
//           onLeave = leaveData.filter((l) => {
//             const isActive =
//               l.startDate <= today && l.endDate >= today;
//             return isActive && l.status === "APPROVED";
//           }).length;
//           pendingLeave = leaveData.filter((l) => l.status === "REVIEW").length;
//         }
//       }

//       // ── Payroll ─────────────────────────────────────────────
//       let payrollAmount = 0;
//       let payrollProcessed = false;
//       if (payrollRes.status === "fulfilled" && payrollRes.value.ok) {
//         const payrollData = await payrollRes.value.json();
//         if (Array.isArray(payrollData) && payrollData.length > 0) {
//           payrollAmount = payrollData.reduce(
//             (sum, emp) => sum + (emp.earnedSalary || 0), 0
//           );
//           payrollProcessed = payrollData.some((emp) => emp.earnedSalary > 0);
//         }
//       }

//       setDashData({
//         totalEmployees,
//         presentToday,
//         onLeave,
//         pendingLeave,
//         payrollAmount,
//         payrollProcessed,
//       });
//     } catch (e) {
//       console.log("DASHBOARD FETCH ERROR:", e.message);
//     } finally {
//       setDashLoading(false);
//     }
//   };

//   // ── Attendance % badge ────────────────────────────────────────
//   const attendancePercent =
//     dashData.totalEmployees > 0
//       ? Math.round((dashData.presentToday / dashData.totalEmployees) * 100)
//       : 0;

//   // ── Message modal helpers ─────────────────────────────────────
//   const closeModal = () => {
//     setMsgModalVisible(false);
//     setDropdownOpen(false);
//     setUseCustom(false);
//     setCustomName("");
//     setSelectedEmployee(null);
//     setMessage("");
//   };

//   const normalizeEmployees = (data) => {
//     if (!Array.isArray(data)) return [];
//     return data.map((emp) => ({
//       id: emp.id,
//       employeeId: emp.employeeId,
//       name: emp.name || emp.fullName || "",
//       email: emp.email || "",
//       role: emp.role || "",
//       designation: emp.designation || "",
//       salary: emp.salary || "",
//       joinDate: emp.joinDate || "",
//     }));
//   };

//   const loadEmployees = async (keyword = "") => {
//     try {
//       setLoadingEmployees(true);
//       const data = await messageApi.getEmployees(keyword);
//       setEmployees(normalizeEmployees(data));
//     } catch (e) {
//       console.log("EMPLOYEE LOAD ERROR:", e.message);
//       setEmployees([]);
//     } finally {
//       setLoadingEmployees(false);
//     }
//   };

//   useEffect(() => {
//     if (msgModalVisible) {
//       loadEmployees("");
//     }
//   }, [msgModalVisible]);

//   useEffect(() => {
//     if (useCustom) {
//       loadEmployees(customName);
//     }
//   }, [customName, useCustom]);

//   const filteredTypeSuggestions = useMemo(() => {
//     if (!useCustom) return [];
//     if (!customName.trim()) return employees.slice(0, 8);
//     return employees.slice(0, 8);
//   }, [employees, customName, useCustom]);

//   const recipient = selectedEmployee;
//   const canSend = !!recipient?.employeeId && !!message.trim();

//   const handleSend = async () => {
//     if (!canSend) return;
//     try {
//       setSending(true);
//       await messageApi.sendMessage({
//         employeeId: recipient.employeeId,
//         message: message.trim(),
//       });
//       closeModal();
//     } catch (e) {
//       console.log("SEND MESSAGE ERROR:", e.message);
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle="light-content" backgroundColor={C.bg} />
//       <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>

//         {/* ── Top Bar ── */}
//         <View style={styles.topBar}>
//           <TouchableOpacity
//             style={styles.avatarRow}
//             activeOpacity={0.8}
//             onPress={() => onNavigate && onNavigate("profile")}
//           >
//             <View style={styles.avatar}>
//               {profile?.avatarUri ? (
//                 <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
//               ) : (
//                 <Text style={styles.avatarEmoji}>{getInitials(displayName)}</Text>
//               )}
//             </View>
//             <Text style={styles.adminTitle}>{displayName}</Text>
//           </TouchableOpacity>

//           <View style={styles.iconRow}>
//             <View style={styles.bellWrap}>
//               <TouchableOpacity style={styles.iconBtn}>
//                 <Text style={styles.iconText}>🔔</Text>
//               </TouchableOpacity>
//               <View style={styles.notifDot} />
//             </View>
//           </View>
//         </View>

//         {/* ── Dashboard Card ── */}
//         <View style={styles.dashCard}>
//           <View style={styles.dashCardHeader}>
//             <View>
//               <Text style={styles.dashCardTitle}>Dashboard</Text>
//               <Text style={styles.dashCardSub}>{getCurrentMonthYear()} overview</Text>
//             </View>
//             <TouchableOpacity
//               style={styles.refreshBtn}
//               onPress={fetchDashboardData}
//               activeOpacity={0.7}
//             >
//               <Text style={styles.refreshBtnText}>{dashLoading ? "⏳" : "🔄"}</Text>
//             </TouchableOpacity>
//           </View>

//           {dashLoading ? (
//             <View style={styles.dashLoadingWrap}>
//               <ActivityIndicator color="#2F6E8E" size="small" />
//               <Text style={styles.dashLoadingText}>Loading metrics...</Text>
//             </View>
//           ) : (
//             <View style={styles.metricsRow}>

//               {/* Total Employees */}
//               <View style={styles.metricBox}>
//                 <Text style={styles.metricBoxLabel}>Total{"\n"}Employees</Text>
//                 <Text style={styles.metricBoxVal}>{dashData.totalEmployees}</Text>
//                 <View style={styles.badgeBlue}>
//                   <Text style={styles.badgeBlueText}>Registered</Text>
//                 </View>
//               </View>

//               {/* Present Today */}
//               <View style={styles.metricBox}>
//                 <Text style={styles.metricBoxLabel}>Present Today</Text>
//                 <Text style={styles.metricBoxVal}>{dashData.presentToday}</Text>
//                 <View style={styles.badgeBlue}>
//                   <Text style={styles.badgeBlueText}>
//                     {attendancePercent}% attendance
//                   </Text>
//                 </View>
//               </View>

//               {/* On Leave */}
//               <View style={styles.metricBox}>
//                 <Text style={styles.metricBoxLabel}>On Leave</Text>
//                 <Text style={styles.metricBoxVal}>{dashData.onLeave}</Text>
//                 <View style={styles.badgeOrange}>
//                   <Text style={styles.badgeOrangeText}>
//                     Pending: {dashData.pendingLeave}
//                   </Text>
//                 </View>
//               </View>

//               {/* Payroll */}
//               <View style={styles.metricBox}>
//                 <Text style={styles.metricBoxLabel}>
//                   Payroll ({getCurrentMonthName().substring(0, 3)})
//                 </Text>
//                 <Text style={styles.metricBoxVal}>
//                   {formatPayroll(dashData.payrollAmount)}
//                 </Text>
//                 <View style={dashData.payrollProcessed ? styles.badgeGreen : styles.badgeOrange}>
//                   <Text style={dashData.payrollProcessed ? styles.badgeGreenText : styles.badgeOrangeText}>
//                     {dashData.payrollProcessed ? "Processed" : "Pending"}
//                   </Text>
//                 </View>
//               </View>

//             </View>
//           )}
//         </View>

//         {/* ── Tile Grid ── */}
//         <View style={styles.grid}>
//           {TILES.map((tile) => (
//             <TouchableOpacity
//               key={tile.key}
//               style={styles.tile}
//               activeOpacity={0.8}
//               onPress={() => onNavigate && onNavigate(tile.key)}
//             >
//               <Text style={styles.tileEmoji}>{tile.emoji}</Text>
//               <Text style={[styles.tileLabel, { color: tile.accent }]}>{tile.label}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* ── Message Button ── */}
//         <TouchableOpacity
//           style={styles.msgBtn}
//           activeOpacity={0.85}
//           onPress={() => setMsgModalVisible(true)}
//         >
//           <Text style={styles.msgBtnText}>Message to Individual</Text>
//         </TouchableOpacity>

//         <View style={{ height: 32 }} />
//       </ScrollView>

//       {/* ── Send Message Modal ── */}
//       <Modal visible={msgModalVisible} transparent animationType="slide" onRequestClose={closeModal}>
//         <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
//           <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeModal} />
//           <View style={styles.modalSheet}>
//             <View style={styles.sheetHandle} />
//             <Text style={styles.sheetTitle}>Send Message</Text>
//             <Text style={styles.sheetSubtitle}>Send a direct message to an employee</Text>

//             <View style={styles.toggleRow}>
//               <TouchableOpacity
//                 style={[styles.toggleBtn, !useCustom && styles.toggleBtnActive]}
//                 onPress={() => {
//                   setUseCustom(false);
//                   setCustomName("");
//                   setSelectedEmployee(null);
//                   loadEmployees("");
//                 }}
//               >
//                 <Text style={[styles.toggleBtnText, !useCustom && styles.toggleBtnTextActive]}>Select</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.toggleBtn, useCustom && styles.toggleBtnActive]}
//                 onPress={() => {
//                   setUseCustom(true);
//                   setSelectedEmployee(null);
//                   setDropdownOpen(false);
//                 }}
//               >
//                 <Text style={[styles.toggleBtnText, useCustom && styles.toggleBtnTextActive]}>Type Name</Text>
//               </TouchableOpacity>
//             </View>

//             <Text style={styles.fieldLabel}>Employee Name</Text>

//             {useCustom ? (
//               <>
//                 <TextInput
//                   style={styles.fieldInput}
//                   placeholder="Type employee name..."
//                   placeholderTextColor={C.muted}
//                   value={customName}
//                   onChangeText={setCustomName}
//                 />
//                 <View style={styles.dropdownList}>
//                   {filteredTypeSuggestions.length === 0 ? (
//                     <View style={styles.dropdownEmpty}>
//                       <Text style={styles.dropdownEmptyText}>
//                         {loadingEmployees ? "Loading employees..." : "No employee found"}
//                       </Text>
//                     </View>
//                   ) : (
//                     filteredTypeSuggestions.map((emp) => (
//                       <TouchableOpacity
//                         key={emp.employeeId}
//                         style={[
//                           styles.dropdownItem,
//                           selectedEmployee?.employeeId === emp.employeeId && styles.dropdownItemActive,
//                         ]}
//                         onPress={() => {
//                           setSelectedEmployee(emp);
//                           setCustomName(emp.name);
//                         }}
//                       >
//                         <Text style={[
//                           styles.dropdownItemText,
//                           selectedEmployee?.employeeId === emp.employeeId && { color: "#2F6E8E" },
//                         ]}>
//                           {emp.name} ({emp.employeeId})
//                         </Text>
//                         {selectedEmployee?.employeeId === emp.employeeId && (
//                           <Text style={{ color: "#2F6E8E" }}>✓</Text>
//                         )}
//                       </TouchableOpacity>
//                     ))
//                   )}
//                 </View>
//               </>
//             ) : (
//               <>
//                 <TouchableOpacity
//                   style={styles.dropdown}
//                   onPress={() => setDropdownOpen(!dropdownOpen)}
//                   activeOpacity={0.8}
//                 >
//                   <Text style={[styles.dropdownText, !selectedEmployee && { color: C.muted }]}>
//                     {selectedEmployee
//                       ? `${selectedEmployee.name} (${selectedEmployee.employeeId})`
//                       : "Select employee..."}
//                   </Text>
//                   <Text style={{ color: C.muted, fontSize: 12 }}>{dropdownOpen ? "▲" : "▼"}</Text>
//                 </TouchableOpacity>

//                 {dropdownOpen && (
//                   <View style={styles.dropdownList}>
//                     {employees.length === 0 ? (
//                       <View style={styles.dropdownEmpty}>
//                         <Text style={styles.dropdownEmptyText}>
//                           {loadingEmployees ? "Loading employees..." : "No employees added yet"}
//                         </Text>
//                       </View>
//                     ) : (
//                       employees.map((emp) => (
//                         <TouchableOpacity
//                           key={emp.employeeId}
//                           style={[
//                             styles.dropdownItem,
//                             selectedEmployee?.employeeId === emp.employeeId && styles.dropdownItemActive,
//                           ]}
//                           onPress={() => {
//                             setSelectedEmployee(emp);
//                             setDropdownOpen(false);
//                           }}
//                         >
//                           <Text style={[
//                             styles.dropdownItemText,
//                             selectedEmployee?.employeeId === emp.employeeId && { color: "#2F6E8E" },
//                           ]}>
//                             {emp.name} ({emp.employeeId})
//                           </Text>
//                           {selectedEmployee?.employeeId === emp.employeeId && (
//                             <Text style={{ color: "#2F6E8E" }}>✓</Text>
//                           )}
//                         </TouchableOpacity>
//                       ))
//                     )}
//                   </View>
//                 )}
//               </>
//             )}

//             <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Message</Text>
//             <TextInput
//               style={styles.messageInput}
//               placeholder="Type your message here..."
//               placeholderTextColor={C.muted}
//               value={message}
//               onChangeText={setMessage}
//               multiline
//               numberOfLines={4}
//               textAlignVertical="top"
//             />

//             <View style={styles.modalActions}>
//               <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
//                 <Text style={styles.cancelBtnText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.sendBtn, (!canSend || sending) && styles.sendBtnDisabled]}
//                 onPress={handleSend}
//                 activeOpacity={0.85}
//                 disabled={!canSend || sending}
//               >
//                 <Text style={styles.sendBtnText}>{sending ? "Sending..." : "Send Message"}</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: C.bg },
//   root: { flex: 1, backgroundColor: C.bg },

//   // ── Top bar ──
//   topBar: {
//     flexDirection: "row", alignItems: "center",
//     justifyContent: "space-between", padding: 20, paddingBottom: 14,
//   },
//   avatarRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 29 },
//   avatar: {
//     width: 44, height: 44, borderRadius: 22,
//     backgroundColor: "#1a3a5c", borderWidth: 2, borderColor: "#2F6E8E",
//     alignItems: "center", justifyContent: "center", overflow: "hidden",
//   },
//   avatarImage: { width: "100%", height: "100%" },
//   avatarEmoji: { fontSize: 22, color: "#fff", fontWeight: "800" },
//   adminTitle: { fontSize: 24, fontWeight: "800", color: C.text, letterSpacing: -0.5 },
//   iconRow: { flexDirection: "row", alignItems: "center", gap: 14 },
//   iconBtn: { padding: 4, paddingTop: 29 },
//   iconText: { fontSize: 20 },
//   bellWrap: { position: "relative" },
//   notifDot: {
//     position: "absolute", top: 29, right: 10,
//     width: 8, height: 8, borderRadius: 4,
//     backgroundColor: C.red, borderWidth: 1.5, borderColor: C.bg,
//   },

//   // ── Dashboard card ──
//   dashCard: {
//     marginHorizontal: 16, marginBottom: 16,
//     backgroundColor: "#0f1e30", borderRadius: 16,
//     padding: 16, borderWidth: 1, borderColor: "#1a3a5c",
//   },
//   dashCardHeader: {
//     flexDirection: "row", justifyContent: "space-between",
//     alignItems: "flex-start", marginBottom: 16,
//   },
//   dashCardTitle: { fontSize: 18, fontWeight: "800", color: C.text },
//   dashCardSub: { fontSize: 12, color: C.muted, marginTop: 2 },
//   refreshBtn: {
//     backgroundColor: "#1a3a5c", borderRadius: 8,
//     paddingHorizontal: 10, paddingVertical: 6,
//   },
//   refreshBtnText: { fontSize: 16 },
//   dashLoadingWrap: {
//     flexDirection: "row", alignItems: "center",
//     justifyContent: "center", gap: 10, paddingVertical: 20,
//   },
//   dashLoadingText: { color: C.muted, fontSize: 13 },

//   metricsRow: {
//     flexDirection: "row", flexWrap: "wrap", gap: 10,
//   },
//   metricBox: {
//     width: "47%", backgroundColor: "#FFFFFF",
//     borderRadius: 12, padding: 12, gap: 4,
//   },
//   metricBoxLabel: {
//     fontSize: 11, fontWeight: "600", color: "#666",
//     textTransform: "uppercase", letterSpacing: 0.3,
//   },
//   metricBoxVal: {
//     fontSize: 26, fontWeight: "800", color: "#112235",
//   },

//   // ── Metric badges ──
//   badgeBlue: {
//     backgroundColor: "#EEF4FF", borderRadius: 6,
//     paddingHorizontal: 8, paddingVertical: 3,
//     alignSelf: "flex-start",
//   },
//   badgeBlueText: { fontSize: 10, fontWeight: "700", color: "#2F6E8E" },
//   badgeOrange: {
//     backgroundColor: "#FFF8EE", borderRadius: 6,
//     paddingHorizontal: 8, paddingVertical: 3,
//     alignSelf: "flex-start",
//   },
//   badgeOrangeText: { fontSize: 10, fontWeight: "700", color: "#D97706" },
//   badgeGreen: {
//     backgroundColor: "#EEFFF4", borderRadius: 6,
//     paddingHorizontal: 8, paddingVertical: 3,
//     alignSelf: "flex-start",
//   },
//   badgeGreenText: { fontSize: 10, fontWeight: "700", color: "#16A34A" },

//   // ── Tile grid ──
//   grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 12 },
//   tile: {
//     width: "47%", backgroundColor: "#FFFFFF", borderRadius: 14,
//     paddingVertical: 20, paddingHorizontal: 14,
//     alignItems: "center", gap: 10,
//     shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
//   },
//   tileEmoji: { fontSize: 36 },
//   tileLabel: { fontSize: 12, fontWeight: "700", textAlign: "center", letterSpacing: 0.3 },

//   // ── Message button ──
//   msgBtn: {
//     marginHorizontal: 16, marginTop: 20, backgroundColor: "#2F6E8E",
//     borderRadius: 14, paddingVertical: 15, alignItems: "center",
//     shadowColor: "#2F6E8E", shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
//   },
//   msgBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },

//   // ── Modal ──
//   modalOverlay: { flex: 1, justifyContent: "flex-end" },
//   modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
//   modalSheet: {
//     backgroundColor: "#0f1e30", borderTopLeftRadius: 24,
//     borderTopRightRadius: 24, padding: 24, paddingBottom: 36,
//   },
//   sheetHandle: {
//     width: 40, height: 4, borderRadius: 2,
//     backgroundColor: "#1a3a5c", alignSelf: "center", marginBottom: 20,
//   },
//   sheetTitle: { fontSize: 20, fontWeight: "800", color: C.text, marginBottom: 4 },
//   sheetSubtitle: { fontSize: 13, color: C.muted, marginBottom: 16 },
//   toggleRow: {
//     flexDirection: "row", backgroundColor: "#0f2035",
//     borderRadius: 10, padding: 3, marginBottom: 16,
//   },
//   toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
//   toggleBtnActive: { backgroundColor: "#2F6E8E" },
//   toggleBtnText: { fontSize: 13, fontWeight: "600", color: C.muted },
//   toggleBtnTextActive: { color: "#FFF" },
//   fieldLabel: {
//     fontSize: 12, fontWeight: "600", color: C.muted,
//     marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5,
//   },
//   fieldInput: {
//     backgroundColor: "#0f2035", borderRadius: 12,
//     borderWidth: 1, borderColor: C.border,
//     paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: C.text,
//   },
//   dropdown: {
//     flexDirection: "row", alignItems: "center", justifyContent: "space-between",
//     backgroundColor: "#0f2035", borderRadius: 12,
//     borderWidth: 1, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 14,
//   },
//   dropdownText: { fontSize: 15, color: C.text },
//   dropdownList: {
//     backgroundColor: "#0f2035", borderRadius: 12,
//     borderWidth: 1, borderColor: C.border, marginTop: 4, overflow: "hidden",
//   },
//   dropdownEmpty: { padding: 16, alignItems: "center", gap: 6 },
//   dropdownEmptyText: { fontSize: 14, color: C.muted, fontWeight: "600" },
//   dropdownItem: {
//     flexDirection: "row", alignItems: "center", justifyContent: "space-between",
//     paddingHorizontal: 16, paddingVertical: 13,
//     borderBottomWidth: 1, borderBottomColor: "#1a3a5c",
//   },
//   dropdownItemActive: { backgroundColor: "#1a3a5c" },
//   dropdownItemText: { fontSize: 15, color: C.text },
//   messageInput: {
//     backgroundColor: "#0f2035", borderRadius: 12,
//     borderWidth: 1, borderColor: C.border,
//     paddingHorizontal: 16, paddingVertical: 14,
//     fontSize: 15, color: C.text, minHeight: 100,
//   },
//   modalActions: { flexDirection: "row", gap: 12, marginTop: 24 },
//   cancelBtn: {
//     flex: 1, paddingVertical: 14, borderRadius: 12,
//     borderWidth: 1, borderColor: C.border, alignItems: "center",
//   },
//   cancelBtnText: { color: C.muted, fontSize: 15, fontWeight: "600" },
//   sendBtn: {
//     flex: 2, paddingVertical: 14, borderRadius: 12,
//     backgroundColor: "#2F6E8E", alignItems: "center",
//   },
//   sendBtnDisabled: { opacity: 0.4 },
//   sendBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
// });












/**
 * adminscreens/Admin.js
 *
 * CHANGES vs original:
 *  • Added "Send to All" toggle in the message modal.
 *    When active, sending dispatches messages to every employee.
 *  • All original UI design, colors, tile grid, dashboard card UNTOUCHED.
 */
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   View, Text, TouchableOpacity, StyleSheet, ScrollView,
//   TextInput, SafeAreaView, StatusBar, Modal, KeyboardAvoidingView,
//   Platform, Image, ActivityIndicator, Alert,
// } from "react-native";
// import { messageApi } from "../api/messageApi";
// import { BASE_URL } from "../api/config";

// const C = {
//   bg: '#112235', card: '#0f1e30', orange: '#3B82F6',
//   text: "#F0EDE8", muted: "#7A7570", border: '#1a3a5c', red: "#FF4D6D",
// };

// const TILES = [
//   { key: "employees", label: "Employee\nManagement", emoji: "👥", accent: "#4D6FFF" },
//   { key: "attendance", label: "ATTENDANCE", emoji: "📅", accent: "#2F6E8E" },
//   { key: "tasks", label: "Tasks", emoji: "⏱️", accent: "#2DD4A0" },
//   { key: "performance", label: "PERFORMANCE", emoji: "🏆", accent: "#FFB830" },
//   { key: "leave", label: "LEAVE", emoji: "🗓️", accent: "#4D9EFF" },
//   { key: "payroll", label: "Payrolls", emoji: "💼", accent: "#FFB830" },
// ];

// function getInitials(name = "") {
//   const parts = name.trim().split(" ").filter(Boolean);
//   if (!parts.length) return "A";
//   if (parts.length === 1) return parts[0][0]?.toUpperCase() || "A";
//   return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
// }

// function getCurrentMonthYear() {
//   const now = new Date();
//   return `${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`;
// }

// function getCurrentMonthName() {
//   return new Date().toLocaleString("default", { month: "long" });
// }

// function formatPayroll(amount) {
//   if (!amount || amount === 0) return "₹0";
//   if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
//   if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
//   return `₹${Math.round(amount)}`;
// }

// export default function Admin({ onNavigate, profile = {} }) {
//   const [msgModalVisible, setMsgModalVisible] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [message, setMessage] = useState("");
//   const [customName, setCustomName] = useState("");
//   const [useCustom, setUseCustom] = useState(false);
//   const [sendToAll, setSendToAll] = useState(false);  // ← NEW
//   const [employees, setEmployees] = useState([]);
//   const [loadingEmployees, setLoadingEmployees] = useState(false);
//   const [sending, setSending] = useState(false);

//   // Dashboard state
//   const [dashLoading, setDashLoading] = useState(true);
//   const [dashData, setDashData] = useState({
//     totalEmployees: 0, presentToday: 0, onLeave: 0,
//     pendingLeave: 0, payrollAmount: 0, payrollProcessed: false,
//   });

//   const displayName =
//     profile?.name ||
//     `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
//     "Admin";

//   useEffect(() => { fetchDashboardData(); }, []);

//   const fetchDashboardData = async () => {
//     setDashLoading(true);
//     try {
//       const [employeesRes, attendanceRes, leaveRes, payrollRes] = await Promise.allSettled([
//         fetch(`${BASE_URL}/api/employees`),
//         fetch(`${BASE_URL}/api/attendance?date=${new Date().toISOString().split("T")[0]}`),
//         fetch(`${BASE_URL}/api/leave/admin/all`),
//         fetch(`${BASE_URL}/api/payroll/admin/monthly`),
//       ]);

//       let totalEmployees = 0;
//       if (employeesRes.status === "fulfilled" && employeesRes.value.ok) {
//         const d = await employeesRes.value.json();
//         totalEmployees = Array.isArray(d) ? d.length : 0;
//       }
//       let presentToday = 0;
//       if (attendanceRes.status === "fulfilled" && attendanceRes.value.ok) {
//         const d = await attendanceRes.value.json();
//         presentToday = Array.isArray(d) ? d.length : 0;
//       }
//       let onLeave = 0, pendingLeave = 0;
//       if (leaveRes.status === "fulfilled" && leaveRes.value.ok) {
//         const d = await leaveRes.value.json();
//         if (Array.isArray(d)) {
//           const today = new Date().toISOString().split("T")[0];
//           onLeave = d.filter((l) => l.startDate <= today && l.endDate >= today && l.status === "APPROVED").length;
//           pendingLeave = d.filter((l) => l.status === "REVIEW").length;
//         }
//       }
//       let payrollAmount = 0, payrollProcessed = false;
//       if (payrollRes.status === "fulfilled" && payrollRes.value.ok) {
//         const d = await payrollRes.value.json();
//         if (Array.isArray(d) && d.length > 0) {
//           payrollAmount = d.reduce((s, e) => s + (e.earnedSalary || 0), 0);
//           payrollProcessed = d.some((e) => e.earnedSalary > 0);
//         }
//       }
//       setDashData({ totalEmployees, presentToday, onLeave, pendingLeave, payrollAmount, payrollProcessed });
//     } catch (e) {
//       console.log("DASHBOARD FETCH ERROR:", e.message);
//     } finally {
//       setDashLoading(false);
//     }
//   };

//   const attendancePercent =
//     dashData.totalEmployees > 0
//       ? Math.round((dashData.presentToday / dashData.totalEmployees) * 100)
//       : 0;

//   const closeModal = () => {
//     setMsgModalVisible(false);
//     setDropdownOpen(false);
//     setUseCustom(false);
//     setSendToAll(false);
//     setCustomName("");
//     setSelectedEmployee(null);
//     setMessage("");
//   };

//   const normalizeEmployees = (data) => {
//     if (!Array.isArray(data)) return [];
//     return data.map((emp) => ({
//       id: emp.id, employeeId: emp.employeeId,
//       name: emp.name || emp.fullName || "",
//       email: emp.email || "", role: emp.role || "",
//       designation: emp.designation || "",
//     }));
//   };

//   const loadEmployees = async (keyword = "") => {
//     try {
//       setLoadingEmployees(true);
//       const data = await messageApi.getEmployees(keyword);
//       setEmployees(normalizeEmployees(data));
//     } catch (e) {
//       console.log("EMPLOYEE LOAD ERROR:", e.message);
//       setEmployees([]);
//     } finally {
//       setLoadingEmployees(false);
//     }
//   };

//   useEffect(() => {
//     if (msgModalVisible) loadEmployees("");
//   }, [msgModalVisible]);

//   useEffect(() => {
//     if (useCustom) loadEmployees(customName);
//   }, [customName, useCustom]);

//   const filteredTypeSuggestions = useMemo(() => {
//     if (!useCustom) return [];
//     return employees.slice(0, 8);
//   }, [employees, customName, useCustom]);

//   const recipient = selectedEmployee;
//   // Can send when: (sendToAll OR a recipient is chosen) AND message is non-empty
//   const canSend = (sendToAll || !!recipient?.employeeId) && !!message.trim();

//   const handleSend = async () => {
//     if (!canSend) return;
//     try {
//       setSending(true);
//       if (sendToAll) {
//         const result = await messageApi.sendMessageToAll(message.trim());
//         closeModal();
//         Alert.alert(
//           "✅ Sent",
//           `Message sent to ${result.sent} employee${result.sent !== 1 ? "s" : ""}` +
//           (result.failed > 0 ? ` (${result.failed} failed)` : ".")
//         );
//       } else {
//         await messageApi.sendMessage({
//           employeeId: recipient.employeeId,
//           message: message.trim(),
//         });
//         closeModal();
//       }
//     } catch (e) {
//       console.log("SEND MESSAGE ERROR:", e.message);
//       Alert.alert("Error", e.message || "Failed to send message");
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle="light-content" backgroundColor={C.bg} />
//       <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>

//         {/* Top Bar */}
//         <View style={styles.topBar}>
//           <TouchableOpacity style={styles.avatarRow} activeOpacity={0.8} onPress={() => onNavigate && onNavigate("profile")}>
//             <View style={styles.avatar}>
//               {profile?.avatarUri ? (
//                 <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
//               ) : (
//                 <Text style={styles.avatarEmoji}>{getInitials(displayName)}</Text>
//               )}
//             </View>
//             <Text style={styles.adminTitle}>{displayName}</Text>
//           </TouchableOpacity>
//           <View style={styles.iconRow}>
//             <View style={styles.bellWrap}>
//               <TouchableOpacity style={styles.iconBtn}><Text style={styles.iconText}>🔔</Text></TouchableOpacity>
//               <View style={styles.notifDot} />
//             </View>
//           </View>
//         </View>

//         {/* Dashboard Card */}
//         <View style={styles.dashCard}>
//           <View style={styles.dashCardHeader}>
//             <View>
//               <Text style={styles.dashCardTitle}>Dashboard</Text>
//               <Text style={styles.dashCardSub}>{getCurrentMonthYear()} overview</Text>
//             </View>
//             <TouchableOpacity style={styles.refreshBtn} onPress={fetchDashboardData} activeOpacity={0.7}>
//               <Text style={styles.refreshBtnText}>{dashLoading ? "⏳" : "🔄"}</Text>
//             </TouchableOpacity>
//           </View>
//           {dashLoading ? (
//             <View style={styles.dashLoadingWrap}>
//               <ActivityIndicator color="#2F6E8E" size="small" />
//               <Text style={styles.dashLoadingText}>Loading metrics...</Text>
//             </View>
//           ) : (
//             <View style={styles.metricsRow}>
//               <View style={styles.metricBox}>
//                 <Text style={styles.metricBoxLabel}>Total{"\n"}Employees</Text>
//                 <Text style={styles.metricBoxVal}>{dashData.totalEmployees}</Text>
//                 <View style={styles.badgeBlue}><Text style={styles.badgeBlueText}>Registered</Text></View>
//               </View>
//               <View style={styles.metricBox}>
//                 <Text style={styles.metricBoxLabel}>Present Today</Text>
//                 <Text style={styles.metricBoxVal}>{dashData.presentToday}</Text>
//                 <View style={styles.badgeBlue}><Text style={styles.badgeBlueText}>{attendancePercent}% attendance</Text></View>
//               </View>
//               <View style={styles.metricBox}>
//                 <Text style={styles.metricBoxLabel}>On Leave</Text>
//                 <Text style={styles.metricBoxVal}>{dashData.onLeave}</Text>
//                 <View style={styles.badgeOrange}><Text style={styles.badgeOrangeText}>Pending: {dashData.pendingLeave}</Text></View>
//               </View>
//               <View style={styles.metricBox}>
//                 <Text style={styles.metricBoxLabel}>Payroll ({getCurrentMonthName().substring(0, 3)})</Text>
//                 <Text style={styles.metricBoxVal}>{formatPayroll(dashData.payrollAmount)}</Text>
//                 <View style={dashData.payrollProcessed ? styles.badgeGreen : styles.badgeOrange}>
//                   <Text style={dashData.payrollProcessed ? styles.badgeGreenText : styles.badgeOrangeText}>
//                     {dashData.payrollProcessed ? "Processed" : "Pending"}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           )}
//         </View>

//         {/* Tile Grid */}
//         <View style={styles.grid}>
//           {TILES.map((tile) => (
//             <TouchableOpacity key={tile.key} style={styles.tile} activeOpacity={0.8} onPress={() => onNavigate && onNavigate(tile.key)}>
//               <Text style={styles.tileEmoji}>{tile.emoji}</Text>
//               <Text style={[styles.tileLabel, { color: tile.accent }]}>{tile.label}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <TouchableOpacity style={styles.msgBtn} activeOpacity={0.85} onPress={() => setMsgModalVisible(true)}>
//           <Text style={styles.msgBtnText}>Message to Individual</Text>
//         </TouchableOpacity>
//         <View style={{ height: 32 }} />
//       </ScrollView>

//       {/* Message Modal */}
//       <Modal visible={msgModalVisible} transparent animationType="slide" onRequestClose={closeModal}>
//         <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
//           <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeModal} />
//           <View style={styles.modalSheet}>
//             <View style={styles.sheetHandle} />
//             <Text style={styles.sheetTitle}>Send Message</Text>
//             <Text style={styles.sheetSubtitle}>Send a direct message to an employee or everyone</Text>

//             {/* ── Send to All toggle ── */}
//             <TouchableOpacity
//               style={[styles.sendAllBtn, sendToAll && styles.sendAllBtnActive]}
//               onPress={() => {
//                 setSendToAll((v) => !v);
//                 if (!sendToAll) {
//                   setSelectedEmployee(null);
//                   setCustomName("");
//                   setUseCustom(false);
//                   setDropdownOpen(false);
//                 }
//               }}
//               activeOpacity={0.8}
//             >
//               <Text style={styles.sendAllIcon}>{sendToAll ? "✓" : "👥"}</Text>
//               <Text style={[styles.sendAllText, sendToAll && styles.sendAllTextActive]}>
//                 {sendToAll ? "Sending to ALL employees" : "Send to All Employees"}
//               </Text>
//             </TouchableOpacity>

//             {/* ── Individual selector (hidden when sendToAll) ── */}
//             {!sendToAll && (
//               <>
//                 <View style={styles.toggleRow}>
//                   <TouchableOpacity
//                     style={[styles.toggleBtn, !useCustom && styles.toggleBtnActive]}
//                     onPress={() => { setUseCustom(false); setCustomName(""); setSelectedEmployee(null); loadEmployees(""); }}
//                   >
//                     <Text style={[styles.toggleBtnText, !useCustom && styles.toggleBtnTextActive]}>Select</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={[styles.toggleBtn, useCustom && styles.toggleBtnActive]}
//                     onPress={() => { setUseCustom(true); setSelectedEmployee(null); setDropdownOpen(false); }}
//                   >
//                     <Text style={[styles.toggleBtnText, useCustom && styles.toggleBtnTextActive]}>Type Name</Text>
//                   </TouchableOpacity>
//                 </View>

//                 <Text style={styles.fieldLabel}>Employee Name</Text>

//                 {useCustom ? (
//                   <>
//                     <TextInput
//                       style={styles.fieldInput} placeholder="Type employee name..."
//                       placeholderTextColor={C.muted} value={customName} onChangeText={setCustomName}
//                     />
//                     <View style={styles.dropdownList}>
//                       {filteredTypeSuggestions.length === 0 ? (
//                         <View style={styles.dropdownEmpty}>
//                           <Text style={styles.dropdownEmptyText}>
//                             {loadingEmployees ? "Loading..." : "No employee found"}
//                           </Text>
//                         </View>
//                       ) : filteredTypeSuggestions.map((emp) => (
//                         <TouchableOpacity
//                           key={emp.employeeId}
//                           style={[styles.dropdownItem, selectedEmployee?.employeeId === emp.employeeId && styles.dropdownItemActive]}
//                           onPress={() => { setSelectedEmployee(emp); setCustomName(emp.name); }}
//                         >
//                           <Text style={[styles.dropdownItemText, selectedEmployee?.employeeId === emp.employeeId && { color: "#2F6E8E" }]}>
//                             {emp.name} ({emp.employeeId})
//                           </Text>
//                           {selectedEmployee?.employeeId === emp.employeeId && <Text style={{ color: "#2F6E8E" }}>✓</Text>}
//                         </TouchableOpacity>
//                       ))}
//                     </View>
//                   </>
//                 ) : (
//                   <>
//                     <TouchableOpacity style={styles.dropdown} onPress={() => setDropdownOpen(!dropdownOpen)} activeOpacity={0.8}>
//                       <Text style={[styles.dropdownText, !selectedEmployee && { color: C.muted }]}>
//                         {selectedEmployee ? `${selectedEmployee.name} (${selectedEmployee.employeeId})` : "Select employee..."}
//                       </Text>
//                       <Text style={{ color: C.muted, fontSize: 12 }}>{dropdownOpen ? "▲" : "▼"}</Text>
//                     </TouchableOpacity>
//                     {dropdownOpen && (
//                       <View style={styles.dropdownList}>
//                         {employees.length === 0 ? (
//                           <View style={styles.dropdownEmpty}>
//                             <Text style={styles.dropdownEmptyText}>
//                               {loadingEmployees ? "Loading..." : "No employees found"}
//                             </Text>
//                           </View>
//                         ) : employees.map((emp) => (
//                           <TouchableOpacity
//                             key={emp.employeeId}
//                             style={[styles.dropdownItem, selectedEmployee?.employeeId === emp.employeeId && styles.dropdownItemActive]}
//                             onPress={() => { setSelectedEmployee(emp); setDropdownOpen(false); }}
//                           >
//                             <Text style={[styles.dropdownItemText, selectedEmployee?.employeeId === emp.employeeId && { color: "#2F6E8E" }]}>
//                               {emp.name} ({emp.employeeId})
//                             </Text>
//                             {selectedEmployee?.employeeId === emp.employeeId && <Text style={{ color: "#2F6E8E" }}>✓</Text>}
//                           </TouchableOpacity>
//                         ))}
//                       </View>
//                     )}
//                   </>
//                 )}
//               </>
//             )}

//             <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Message</Text>
//             <TextInput
//               style={styles.messageInput} placeholder="Type your message here..."
//               placeholderTextColor={C.muted} value={message} onChangeText={setMessage}
//               multiline numberOfLines={4} textAlignVertical="top"
//             />

//             <View style={styles.modalActions}>
//               <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
//                 <Text style={styles.cancelBtnText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.sendBtn, (!canSend || sending) && styles.sendBtnDisabled]}
//                 onPress={handleSend} activeOpacity={0.85} disabled={!canSend || sending}
//               >
//                 <Text style={styles.sendBtnText}>
//                   {sending ? "Sending..." : sendToAll ? "Send to All" : "Send Message"}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: C.bg },
//   root: { flex: 1, backgroundColor: C.bg },
//   topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, paddingBottom: 14 },
//   avatarRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 29 },
//   avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1a3a5c", borderWidth: 2, borderColor: "#2F6E8E", alignItems: "center", justifyContent: "center", overflow: "hidden" },
//   avatarImage: { width: "100%", height: "100%" },
//   avatarEmoji: { fontSize: 22, color: "#fff", fontWeight: "800" },
//   adminTitle: { fontSize: 24, fontWeight: "800", color: C.text, letterSpacing: -0.5 },
//   iconRow: { flexDirection: "row", alignItems: "center", gap: 14 },
//   iconBtn: { padding: 4, paddingTop: 29 },
//   iconText: { fontSize: 20 },
//   bellWrap: { position: "relative" },
//   notifDot: { position: "absolute", top: 29, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: C.red, borderWidth: 1.5, borderColor: C.bg },
//   dashCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: "#0f1e30", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#1a3a5c" },
//   dashCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
//   dashCardTitle: { fontSize: 18, fontWeight: "800", color: C.text },
//   dashCardSub: { fontSize: 12, color: C.muted, marginTop: 2 },
//   refreshBtn: { backgroundColor: "#1a3a5c", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
//   refreshBtnText: { fontSize: 16 },
//   dashLoadingWrap: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 20 },
//   dashLoadingText: { color: C.muted, fontSize: 13 },
//   metricsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
//   metricBox: { width: "47%", backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12, gap: 4 },
//   metricBoxLabel: { fontSize: 11, fontWeight: "600", color: "#666", textTransform: "uppercase", letterSpacing: 0.3 },
//   metricBoxVal: { fontSize: 26, fontWeight: "800", color: "#112235" },
//   badgeBlue: { backgroundColor: "#EEF4FF", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
//   badgeBlueText: { fontSize: 10, fontWeight: "700", color: "#2F6E8E" },
//   badgeOrange: { backgroundColor: "#FFF8EE", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
//   badgeOrangeText: { fontSize: 10, fontWeight: "700", color: "#D97706" },
//   badgeGreen: { backgroundColor: "#EEFFF4", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
//   badgeGreenText: { fontSize: 10, fontWeight: "700", color: "#16A34A" },
//   grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 12 },
//   tile: { width: "47%", backgroundColor: "#FFFFFF", borderRadius: 14, paddingVertical: 20, paddingHorizontal: 14, alignItems: "center", gap: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
//   tileEmoji: { fontSize: 36 },
//   tileLabel: { fontSize: 12, fontWeight: "700", textAlign: "center", letterSpacing: 0.3 },
//   msgBtn: { marginHorizontal: 16, marginTop: 20, backgroundColor: "#2F6E8E", borderRadius: 14, paddingVertical: 15, alignItems: "center", shadowColor: "#2F6E8E", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 },
//   msgBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
//   modalOverlay: { flex: 1, justifyContent: "flex-end" },
//   modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
//   modalSheet: { backgroundColor: "#0f1e30", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
//   sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#1a3a5c", alignSelf: "center", marginBottom: 20 },
//   sheetTitle: { fontSize: 20, fontWeight: "800", color: C.text, marginBottom: 4 },
//   sheetSubtitle: { fontSize: 13, color: C.muted, marginBottom: 12 },

//   // Send-to-All toggle
//   sendAllBtn: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#0f2035", borderRadius: 12, padding: 12, borderWidth: 1.5, borderColor: "#1a3a5c", marginBottom: 14 },
//   sendAllBtnActive: { borderColor: "#2F6E8E", backgroundColor: "rgba(47,110,142,0.15)" },
//   sendAllIcon: { fontSize: 18 },
//   sendAllText: { fontSize: 14, fontWeight: "600", color: C.muted },
//   sendAllTextActive: { color: "#2F6E8E" },

//   toggleRow: { flexDirection: "row", backgroundColor: "#0f2035", borderRadius: 10, padding: 3, marginBottom: 12 },
//   toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
//   toggleBtnActive: { backgroundColor: "#2F6E8E" },
//   toggleBtnText: { fontSize: 13, fontWeight: "600", color: C.muted },
//   toggleBtnTextActive: { color: "#FFF" },
//   fieldLabel: { fontSize: 12, fontWeight: "600", color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
//   fieldInput: { backgroundColor: "#0f2035", borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: C.text },
//   dropdown: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#0f2035", borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 14 },
//   dropdownText: { fontSize: 15, color: C.text },
//   dropdownList: { backgroundColor: "#0f2035", borderRadius: 12, borderWidth: 1, borderColor: C.border, marginTop: 4, overflow: "hidden" },
//   dropdownEmpty: { padding: 16, alignItems: "center" },
//   dropdownEmptyText: { fontSize: 14, color: C.muted, fontWeight: "600" },
//   dropdownItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "#1a3a5c" },
//   dropdownItemActive: { backgroundColor: "#1a3a5c" },
//   dropdownItemText: { fontSize: 15, color: C.text },
//   messageInput: { backgroundColor: "#0f2035", borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: C.text, minHeight: 100 },
//   modalActions: { flexDirection: "row", gap: 12, marginTop: 24 },
//   cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: C.border, alignItems: "center" },
//   cancelBtnText: { color: C.muted, fontSize: 15, fontWeight: "600" },
//   sendBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: "#2F6E8E", alignItems: "center" },
//   sendBtnDisabled: { opacity: 0.4 },
//   sendBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
// });













// /**
//  * adminscreens/Admin.js
//  *
//  * MERGED VERSION:
//  *  - Keeps OLD FILE UI/design/dashboard/message functionality intact
//  *  - Adds notification-based employee signup/auth validation entry from NEW FILE
//  *  - Existing old code behavior preserved
//  */

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   View, Text, TouchableOpacity, StyleSheet, ScrollView,
//   TextInput, SafeAreaView, StatusBar, Modal, KeyboardAvoidingView,
//   Platform, Image, ActivityIndicator, Alert,
// } from "react-native";
// import { notificationApi } from "../api/notificationApi";
// import { messageApi } from "../api/messageApi";
// import { BASE_URL } from "../api/config";

// const C = {
//   bg: '#112235',
//   card: '#0f1e30',
//   orange: '#3B82F6',
//   text: "#F0EDE8",
//   muted: "#7A7570",
//   border: '#1a3a5c',
//   red: "#FF4D6D",
// };

// const TILES = [
//   { key: "employees", label: "Employee\nManagement", emoji: "👥", accent: "#4D6FFF" },
//   { key: "attendance", label: "ATTENDANCE", emoji: "📅", accent: "#2F6E8E" },
//   { key: "tasks", label: "Tasks", emoji: "⏱️", accent: "#2DD4A0" },
//   { key: "performance", label: "PERFORMANCE", emoji: "🏆", accent: "#FFB830" },
//   { key: "leave", label: "LEAVE", emoji: "🗓️", accent: "#4D9EFF" },
//   { key: "payroll", label: "Payrolls", emoji: "💼", accent: "#FFB830" },
// ];

// function getInitials(name = "") {
//   const parts = name.trim().split(" ").filter(Boolean);
//   if (!parts.length) return "A";
//   if (parts.length === 1) return parts[0][0]?.toUpperCase() || "A";
//   return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
// }

// function getCurrentMonthYear() {
//   const now = new Date();
//   return `${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`;
// }

// function getCurrentMonthName() {
//   return new Date().toLocaleString("default", { month: "long" });
// }

// function formatPayroll(amount) {
//   if (!amount || amount === 0) return "₹0";
//   if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
//   if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
//   return `₹${Math.round(amount)}`;
// }

// export default function Admin({ onNavigate, profile = {}, onNotificationPress }) {
//   const [msgModalVisible, setMsgModalVisible] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [message, setMessage] = useState("");
//   const [customName, setCustomName] = useState("");
//   const [useCustom, setUseCustom] = useState(false);
//   const [sendToAll, setSendToAll] = useState(false);
//   const [employees, setEmployees] = useState([]);
//   const [loadingEmployees, setLoadingEmployees] = useState(false);
//   const [sending, setSending] = useState(false);

//   // NEW: notification state from new file
//   const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

//   // Dashboard state
//   const [dashLoading, setDashLoading] = useState(true);
//   const [dashData, setDashData] = useState({
//     totalEmployees: 0,
//     presentToday: 0,
//     onLeave: 0,
//     pendingLeave: 0,
//     payrollAmount: 0,
//     payrollProcessed: false,
//   });

//   const displayName =
//     profile?.name ||
//     `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
//     "Admin";

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   // NEW: notification polling from new file
//   useEffect(() => {
//     let mounted = true;

//     const loadNotifications = async () => {
//       try {
//         const notifications = await notificationApi.getAdminNotifications().catch(() => []);
//         if (!mounted) return;

//         setHasUnreadNotifications(
//           Array.isArray(notifications) &&
//           notifications.some((item) => !item?.isRead)
//         );
//       } catch (e) {
//         if (!mounted) return;
//         setHasUnreadNotifications(false);
//       }
//     };

//     loadNotifications();
//     const intervalId = setInterval(loadNotifications, 30000);

//     return () => {
//       mounted = false;
//       clearInterval(intervalId);
//     };
//   }, []);

//   const fetchDashboardData = async () => {
//     setDashLoading(true);
//     try {
//       const [employeesRes, attendanceRes, leaveRes, payrollRes] = await Promise.allSettled([
//         fetch(`${BASE_URL}/api/employees`),
//         fetch(`${BASE_URL}/api/attendance?date=${new Date().toISOString().split("T")[0]}`),
//         fetch(`${BASE_URL}/api/leave/admin/all`),
//         fetch(`${BASE_URL}/api/payroll/admin/monthly`),
//       ]);

//       let totalEmployees = 0;
//       if (employeesRes.status === "fulfilled" && employeesRes.value.ok) {
//         const d = await employeesRes.value.json();
//         totalEmployees = Array.isArray(d) ? d.length : 0;
//       }

//       let presentToday = 0;
//       if (attendanceRes.status === "fulfilled" && attendanceRes.value.ok) {
//         const d = await attendanceRes.value.json();
//         presentToday = Array.isArray(d) ? d.length : 0;
//       }

//       let onLeave = 0, pendingLeave = 0;
//       if (leaveRes.status === "fulfilled" && leaveRes.value.ok) {
//         const d = await leaveRes.value.json();
//         if (Array.isArray(d)) {
//           const today = new Date().toISOString().split("T")[0];
//           onLeave = d.filter(
//             (l) =>
//               l.startDate <= today &&
//               l.endDate >= today &&
//               l.status === "APPROVED"
//           ).length;
//           pendingLeave = d.filter((l) => l.status === "REVIEW").length;
//         }
//       }

//       let payrollAmount = 0, payrollProcessed = false;
//       if (payrollRes.status === "fulfilled" && payrollRes.value.ok) {
//         const d = await payrollRes.value.json();
//         if (Array.isArray(d) && d.length > 0) {
//           payrollAmount = d.reduce((s, e) => s + (e.earnedSalary || 0), 0);
//           payrollProcessed = d.some((e) => e.earnedSalary > 0);
//         }
//       }

//       setDashData({
//         totalEmployees,
//         presentToday,
//         onLeave,
//         pendingLeave,
//         payrollAmount,
//         payrollProcessed,
//       });
//     } catch (e) {
//       console.log("DASHBOARD FETCH ERROR:", e.message);
//     } finally {
//       setDashLoading(false);
//     }
//   };

//   const attendancePercent =
//     dashData.totalEmployees > 0
//       ? Math.round((dashData.presentToday / dashData.totalEmployees) * 100)
//       : 0;

//   const closeModal = () => {
//     setMsgModalVisible(false);
//     setDropdownOpen(false);
//     setUseCustom(false);
//     setSendToAll(false);
//     setCustomName("");
//     setSelectedEmployee(null);
//     setMessage("");
//   };

//   const normalizeEmployees = (data) => {
//     if (!Array.isArray(data)) return [];
//     return data.map((emp) => ({
//       id: emp.id,
//       employeeId: emp.employeeId,
//       name: emp.name || emp.fullName || "",
//       email: emp.email || "",
//       role: emp.role || "",
//       designation: emp.designation || "",
//     }));
//   };

//   const loadEmployees = async (keyword = "") => {
//     try {
//       setLoadingEmployees(true);
//       const data = await messageApi.getEmployees(keyword);
//       setEmployees(normalizeEmployees(data));
//     } catch (e) {
//       console.log("EMPLOYEE LOAD ERROR:", e.message);
//       setEmployees([]);
//     } finally {
//       setLoadingEmployees(false);
//     }
//   };

//   useEffect(() => {
//     if (msgModalVisible) loadEmployees("");
//   }, [msgModalVisible]);

//   useEffect(() => {
//     if (useCustom) loadEmployees(customName);
//   }, [customName, useCustom]);

//   const filteredTypeSuggestions = useMemo(() => {
//     if (!useCustom) return [];
//     return employees.slice(0, 8);
//   }, [employees, customName, useCustom]);

//   const recipient = selectedEmployee;
//   const canSend = (sendToAll || !!recipient?.employeeId) && !!message.trim();

//   const handleSend = async () => {
//     if (!canSend) return;

//     try {
//       setSending(true);

//       if (sendToAll) {
//         const result = await messageApi.sendMessageToAll(message.trim());
//         closeModal();
//         Alert.alert(
//           "✅ Sent",
//           `Message sent to ${result.sent} employee${result.sent !== 1 ? "s" : ""}` +
//           (result.failed > 0 ? ` (${result.failed} failed)` : ".")
//         );
//       } else {
//         await messageApi.sendMessage({
//           employeeId: recipient.employeeId,
//           message: message.trim(),
//         });
//         closeModal();
//       }
//     } catch (e) {
//       console.log("SEND MESSAGE ERROR:", e.message);
//       Alert.alert("Error", e.message || "Failed to send message");
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle="light-content" backgroundColor={C.bg} />
//       <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>

//         {/* Top Bar */}
//         <View style={styles.topBar}>
//           <TouchableOpacity
//             style={styles.avatarRow}
//             activeOpacity={0.8}
//             onPress={() => onNavigate && onNavigate("profile")}
//           >
//             <View style={styles.avatar}>
//               {profile?.avatarUri ? (
//                 <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
//               ) : (
//                 <Text style={styles.avatarEmoji}>{getInitials(displayName)}</Text>
//               )}
//             </View>
//             <Text style={styles.adminTitle}>{displayName}</Text>
//           </TouchableOpacity>

//           <View style={styles.iconRow}>
//             <View style={styles.bellWrap}>
//               <TouchableOpacity
//                 style={styles.iconBtn}
//                 activeOpacity={0.8}
//                 onPress={onNotificationPress}
//               >
//                 <Text style={styles.iconText}>🔔</Text>
//               </TouchableOpacity>
//               {hasUnreadNotifications ? <View style={styles.notifDot} /> : null}
//             </View>
//           </View>
//         </View>

//         {/* Dashboard Card */}
//         <View style={styles.dashCard}>
//           <View style={styles.dashCardHeader}>
//             <View>
//               <Text style={styles.dashCardTitle}>Dashboard</Text>
//               <Text style={styles.dashCardSub}>{getCurrentMonthYear()} overview</Text>
//             </View>
//             <TouchableOpacity
//               style={styles.refreshBtn}
//               onPress={fetchDashboardData}
//               activeOpacity={0.7}
//             >
//               <Text style={styles.refreshBtnText}>{dashLoading ? "⏳" : "🔄"}</Text>
//             </TouchableOpacity>
//           </View>

//           {dashLoading ? (
//             <View style={styles.dashLoadingWrap}>
//               <ActivityIndicator color="#2F6E8E" size="small" />
//               <Text style={styles.dashLoadingText}>Loading metrics...</Text>
//             </View>
//           ) : (
//             <View style={styles.metricsRow}>
//               <View style={styles.metricBox}>
//                 <Text style={styles.metricBoxLabel}>Total{"\n"}Employees</Text>
//                 <Text style={styles.metricBoxVal}>{dashData.totalEmployees}</Text>
//                 <View style={styles.badgeBlue}>
//                   <Text style={styles.badgeBlueText}>Registered</Text>
//                 </View>
//               </View>

//               <View style={styles.metricBox}>
//                 <Text style={styles.metricBoxLabel}>Present Today</Text>
//                 <Text style={styles.metricBoxVal}>{dashData.presentToday}</Text>
//                 <View style={styles.badgeBlue}>
//                   <Text style={styles.badgeBlueText}>{attendancePercent}% attendance</Text>
//                 </View>
//               </View>

//               <View style={styles.metricBox}>
//                 <Text style={styles.metricBoxLabel}>On Leave</Text>
//                 <Text style={styles.metricBoxVal}>{dashData.onLeave}</Text>
//                 <View style={styles.badgeOrange}>
//                   <Text style={styles.badgeOrangeText}>
//                     Pending: {dashData.pendingLeave}
//                   </Text>
//                 </View>
//               </View>

//               <View style={styles.metricBox}>
//                 <Text style={styles.metricBoxLabel}>
//                   Payroll ({getCurrentMonthName().substring(0, 3)})
//                 </Text>
//                 <Text style={styles.metricBoxVal}>
//                   {formatPayroll(dashData.payrollAmount)}
//                 </Text>
//                 <View
//                   style={
//                     dashData.payrollProcessed
//                       ? styles.badgeGreen
//                       : styles.badgeOrange
//                   }
//                 >
//                   <Text
//                     style={
//                       dashData.payrollProcessed
//                         ? styles.badgeGreenText
//                         : styles.badgeOrangeText
//                     }
//                   >
//                     {dashData.payrollProcessed ? "Processed" : "Pending"}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           )}
//         </View>

//         {/* Tile Grid */}
//         <View style={styles.grid}>
//           {TILES.map((tile) => (
//             <TouchableOpacity
//               key={tile.key}
//               style={styles.tile}
//               activeOpacity={0.8}
//               onPress={() => onNavigate && onNavigate(tile.key)}
//             >
//               <Text style={styles.tileEmoji}>{tile.emoji}</Text>
//               <Text style={[styles.tileLabel, { color: tile.accent }]}>
//                 {tile.label}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <TouchableOpacity
//           style={styles.msgBtn}
//           activeOpacity={0.85}
//           onPress={() => setMsgModalVisible(true)}
//         >
//           <Text style={styles.msgBtnText}>Message to Individual</Text>
//         </TouchableOpacity>

//         <View style={{ height: 32 }} />
//       </ScrollView>

//       {/* Message Modal */}
//       <Modal
//         visible={msgModalVisible}
//         transparent
//         animationType="slide"
//         onRequestClose={closeModal}
//       >
//         <KeyboardAvoidingView
//           style={styles.modalOverlay}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//           <TouchableOpacity
//             style={styles.modalBackdrop}
//             activeOpacity={1}
//             onPress={closeModal}
//           />

//           <View style={styles.modalSheet}>
//             <View style={styles.sheetHandle} />
//             <Text style={styles.sheetTitle}>Send Message</Text>
//             <Text style={styles.sheetSubtitle}>
//               Send a direct message to an employee or everyone
//             </Text>

//             {/* Send to All toggle */}
//             <TouchableOpacity
//               style={[styles.sendAllBtn, sendToAll && styles.sendAllBtnActive]}
//               onPress={() => {
//                 setSendToAll((v) => !v);
//                 if (!sendToAll) {
//                   setSelectedEmployee(null);
//                   setCustomName("");
//                   setUseCustom(false);
//                   setDropdownOpen(false);
//                 }
//               }}
//               activeOpacity={0.8}
//             >
//               <Text style={styles.sendAllIcon}>{sendToAll ? "✓" : "👥"}</Text>
//               <Text
//                 style={[
//                   styles.sendAllText,
//                   sendToAll && styles.sendAllTextActive,
//                 ]}
//               >
//                 {sendToAll
//                   ? "Sending to ALL employees"
//                   : "Send to All Employees"}
//               </Text>
//             </TouchableOpacity>

//             {!sendToAll && (
//               <>
//                 <View style={styles.toggleRow}>
//                   <TouchableOpacity
//                     style={[styles.toggleBtn, !useCustom && styles.toggleBtnActive]}
//                     onPress={() => {
//                       setUseCustom(false);
//                       setCustomName("");
//                       setSelectedEmployee(null);
//                       loadEmployees("");
//                     }}
//                   >
//                     <Text
//                       style={[
//                         styles.toggleBtnText,
//                         !useCustom && styles.toggleBtnTextActive,
//                       ]}
//                     >
//                       Select
//                     </Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     style={[styles.toggleBtn, useCustom && styles.toggleBtnActive]}
//                     onPress={() => {
//                       setUseCustom(true);
//                       setSelectedEmployee(null);
//                       setDropdownOpen(false);
//                     }}
//                   >
//                     <Text
//                       style={[
//                         styles.toggleBtnText,
//                         useCustom && styles.toggleBtnTextActive,
//                       ]}
//                     >
//                       Type Name
//                     </Text>
//                   </TouchableOpacity>
//                 </View>

//                 <Text style={styles.fieldLabel}>Employee Name</Text>

//                 {useCustom ? (
//                   <>
//                     <TextInput
//                       style={styles.fieldInput}
//                       placeholder="Type employee name..."
//                       placeholderTextColor={C.muted}
//                       value={customName}
//                       onChangeText={setCustomName}
//                     />

//                     <View style={styles.dropdownList}>
//                       {filteredTypeSuggestions.length === 0 ? (
//                         <View style={styles.dropdownEmpty}>
//                           <Text style={styles.dropdownEmptyText}>
//                             {loadingEmployees ? "Loading..." : "No employee found"}
//                           </Text>
//                         </View>
//                       ) : (
//                         filteredTypeSuggestions.map((emp) => (
//                           <TouchableOpacity
//                             key={emp.employeeId}
//                             style={[
//                               styles.dropdownItem,
//                               selectedEmployee?.employeeId === emp.employeeId &&
//                               styles.dropdownItemActive,
//                             ]}
//                             onPress={() => {
//                               setSelectedEmployee(emp);
//                               setCustomName(emp.name);
//                             }}
//                           >
//                             <Text
//                               style={[
//                                 styles.dropdownItemText,
//                                 selectedEmployee?.employeeId === emp.employeeId && {
//                                   color: "#2F6E8E",
//                                 },
//                               ]}
//                             >
//                               {emp.name} ({emp.employeeId})
//                             </Text>
//                             {selectedEmployee?.employeeId === emp.employeeId && (
//                               <Text style={{ color: "#2F6E8E" }}>✓</Text>
//                             )}
//                           </TouchableOpacity>
//                         ))
//                       )}
//                     </View>
//                   </>
//                 ) : (
//                   <>
//                     <TouchableOpacity
//                       style={styles.dropdown}
//                       onPress={() => setDropdownOpen(!dropdownOpen)}
//                       activeOpacity={0.8}
//                     >
//                       <Text
//                         style={[
//                           styles.dropdownText,
//                           !selectedEmployee && { color: C.muted },
//                         ]}
//                       >
//                         {selectedEmployee
//                           ? `${selectedEmployee.name} (${selectedEmployee.employeeId})`
//                           : "Select employee..."}
//                       </Text>
//                       <Text style={{ color: C.muted, fontSize: 12 }}>
//                         {dropdownOpen ? "▲" : "▼"}
//                       </Text>
//                     </TouchableOpacity>

//                     {dropdownOpen && (
//                       <View style={styles.dropdownList}>
//                         {employees.length === 0 ? (
//                           <View style={styles.dropdownEmpty}>
//                             <Text style={styles.dropdownEmptyText}>
//                               {loadingEmployees ? "Loading..." : "No employees found"}
//                             </Text>
//                           </View>
//                         ) : (
//                           employees.map((emp) => (
//                             <TouchableOpacity
//                               key={emp.employeeId}
//                               style={[
//                                 styles.dropdownItem,
//                                 selectedEmployee?.employeeId === emp.employeeId &&
//                                 styles.dropdownItemActive,
//                               ]}
//                               onPress={() => {
//                                 setSelectedEmployee(emp);
//                                 setDropdownOpen(false);
//                               }}
//                             >
//                               <Text
//                                 style={[
//                                   styles.dropdownItemText,
//                                   selectedEmployee?.employeeId === emp.employeeId && {
//                                     color: "#2F6E8E",
//                                   },
//                                 ]}
//                               >
//                                 {emp.name} ({emp.employeeId})
//                               </Text>
//                               {selectedEmployee?.employeeId === emp.employeeId && (
//                                 <Text style={{ color: "#2F6E8E" }}>✓</Text>
//                               )}
//                             </TouchableOpacity>
//                           ))
//                         )}
//                       </View>
//                     )}
//                   </>
//                 )}
//               </>
//             )}

//             <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Message</Text>
//             <TextInput
//               style={styles.messageInput}
//               placeholder="Type your message here..."
//               placeholderTextColor={C.muted}
//               value={message}
//               onChangeText={setMessage}
//               multiline
//               numberOfLines={4}
//               textAlignVertical="top"
//             />

//             <View style={styles.modalActions}>
//               <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
//                 <Text style={styles.cancelBtnText}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.sendBtn, (!canSend || sending) && styles.sendBtnDisabled]}
//                 onPress={handleSend}
//                 activeOpacity={0.85}
//                 disabled={!canSend || sending}
//               >
//                 <Text style={styles.sendBtnText}>
//                   {sending ? "Sending..." : sendToAll ? "Send to All" : "Send Message"}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: C.bg },
//   root: { flex: 1, backgroundColor: C.bg },

//   topBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: 20,
//     paddingBottom: 14,
//   },
//   avatarRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     paddingTop: 29,
//   },
//   avatar: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: "#1a3a5c",
//     borderWidth: 2,
//     borderColor: "#2F6E8E",
//     alignItems: "center",
//     justifyContent: "center",
//     overflow: "hidden",
//   },
//   avatarImage: { width: "100%", height: "100%" },
//   avatarEmoji: { fontSize: 22, color: "#fff", fontWeight: "800" },
//   adminTitle: {
//     fontSize: 24,
//     fontWeight: "800",
//     color: C.text,
//     letterSpacing: -0.5,
//   },
//   iconRow: { flexDirection: "row", alignItems: "center", gap: 14 },
//   iconBtn: { padding: 4, paddingTop: 29 },
//   iconText: { fontSize: 20 },
//   bellWrap: { position: "relative" },
//   notifDot: {
//     position: "absolute",
//     top: 29,
//     right: 10,
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: C.red,
//     borderWidth: 1.5,
//     borderColor: C.bg,
//   },

//   dashCard: {
//     marginHorizontal: 16,
//     marginBottom: 16,
//     backgroundColor: "#0f1e30",
//     borderRadius: 16,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: "#1a3a5c",
//   },
//   dashCardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 16,
//   },
//   dashCardTitle: { fontSize: 18, fontWeight: "800", color: C.text },
//   dashCardSub: { fontSize: 12, color: C.muted, marginTop: 2 },
//   refreshBtn: {
//     backgroundColor: "#1a3a5c",
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//   },
//   refreshBtnText: { fontSize: 16 },
//   dashLoadingWrap: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 10,
//     paddingVertical: 20,
//   },
//   dashLoadingText: { color: C.muted, fontSize: 13 },

//   metricsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
//   metricBox: {
//     width: "47%",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     padding: 12,
//     gap: 4,
//   },
//   metricBoxLabel: {
//     fontSize: 11,
//     fontWeight: "600",
//     color: "#666",
//     textTransform: "uppercase",
//     letterSpacing: 0.3,
//   },
//   metricBoxVal: {
//     fontSize: 26,
//     fontWeight: "800",
//     color: "#112235",
//   },

//   badgeBlue: {
//     backgroundColor: "#EEF4FF",
//     borderRadius: 6,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     alignSelf: "flex-start",
//   },
//   badgeBlueText: { fontSize: 10, fontWeight: "700", color: "#2F6E8E" },

//   badgeOrange: {
//     backgroundColor: "#FFF8EE",
//     borderRadius: 6,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     alignSelf: "flex-start",
//   },
//   badgeOrangeText: { fontSize: 10, fontWeight: "700", color: "#D97706" },

//   badgeGreen: {
//     backgroundColor: "#EEFFF4",
//     borderRadius: 6,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     alignSelf: "flex-start",
//   },
//   badgeGreenText: { fontSize: 10, fontWeight: "700", color: "#16A34A" },

//   grid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     paddingHorizontal: 16,
//     gap: 12,
//   },
//   tile: {
//     width: "47%",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 14,
//     paddingVertical: 20,
//     paddingHorizontal: 14,
//     alignItems: "center",
//     gap: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.12,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   tileEmoji: { fontSize: 36 },
//   tileLabel: {
//     fontSize: 12,
//     fontWeight: "700",
//     textAlign: "center",
//     letterSpacing: 0.3,
//   },

//   msgBtn: {
//     marginHorizontal: 16,
//     marginTop: 20,
//     backgroundColor: "#2F6E8E",
//     borderRadius: 14,
//     paddingVertical: 15,
//     alignItems: "center",
//     shadowColor: "#2F6E8E",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.35,
//     shadowRadius: 12,
//     elevation: 6,
//   },
//   msgBtnText: {
//     color: "#FFF",
//     fontSize: 16,
//     fontWeight: "700",
//     letterSpacing: 0.3,
//   },

//   modalOverlay: { flex: 1, justifyContent: "flex-end" },
//   modalBackdrop: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.6)",
//   },
//   modalSheet: {
//     backgroundColor: "#0f1e30",
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 24,
//     paddingBottom: 36,
//   },
//   sheetHandle: {
//     width: 40,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: "#1a3a5c",
//     alignSelf: "center",
//     marginBottom: 20,
//   },
//   sheetTitle: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: C.text,
//     marginBottom: 4,
//   },
//   sheetSubtitle: {
//     fontSize: 13,
//     color: C.muted,
//     marginBottom: 12,
//   },

//   sendAllBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     backgroundColor: "#0f2035",
//     borderRadius: 12,
//     padding: 12,
//     borderWidth: 1.5,
//     borderColor: "#1a3a5c",
//     marginBottom: 14,
//   },
//   sendAllBtnActive: {
//     borderColor: "#2F6E8E",
//     backgroundColor: "rgba(47,110,142,0.15)",
//   },
//   sendAllIcon: { fontSize: 18 },
//   sendAllText: { fontSize: 14, fontWeight: "600", color: C.muted },
//   sendAllTextActive: { color: "#2F6E8E" },

//   toggleRow: {
//     flexDirection: "row",
//     backgroundColor: "#0f2035",
//     borderRadius: 10,
//     padding: 3,
//     marginBottom: 12,
//   },
//   toggleBtn: {
//     flex: 1,
//     paddingVertical: 8,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   toggleBtnActive: { backgroundColor: "#2F6E8E" },
//   toggleBtnText: { fontSize: 13, fontWeight: "600", color: C.muted },
//   toggleBtnTextActive: { color: "#FFF" },

//   fieldLabel: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: C.muted,
//     marginBottom: 8,
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },
//   fieldInput: {
//     backgroundColor: "#0f2035",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: C.border,
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     fontSize: 15,
//     color: C.text,
//   },

//   dropdown: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: "#0f2035",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: C.border,
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//   },
//   dropdownText: { fontSize: 15, color: C.text },
//   dropdownList: {
//     backgroundColor: "#0f2035",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: C.border,
//     marginTop: 4,
//     overflow: "hidden",
//   },
//   dropdownEmpty: { padding: 16, alignItems: "center" },
//   dropdownEmptyText: {
//     fontSize: 14,
//     color: C.muted,
//     fontWeight: "600",
//   },
//   dropdownItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 13,
//     borderBottomWidth: 1,
//     borderBottomColor: "#1a3a5c",
//   },
//   dropdownItemActive: { backgroundColor: "#1a3a5c" },
//   dropdownItemText: { fontSize: 15, color: C.text },

//   messageInput: {
//     backgroundColor: "#0f2035",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: C.border,
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     fontSize: 15,
//     color: C.text,
//     minHeight: 100,
//   },

//   modalActions: {
//     flexDirection: "row",
//     gap: 12,
//     marginTop: 24,
//   },
//   cancelBtn: {
//     flex: 1,
//     paddingVertical: 14,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: C.border,
//     alignItems: "center",
//   },
//   cancelBtnText: {
//     color: C.muted,
//     fontSize: 15,
//     fontWeight: "600",
//   },
//   sendBtn: {
//     flex: 2,
//     paddingVertical: 14,
//     borderRadius: 12,
//     backgroundColor: "#2F6E8E",
//     alignItems: "center",
//   },
//   sendBtnDisabled: { opacity: 0.4 },
//   sendBtnText: {
//     color: "#FFF",
//     fontSize: 15,
//     fontWeight: "700",
//   },
// });








/**
 * adminscreens/Admin.js
 *
 * FIXES:
 *  1. Notification bell opens approval panel for pending employees (ISSUE 2)
 *  2. Broadcast message uses single API call (ISSUE 5)
 *  3. Admin can approve/reject employees from notification panel
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, SafeAreaView, StatusBar, Modal, KeyboardAvoidingView,
  Platform, Image, ActivityIndicator, Alert,
} from "react-native";
import { notificationApi } from "../api/notificationApi";
import { messageApi } from "../api/messageApi";
import { BASE_URL } from "../api/config";

const C = {
  bg: '#112235',
  card: '#0f1e30',
  orange: '#3B82F6',
  text: "#F0EDE8",
  muted: "#7A7570",
  border: '#1a3a5c',
  red: "#FF4D6D",
};

const TILES = [
  { key: "employees", label: "Employee\nManagement", emoji: "👥", accent: "#4D6FFF" },
  { key: "attendance", label: "ATTENDANCE", emoji: "📅", accent: "#2F6E8E" },
  { key: "tasks", label: "Tasks", emoji: "⏱️", accent: "#2DD4A0" },
  { key: "performance", label: "PERFORMANCE", emoji: "🏆", accent: "#FFB830" },
  { key: "leave", label: "LEAVE", emoji: "🗓️", accent: "#4D9EFF" },
  { key: "payroll", label: "Payrolls", emoji: "💼", accent: "#FFB830" },
];

function getInitials(name = "") {
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "A";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "A";
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function getCurrentMonthYear() {
  const now = new Date();
  return `${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`;
}

function getCurrentMonthName() {
  return new Date().toLocaleString("default", { month: "long" });
}

function formatPayroll(amount) {
  if (!amount || amount === 0) return "₹0";
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${Math.round(amount)}`;
}

export default function Admin({ onNavigate, profile = {}, onNotificationPress }) {
  const [msgModalVisible, setMsgModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [customName, setCustomName] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [sendToAll, setSendToAll] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [sending, setSending] = useState(false);

  // ISSUE 2: Notification state
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // Dashboard state
  const [dashLoading, setDashLoading] = useState(true);
  const [dashData, setDashData] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    pendingLeave: 0,
    payrollAmount: 0,
    payrollProcessed: false,
  });

  const displayName =
    profile?.name ||
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
    "Admin";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Poll for pending approvals every 30 seconds
  useEffect(() => {
    let mounted = true;

    const loadPendingApprovals = async () => {
      try {
        const notifications = await notificationApi.getAdminNotifications().catch(() => []);
        if (!mounted) return;
        const list = Array.isArray(notifications) ? notifications : [];
        setHasUnreadNotifications(list.length > 0);
        setPendingEmployees(list);
      } catch (e) {
        if (!mounted) return;
        setHasUnreadNotifications(false);
      }
    };

    loadPendingApprovals();
    const interval = setInterval(loadPendingApprovals, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const fetchDashboardData = async () => {
    setDashLoading(true);
    try {
      const [employeesRes, attendanceRes, leaveRes, payrollRes] = await Promise.allSettled([
        fetch(`${BASE_URL}/api/employees`),
        fetch(`${BASE_URL}/api/attendance?date=${new Date().toISOString().split("T")[0]}`),
        fetch(`${BASE_URL}/api/leave/admin/all`),
        fetch(`${BASE_URL}/api/payroll/admin/monthly`),
      ]);

      let totalEmployees = 0;
      if (employeesRes.status === "fulfilled" && employeesRes.value.ok) {
        const d = await employeesRes.value.json();
        totalEmployees = Array.isArray(d) ? d.length : 0;
      }

      let presentToday = 0;
      if (attendanceRes.status === "fulfilled" && attendanceRes.value.ok) {
        const d = await attendanceRes.value.json();
        presentToday = Array.isArray(d) ? d.length : 0;
      }

      let onLeave = 0, pendingLeave = 0;
      if (leaveRes.status === "fulfilled" && leaveRes.value.ok) {
        const d = await leaveRes.value.json();
        if (Array.isArray(d)) {
          const today = new Date().toISOString().split("T")[0];
          onLeave = d.filter((l) =>
            l.startDate <= today && l.endDate >= today && l.status === "APPROVED"
          ).length;
          pendingLeave = d.filter((l) => l.status === "REVIEW").length;
        }
      }

      let payrollAmount = 0, payrollProcessed = false;
      if (payrollRes.status === "fulfilled" && payrollRes.value.ok) {
        const d = await payrollRes.value.json();
        if (Array.isArray(d) && d.length > 0) {
          payrollAmount = d.reduce((s, e) => s + (e.earnedSalary || 0), 0);
          payrollProcessed = d.some((e) => e.earnedSalary > 0);
        }
      }

      setDashData({ totalEmployees, presentToday, onLeave, pendingLeave, payrollAmount, payrollProcessed });
    } catch (e) {
      console.log("DASHBOARD FETCH ERROR:", e.message);
    } finally {
      setDashLoading(false);
    }
  };

  const attendancePercent =
    dashData.totalEmployees > 0
      ? Math.round((dashData.presentToday / dashData.totalEmployees) * 100)
      : 0;

  // ISSUE 2 FIX: Open notification panel
  const handleNotifPress = async () => {
    setLoadingNotifs(true);
    setNotifModalVisible(true);
    try {
      const list = await notificationApi.getAdminNotifications().catch(() => []);
      setPendingEmployees(Array.isArray(list) ? list : []);
    } catch (e) {
      setPendingEmployees([]);
    } finally {
      setLoadingNotifs(false);
    }
  };

  // ISSUE 2 FIX: Approve employee
  const handleApprove = async (notification) => {
    setProcessingId(notification.employeeId);
    try {
      await notificationApi.approveEmployee(notification.employeeId);
      setPendingEmployees((prev) => prev.filter((n) => n.employeeId !== notification.employeeId));
      Alert.alert("✅ Approved", `${notification.employeeName} has been approved and can now log in.`);
      if (pendingEmployees.length <= 1) {
        setHasUnreadNotifications(false);
      }
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to approve employee");
    } finally {
      setProcessingId(null);
    }
  };

  // ISSUE 2 FIX: Reject employee
  const handleReject = async (notification) => {
    Alert.alert(
      "Reject Employee",
      `Are you sure you want to reject ${notification.employeeName}? This will delete their account.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setProcessingId(notification.employeeId);
            try {
              await notificationApi.rejectEmployee(notification.employeeId);
              setPendingEmployees((prev) =>
                prev.filter((n) => n.employeeId !== notification.employeeId)
              );
              Alert.alert("❌ Rejected", `${notification.employeeName}'s request has been rejected.`);
              if (pendingEmployees.length <= 1) setHasUnreadNotifications(false);
            } catch (e) {
              Alert.alert("Error", e.message || "Failed to reject employee");
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const closeModal = () => {
    setMsgModalVisible(false);
    setDropdownOpen(false);
    setUseCustom(false);
    setSendToAll(false);
    setCustomName("");
    setSelectedEmployee(null);
    setMessage("");
  };

  const normalizeEmployees = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map((emp) => ({
      id: emp.id,
      employeeId: emp.employeeId,
      name: emp.name || emp.fullName || "",
      email: emp.email || "",
      role: emp.role || "",
      designation: emp.designation || "",
    }));
  };

  const loadEmployees = async (keyword = "") => {
    try {
      setLoadingEmployees(true);
      const data = await messageApi.getEmployees(keyword);
      setEmployees(normalizeEmployees(data));
    } catch (e) {
      console.log("EMPLOYEE LOAD ERROR:", e.message);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    if (msgModalVisible) loadEmployees("");
  }, [msgModalVisible]);

  useEffect(() => {
    if (useCustom) loadEmployees(customName);
  }, [customName, useCustom]);

  const filteredTypeSuggestions = useMemo(() => {
    if (!useCustom) return [];
    return employees.slice(0, 8);
  }, [employees, customName, useCustom]);

  const recipient = selectedEmployee;
  const canSend = (sendToAll || !!recipient?.employeeId) && !!message.trim();

  // ISSUE 5 FIX: Use single broadcast API call
  const handleSend = async () => {
    if (!canSend) return;
    try {
      setSending(true);
      if (sendToAll) {
        await messageApi.sendBroadcastMessage(message.trim());
        closeModal();
        Alert.alert("✅ Sent", "Message broadcast to all employees successfully.");
      } else {
        await messageApi.sendMessage({
          employeeId: recipient.employeeId,
          message: message.trim(),
        });
        closeModal();
      }
    } catch (e) {
      console.log("SEND MESSAGE ERROR:", e.message);
      Alert.alert("Error", e.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>

        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.avatarRow}
            activeOpacity={0.8}
            onPress={() => onNavigate && onNavigate("profile")}
          >
            <View style={styles.avatar}>
              {profile?.avatarUri ? (
                <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarEmoji}>{getInitials(displayName)}</Text>
              )}
            </View>
            <Text style={styles.adminTitle}>{displayName}</Text>
          </TouchableOpacity>

          <View style={styles.iconRow}>
            <View style={styles.bellWrap}>
              {/* ISSUE 2 FIX: Bell opens notification/approval panel */}
              <TouchableOpacity
                style={styles.iconBtn}
                activeOpacity={0.8}
                onPress={handleNotifPress}
              >
                <Text style={styles.iconText}>🔔</Text>
              </TouchableOpacity>
              {hasUnreadNotifications ? <View style={styles.notifDot} /> : null}
            </View>
          </View>
        </View>

        {/* Dashboard Card */}
        <View style={styles.dashCard}>
          <View style={styles.dashCardHeader}>
            <View>
              <Text style={styles.dashCardTitle}>Dashboard</Text>
              <Text style={styles.dashCardSub}>{getCurrentMonthYear()} overview</Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn} onPress={fetchDashboardData} activeOpacity={0.7}>
              <Text style={styles.refreshBtnText}>{dashLoading ? "⏳" : "🔄"}</Text>
            </TouchableOpacity>
          </View>

          {dashLoading ? (
            <View style={styles.dashLoadingWrap}>
              <ActivityIndicator color="#2F6E8E" size="small" />
              <Text style={styles.dashLoadingText}>Loading metrics...</Text>
            </View>
          ) : (
            <View style={styles.metricsRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricBoxLabel}>Total{"\n"}Employees</Text>
                <Text style={styles.metricBoxVal}>{dashData.totalEmployees}</Text>
                <View style={styles.badgeBlue}>
                  <Text style={styles.badgeBlueText}>Registered</Text>
                </View>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricBoxLabel}>Present Today</Text>
                <Text style={styles.metricBoxVal}>{dashData.presentToday}</Text>
                <View style={styles.badgeBlue}>
                  <Text style={styles.badgeBlueText}>{attendancePercent}% attendance</Text>
                </View>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricBoxLabel}>On Leave</Text>
                <Text style={styles.metricBoxVal}>{dashData.onLeave}</Text>
                <View style={styles.badgeOrange}>
                  <Text style={styles.badgeOrangeText}>Pending: {dashData.pendingLeave}</Text>
                </View>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricBoxLabel}>
                  Payroll ({getCurrentMonthName().substring(0, 3)})
                </Text>
                <Text style={styles.metricBoxVal}>{formatPayroll(dashData.payrollAmount)}</Text>
                <View style={dashData.payrollProcessed ? styles.badgeGreen : styles.badgeOrange}>
                  <Text style={dashData.payrollProcessed ? styles.badgeGreenText : styles.badgeOrangeText}>
                    {dashData.payrollProcessed ? "Processed" : "Pending"}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Tile Grid */}
        <View style={styles.grid}>
          {TILES.map((tile) => (
            <TouchableOpacity
              key={tile.key}
              style={styles.tile}
              activeOpacity={0.8}
              onPress={() => onNavigate && onNavigate(tile.key)}
            >
              <Text style={styles.tileEmoji}>{tile.emoji}</Text>
              <Text style={[styles.tileLabel, { color: tile.accent }]}>{tile.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.msgBtn}
          activeOpacity={0.85}
          onPress={() => setMsgModalVisible(true)}
        >
          <Text style={styles.msgBtnText}>Message to Individual</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── ISSUE 2 FIX: Notification / Approval Modal ── */}
      <Modal
        visible={notifModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotifModalVisible(false)}
      >
        <View style={notifStyles.overlay}>
          <TouchableOpacity
            style={notifStyles.backdrop}
            activeOpacity={1}
            onPress={() => setNotifModalVisible(false)}
          />
          <View style={notifStyles.sheet}>
            <View style={notifStyles.handle} />
            <View style={notifStyles.header}>
              <Text style={notifStyles.title}>
                🔔 Notifications
                {pendingEmployees.length > 0 && (
                  <Text style={notifStyles.badge}> ({pendingEmployees.length})</Text>
                )}
              </Text>
              <TouchableOpacity onPress={() => setNotifModalVisible(false)}>
                <Text style={{ color: C.muted, fontSize: 22 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {loadingNotifs ? (
              <View style={notifStyles.centered}>
                <ActivityIndicator color="#2F6E8E" size="large" />
                <Text style={notifStyles.loadingText}>Loading notifications...</Text>
              </View>
            ) : pendingEmployees.length === 0 ? (
              <View style={notifStyles.centered}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>✅</Text>
                <Text style={notifStyles.emptyText}>No pending approvals</Text>
                <Text style={notifStyles.emptySubText}>All employee requests have been handled.</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {pendingEmployees.map((notif) => (
                  <View key={notif.employeeId} style={notifStyles.card}>
                    <View style={notifStyles.cardHeader}>
                      <View style={notifStyles.avatarCircle}>
                        <Text style={notifStyles.avatarText}>
                          {(notif.employeeName || "?").charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={notifStyles.empName}>{notif.employeeName}</Text>
                        <Text style={notifStyles.empId}>{notif.employeeEmpId}</Text>
                      </View>
                      <View style={notifStyles.pendingBadge}>
                        <Text style={notifStyles.pendingBadgeText}>Pending</Text>
                      </View>
                    </View>

                    <View style={notifStyles.infoRow}>
                      <Text style={notifStyles.infoLabel}>Email</Text>
                      <Text style={notifStyles.infoValue}>{notif.employeeEmail}</Text>
                    </View>
                    <View style={notifStyles.infoRow}>
                      <Text style={notifStyles.infoLabel}>Designation</Text>
                      <Text style={notifStyles.infoValue}>{notif.designation}</Text>
                    </View>

                    <View style={notifStyles.actionRow}>
                      <TouchableOpacity
                        style={[
                          notifStyles.approveBtn,
                          processingId === notif.employeeId && { opacity: 0.6 },
                        ]}
                        onPress={() => handleApprove(notif)}
                        disabled={processingId === notif.employeeId}
                      >
                        {processingId === notif.employeeId ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={notifStyles.approveBtnText}>✓ Approve</Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          notifStyles.rejectBtn,
                          processingId === notif.employeeId && { opacity: 0.6 },
                        ]}
                        onPress={() => handleReject(notif)}
                        disabled={processingId === notif.employeeId}
                      >
                        <Text style={notifStyles.rejectBtnText}>✕ Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Message Modal */}
      <Modal
        visible={msgModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeModal} />

          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Send Message</Text>
            <Text style={styles.sheetSubtitle}>Send a direct message to an employee or everyone</Text>

            {/* Send to All toggle */}
            <TouchableOpacity
              style={[styles.sendAllBtn, sendToAll && styles.sendAllBtnActive]}
              onPress={() => {
                setSendToAll((v) => !v);
                if (!sendToAll) {
                  setSelectedEmployee(null);
                  setCustomName("");
                  setUseCustom(false);
                  setDropdownOpen(false);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.sendAllIcon}>{sendToAll ? "✓" : "👥"}</Text>
              <Text style={[styles.sendAllText, sendToAll && styles.sendAllTextActive]}>
                {sendToAll ? "Sending to ALL employees" : "Send to All Employees"}
              </Text>
            </TouchableOpacity>

            {!sendToAll && (
              <>
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, !useCustom && styles.toggleBtnActive]}
                    onPress={() => {
                      setUseCustom(false);
                      setCustomName("");
                      setSelectedEmployee(null);
                      loadEmployees("");
                    }}
                  >
                    <Text style={[styles.toggleBtnText, !useCustom && styles.toggleBtnTextActive]}>
                      Select
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, useCustom && styles.toggleBtnActive]}
                    onPress={() => {
                      setUseCustom(true);
                      setSelectedEmployee(null);
                      setDropdownOpen(false);
                    }}
                  >
                    <Text style={[styles.toggleBtnText, useCustom && styles.toggleBtnTextActive]}>
                      Type Name
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.fieldLabel}>Employee Name</Text>

                {useCustom ? (
                  <>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="Type employee name..."
                      placeholderTextColor={C.muted}
                      value={customName}
                      onChangeText={setCustomName}
                    />
                    <View style={styles.dropdownList}>
                      {filteredTypeSuggestions.length === 0 ? (
                        <View style={styles.dropdownEmpty}>
                          <Text style={styles.dropdownEmptyText}>
                            {loadingEmployees ? "Loading..." : "No employee found"}
                          </Text>
                        </View>
                      ) : (
                        filteredTypeSuggestions.map((emp) => (
                          <TouchableOpacity
                            key={emp.employeeId}
                            style={[
                              styles.dropdownItem,
                              selectedEmployee?.employeeId === emp.employeeId &&
                              styles.dropdownItemActive,
                            ]}
                            onPress={() => {
                              setSelectedEmployee(emp);
                              setCustomName(emp.name);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                selectedEmployee?.employeeId === emp.employeeId && {
                                  color: "#2F6E8E",
                                },
                              ]}
                            >
                              {emp.name} ({emp.employeeId})
                            </Text>
                            {selectedEmployee?.employeeId === emp.employeeId && (
                              <Text style={{ color: "#2F6E8E" }}>✓</Text>
                            )}
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.dropdown}
                      onPress={() => setDropdownOpen(!dropdownOpen)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.dropdownText,
                          !selectedEmployee && { color: C.muted },
                        ]}
                      >
                        {selectedEmployee
                          ? `${selectedEmployee.name} (${selectedEmployee.employeeId})`
                          : "Select employee..."}
                      </Text>
                      <Text style={{ color: C.muted, fontSize: 12 }}>
                        {dropdownOpen ? "▲" : "▼"}
                      </Text>
                    </TouchableOpacity>

                    {dropdownOpen && (
                      <View style={styles.dropdownList}>
                        {employees.length === 0 ? (
                          <View style={styles.dropdownEmpty}>
                            <Text style={styles.dropdownEmptyText}>
                              {loadingEmployees ? "Loading..." : "No employees found"}
                            </Text>
                          </View>
                        ) : (
                          employees.map((emp) => (
                            <TouchableOpacity
                              key={emp.employeeId}
                              style={[
                                styles.dropdownItem,
                                selectedEmployee?.employeeId === emp.employeeId &&
                                styles.dropdownItemActive,
                              ]}
                              onPress={() => {
                                setSelectedEmployee(emp);
                                setDropdownOpen(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  selectedEmployee?.employeeId === emp.employeeId && {
                                    color: "#2F6E8E",
                                  },
                                ]}
                              >
                                {emp.name} ({emp.employeeId})
                              </Text>
                              {selectedEmployee?.employeeId === emp.employeeId && (
                                <Text style={{ color: "#2F6E8E" }}>✓</Text>
                              )}
                            </TouchableOpacity>
                          ))
                        )}
                      </View>
                    )}
                  </>
                )}
              </>
            )}

            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Message</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Type your message here..."
              placeholderTextColor={C.muted}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sendBtn, (!canSend || sending) && styles.sendBtnDisabled]}
                onPress={handleSend}
                activeOpacity={0.85}
                disabled={!canSend || sending}
              >
                <Text style={styles.sendBtnText}>
                  {sending ? "Sending..." : sendToAll ? "Send to All" : "Send Message"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// Notification modal styles
const notifStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: "#0f1e30",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    maxHeight: "85%",
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "#1a3a5c", alignSelf: "center", marginBottom: 16,
  },
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: "800", color: "#F0EDE8" },
  badge: { color: "#FF4D6D", fontWeight: "800" },
  centered: { alignItems: "center", paddingVertical: 40, gap: 8 },
  loadingText: { color: "#7A7570", marginTop: 12 },
  emptyText: { fontSize: 16, fontWeight: "700", color: "#F0EDE8" },
  emptySubText: { fontSize: 13, color: "#7A7570", textAlign: "center" },

  card: {
    backgroundColor: "#112235",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1a3a5c",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 10 },
  avatarCircle: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "#2F6E8E", alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  empName: { color: "#F0EDE8", fontSize: 15, fontWeight: "700" },
  empId: { color: "#7A7570", fontSize: 12, marginTop: 2 },
  pendingBadge: {
    backgroundColor: "#FFF8EE", borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  pendingBadgeText: { color: "#D97706", fontSize: 11, fontWeight: "700" },

  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 4, gap: 8 },
  infoLabel: { color: "#7A7570", fontSize: 12, width: 80 },
  infoValue: { color: "#C8C4BE", fontSize: 12, flex: 1 },

  actionRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  approveBtn: {
    flex: 1, backgroundColor: "#E8FAF7", borderRadius: 10,
    paddingVertical: 10, alignItems: "center", justifyContent: "center",
  },
  approveBtnText: { color: "#0F6E56", fontSize: 13, fontWeight: "700" },
  rejectBtn: {
    flex: 1, backgroundColor: "#FFF0F3", borderRadius: 10,
    paddingVertical: 10, alignItems: "center",
  },
  rejectBtnText: { color: "#FF4D6D", fontSize: 13, fontWeight: "700" },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  root: { flex: 1, backgroundColor: C.bg },
  topBar: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", padding: 20, paddingBottom: 14,
  },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 29 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#1a3a5c", borderWidth: 2, borderColor: "#2F6E8E",
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarEmoji: { fontSize: 22, color: "#fff", fontWeight: "800" },
  adminTitle: { fontSize: 24, fontWeight: "800", color: C.text, letterSpacing: -0.5 },
  iconRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconBtn: { padding: 4, paddingTop: 29 },
  iconText: { fontSize: 20 },
  bellWrap: { position: "relative" },
  notifDot: {
    position: "absolute", top: 29, right: 10,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.red, borderWidth: 1.5, borderColor: C.bg,
  },
  dashCard: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: "#0f1e30", borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: "#1a3a5c",
  },
  dashCardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 16,
  },
  dashCardTitle: { fontSize: 18, fontWeight: "800", color: C.text },
  dashCardSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  refreshBtn: {
    backgroundColor: "#1a3a5c", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  refreshBtnText: { fontSize: 16 },
  dashLoadingWrap: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 10, paddingVertical: 20,
  },
  dashLoadingText: { color: C.muted, fontSize: 13 },
  metricsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricBox: { width: "47%", backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12, gap: 4 },
  metricBoxLabel: { fontSize: 11, fontWeight: "600", color: "#666", textTransform: "uppercase", letterSpacing: 0.3 },
  metricBoxVal: { fontSize: 26, fontWeight: "800", color: "#112235" },
  badgeBlue: { backgroundColor: "#EEF4FF", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  badgeBlueText: { fontSize: 10, fontWeight: "700", color: "#2F6E8E" },
  badgeOrange: { backgroundColor: "#FFF8EE", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  badgeOrangeText: { fontSize: 10, fontWeight: "700", color: "#D97706" },
  badgeGreen: { backgroundColor: "#EEFFF4", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  badgeGreenText: { fontSize: 10, fontWeight: "700", color: "#16A34A" },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 12 },
  tile: {
    width: "47%", backgroundColor: "#FFFFFF", borderRadius: 14,
    paddingVertical: 20, paddingHorizontal: 14, alignItems: "center", gap: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  tileEmoji: { fontSize: 36 },
  tileLabel: { fontSize: 12, fontWeight: "700", textAlign: "center", letterSpacing: 0.3 },
  msgBtn: {
    marginHorizontal: 16, marginTop: 20, backgroundColor: "#2F6E8E",
    borderRadius: 14, paddingVertical: 15, alignItems: "center",
    shadowColor: "#2F6E8E", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  msgBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  modalSheet: {
    backgroundColor: "#0f1e30", borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24, paddingBottom: 36,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "#1a3a5c", alignSelf: "center", marginBottom: 20,
  },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: C.text, marginBottom: 4 },
  sheetSubtitle: { fontSize: 13, color: C.muted, marginBottom: 12 },
  sendAllBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#0f2035", borderRadius: 12, padding: 12,
    borderWidth: 1.5, borderColor: "#1a3a5c", marginBottom: 14,
  },
  sendAllBtnActive: { borderColor: "#2F6E8E", backgroundColor: "rgba(47,110,142,0.15)" },
  sendAllIcon: { fontSize: 18 },
  sendAllText: { fontSize: 14, fontWeight: "600", color: C.muted },
  sendAllTextActive: { color: "#2F6E8E" },
  toggleRow: {
    flexDirection: "row", backgroundColor: "#0f2035",
    borderRadius: 10, padding: 3, marginBottom: 12,
  },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  toggleBtnActive: { backgroundColor: "#2F6E8E" },
  toggleBtnText: { fontSize: 13, fontWeight: "600", color: C.muted },
  toggleBtnTextActive: { color: "#FFF" },
  fieldLabel: {
    fontSize: 12, fontWeight: "600", color: C.muted,
    marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5,
  },
  fieldInput: {
    backgroundColor: "#0f2035", borderRadius: 12,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: C.text,
  },
  dropdown: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#0f2035", borderRadius: 12,
    borderWidth: 1, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 14,
  },
  dropdownText: { fontSize: 15, color: C.text },
  dropdownList: {
    backgroundColor: "#0f2035", borderRadius: 12,
    borderWidth: 1, borderColor: C.border, marginTop: 4, overflow: "hidden",
  },
  dropdownEmpty: { padding: 16, alignItems: "center" },
  dropdownEmptyText: { fontSize: 14, color: C.muted, fontWeight: "600" },
  dropdownItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: "#1a3a5c",
  },
  dropdownItemActive: { backgroundColor: "#1a3a5c" },
  dropdownItemText: { fontSize: 15, color: C.text },
  messageInput: {
    backgroundColor: "#0f2035", borderRadius: 12,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: C.text, minHeight: 100,
  },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 24 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: C.border, alignItems: "center",
  },
  cancelBtnText: { color: C.muted, fontSize: 15, fontWeight: "600" },
  sendBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: "#2F6E8E", alignItems: "center" },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
});