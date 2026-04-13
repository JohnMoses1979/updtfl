// import React, { useState } from "react";
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
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// const C = {
//   bg:         '#112235',
//   darkBrown:  '#0f1e30',
//   deepBrown:  '#1a3a5c',
//   card:       "#2F6E8E",
//   cardBorder: "#3A2510",
//   orange:     '#3B82F6',
//   text:       "#F0EDE8",
//   muted:      "#7A7570",
//   mutedLight: "#9A8A80",
//   red:        "#FF4D6D",
// };
// const ACCENT_COLORS = ["#2F6E8E","#4D6FFF","#9B59B6","#27AE60","#E74C3C","#F39C12","#2DD4BF","#FF6B9D"];
// const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
// const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
// const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
// function initials(name) {
//   return name.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0,2).toUpperCase() || "?";
// }
// function getDaysInMonth(year, month) {
//   return new Date(year, month + 1, 0).getDate();
// }
// function getFirstDayOfMonth(year, month) {
//   return new Date(year, month, 1).getDay();
// }
// function CalendarGrid({ year, month, selectedDate, onSelectDate }) {
//   const daysInMonth = getDaysInMonth(year, month);
//   const firstDay = getFirstDayOfMonth(year, month);
//   const cells = [];
//   for (let i = 0; i < firstDay; i++) cells.push(null);
//   for (let d = 1; d <= daysInMonth; d++) cells.push(d);
//   const today = new Date();
//   const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
//   return (
//     <View style={calStyles.grid}>
//       {DAYS_SHORT.map(d => (
//         <Text key={d} style={calStyles.dayHeader}>{d}</Text>
//       ))}
//       {cells.map((day, i) => {
//         const isToday = isCurrentMonth && day === today.getDate();
//         const isSelected = day === selectedDate;
//         return (
//           <TouchableOpacity
//             key={i}
//             style={[
//               calStyles.cell,
//               isSelected && calStyles.cellSelected,
//               isToday && !isSelected && calStyles.cellToday,
//             ]}
//             onPress={() => day && onSelectDate(day)}
//             activeOpacity={day ? 0.7 : 1}
//             disabled={!day}
//           >
//             <Text style={[
//               calStyles.cellText,
//               isSelected && calStyles.cellTextSelected,
//               isToday && !isSelected && calStyles.cellTextToday,
//               !day && { opacity: 0 },
//             ]}>
//               {day || ""}
//             </Text>
//           </TouchableOpacity>
//         );
//       })}
//     </View>
//   );
// }
// const calStyles = StyleSheet.create({
//   grid:      { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 4 },
//   dayHeader: { width: "14.28%", textAlign: "center", fontSize: 11, color: C.muted, fontWeight: "600", paddingVertical: 5 },
//   cell:      { width: "14.28%", aspectRatio: 1, alignItems: "center", justifyContent: "center" },
//   cellSelected:   { backgroundColor: "#2F6E8E", borderRadius: 999 },
//   cellToday:      { borderWidth: 1.5, borderColor: "#2F6E8E", borderRadius: 999 },
//   cellText:       { fontSize: 12, color: C.mutedLight, fontWeight: "500" },
//   cellTextSelected: { color: "#FFF", fontWeight: "700" },
//   cellTextToday:  { color: "#2F6E8E", fontWeight: "700" },
// });
// function EmpPayrollRow({ emp, onDelete }) {
//   return (
//     <View style={styles.empRow}>
//       <View style={[styles.avatar, { backgroundColor: emp.color }]}>
//         <Text style={styles.avatarText}>{initials(emp.name)}</Text>
//       </View>
//       <View style={styles.empInfo}>
//         <Text style={styles.empName}>{emp.name}</Text>
//         <Text style={styles.empSalaryLabel}>
//           Basic Salary:{" "}
//           <Text style={[styles.empSalaryValue, { color: "#2F6E8E" }]}>{emp.salary}</Text>
//         </Text>
//       </View>
//       <View style={styles.paidBlock}>
//         <Text style={styles.paidMonth}>{emp.paidMonth}</Text>
//         <Text style={styles.paidLabel}>
//           Paid: <Text style={[styles.paidValue, { color: "#2F6E8E" }]}>{emp.paid}</Text>
//         </Text>
//         <TouchableOpacity onPress={onDelete} style={{ marginTop: 4 }}>
//           <Text style={{ color: C.red, fontSize: 11, fontWeight: "700" }}>✕ Remove</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }
// export default function AdminPayrollScreen({ onBack }) {
//   const today = new Date();
//   const [viewYear, setViewYear]   = useState(today.getFullYear());
//   const [viewMonth, setViewMonth] = useState(today.getMonth());
//   const [selectedDate, setSelectedDate] = useState(today.getDate());
//   const [calendarVisible, setCalendarVisible] = useState(false);
//   // payroll records keyed by "YYYY-MM" month
//   const [monthRecords, setMonthRecords] = useState({});
//   const [addModalVisible, setAddModalVisible] = useState(false);
//   const [form, setForm] = useState({ name: "", salary: "", paid: "" });
//   const monthKey = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}`;
//   const employees = monthRecords[monthKey] || [];
//   const totalPayroll = employees.reduce((sum, e) => {
//     const n = parseFloat((e.paid || "0").replace(/[^0-9.]/g, "")) || 0;
//     return sum + n;
//   }, 0);
//   const prevMonth = () => {
//     if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); }
//     else setViewMonth(m => m-1);
//     setSelectedDate(1);
//   };
//   const nextMonth = () => {
//     if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); }
//     else setViewMonth(m => m+1);
//     setSelectedDate(1);
//   };
//   const handleAdd = () => {
//     if (!form.name.trim()) return;
//     const idx = employees.length;
//     const newEmp = {
//       id: Date.now().toString(),
//       name: form.name.trim(),
//       salary: form.salary.trim() ? `$${form.salary.trim()}` : "—",
//       paid: form.paid.trim() ? `$${form.paid.trim()}` : "—",
//       paidMonth: `${MONTHS_SHORT[viewMonth]} ${viewYear}`,
//       color: ACCENT_COLORS[idx % ACCENT_COLORS.length],
//     };
//     setMonthRecords(prev => ({
//       ...prev,
//       [monthKey]: [...(prev[monthKey] || []), newEmp],
//     }));
//     setForm({ name: "", salary: "", paid: "" });
//     setAddModalVisible(false);
//   };
//   const handleDelete = (id) => {
//     setMonthRecords(prev => ({
//       ...prev,
//       [monthKey]: (prev[monthKey] || []).filter(e => e.id !== id),
//     }));
//   };
//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle="light-content" backgroundColor={C.bg} />
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
//           <Text style={styles.backArrow}>‹</Text>
//           <Text style={styles.backLabel}>Admin</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Payroll</Text>
//         <TouchableOpacity style={styles.monthPill} onPress={() => setCalendarVisible(true)}>
//           <Text style={styles.monthPillText}>{MONTHS_SHORT[viewMonth]} {viewYear}</Text>
//           <Text style={styles.monthPillChevron}>▾</Text>
//         </TouchableOpacity>
//       </View>
//       {/* Month tabs */}
//       <View style={styles.monthStrip}>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthScroll}>
//           {MONTHS_SHORT.map((m, i) => (
//             <TouchableOpacity
//               key={i}
//               style={styles.monthTab}
//               onPress={() => { setViewMonth(i); setSelectedDate(1); }}
//               activeOpacity={0.7}
//             >
//               <Text style={[styles.monthTabText, i === viewMonth && styles.monthTabActive]}>{m}</Text>
//               {i === viewMonth && <View style={styles.monthUnderline} />}
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>
//       <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
//         {/* Period card */}
//         <View style={styles.periodCard}>
//           <Text style={styles.periodTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
//           <TouchableOpacity onPress={() => setAddModalVisible(true)}>
//             <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>+ Add</Text>
//           </TouchableOpacity>
//         </View>
//         {employees.length === 0 ? (
//           <View style={styles.emptyState}>
//             <Text style={styles.emptyEmoji}>💼</Text>
//             <Text style={styles.emptyText}>No payroll records</Text>
//             <Text style={styles.emptySubtext}>Tap "+ Add" to add an employee</Text>
//           </View>
//         ) : (
//           employees.map((emp) => (
//             <EmpPayrollRow key={emp.id} emp={emp} onDelete={() => handleDelete(emp.id)} />
//           ))
//         )}
//         {employees.length > 0 && (
//           <>
//             <View style={styles.summaryCard}>
//               <View style={styles.summaryRow}>
//                 <Text style={styles.summaryLabel}>Total Payroll</Text>
//                 <Text style={styles.summaryValue}>${totalPayroll.toLocaleString()}</Text>
//               </View>
//               <View style={styles.summaryRow}>
//                 <Text style={styles.summaryLabel}>Employees Paid</Text>
//                 <Text style={[styles.summaryValue, { color: "#2DD4A0" }]}>{employees.length} / {employees.length}</Text>
//               </View>
//             </View>
//             <TouchableOpacity style={styles.runBtn} activeOpacity={0.85}>
//               <Text style={styles.runBtnText}>Run Payroll</Text>
//             </TouchableOpacity>
//           </>
//         )}
//         <View style={{ height: 32 }} />
//       </ScrollView>
//       {/* Calendar Modal */}
//       <Modal visible={calendarVisible} transparent animationType="fade" onRequestClose={() => setCalendarVisible(false)}>
//         <TouchableOpacity style={styles.calModalBackdrop} activeOpacity={1} onPress={() => setCalendarVisible(false)}>
//           <View style={styles.calModalCard} onStartShouldSetResponder={() => true}>
//             {/* Cal Nav */}
//             <View style={styles.calNavRow}>
//               <TouchableOpacity onPress={prevMonth} style={{ padding: 8 }}>
//                 <Text style={styles.calNavArrow}>‹</Text>
//               </TouchableOpacity>
//               <Text style={styles.calNavTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
//               <TouchableOpacity onPress={nextMonth} style={{ padding: 8 }}>
//                 <Text style={styles.calNavArrow}>›</Text>
//               </TouchableOpacity>
//             </View>
//             <CalendarGrid
//               year={viewYear}
//               month={viewMonth}
//               selectedDate={selectedDate}
//               onSelectDate={(d) => { setSelectedDate(d); setCalendarVisible(false); }}
//             />
//             <TouchableOpacity style={styles.calDoneBtn} onPress={() => setCalendarVisible(false)}>
//               <Text style={styles.calDoneBtnText}>Done</Text>
//             </TouchableOpacity>
//           </View>
//         </TouchableOpacity>
//       </Modal>
//       {/* Add Payroll Entry Modal */}
//       <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
//         <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
//           <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setAddModalVisible(false)} />
//           <View style={styles.modalSheet}>
//             <View style={styles.sheetHandle} />
//             <Text style={styles.sheetTitle}>Add Payroll Entry</Text>
//             <Text style={styles.sheetSubtitle}>{MONTHS[viewMonth]} {viewYear}</Text>
//             {[
//               { label: "Employee Name *", key: "name", placeholder: "Full name" },
//               { label: "Basic Salary ($)", key: "salary", placeholder: "e.g. 3000", keyboardType: "numeric" },
//               { label: "Amount Paid ($)", key: "paid", placeholder: "e.g. 3000", keyboardType: "numeric" },
//             ].map(({ label, key, placeholder, keyboardType }) => (
//               <View key={key} style={{ marginBottom: 14 }}>
//                 <Text style={styles.fieldLabel}>{label}</Text>
//                 <TextInput
//                   style={styles.fieldInput}
//                   placeholder={placeholder}
//                   placeholderTextColor={C.muted}
//                   value={form[key]}
//                   onChangeText={(val) => setForm(prev => ({ ...prev, [key]: val }))}
//                   keyboardType={keyboardType || "default"}
//                 />
//               </View>
//             ))}
//             <View style={styles.modalActions}>
//               <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModalVisible(false)}>
//                 <Text style={styles.cancelBtnText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.saveBtn, !form.name.trim() && styles.saveBtnDisabled]}
//                 onPress={handleAdd}
//                 activeOpacity={0.85}
//               >
//                 <Text style={styles.saveBtnText}>Add Entry</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>
//     </SafeAreaView>
//   );
// }
// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: C.darkBrown },
//   header: {
//     flexDirection: "row", alignItems: "center", justifyContent: "space-between",
//     paddingHorizontal: 20, paddingTop: 29, paddingBottom: 14,
//     backgroundColor: C.darkBrown,
//   },
//   backBtn:   { flexDirection: "row", alignItems: "center", gap: 2, minWidth: 60 },
//   backArrow: { fontSize: 28, color: "#2F6E8E", lineHeight: 30, marginTop: -2 },
//   backLabel: { fontSize: 15, color: "#2F6E8E", fontWeight: "600" },
//   headerTitle: { fontSize: 22, fontWeight: "800", color: C.text },
//   monthPill: {
//     flexDirection: "row", alignItems: "center", gap: 6,
//     backgroundColor: "#1a3a5c", borderRadius: 20,
//     paddingHorizontal: 14, paddingVertical: 8,
//     borderWidth: 1, borderColor: "#3A2510",
//   },
//   monthPillText:    { color: C.text, fontWeight: "600", fontSize: 14 },
//   monthPillChevron: { color: C.text, fontSize: 12 },
//   monthStrip:  { backgroundColor: C.darkBrown, borderBottomWidth: 1, borderBottomColor: "#1a3a5c" },
//   monthScroll: { paddingHorizontal: 16, gap: 4 },
//   monthTab:    { paddingHorizontal: 14, paddingVertical: 10, alignItems: "center" },
//   monthTabText:   { fontSize: 14, fontWeight: "600", color: C.muted },
//   monthTabActive: { color: "#2F6E8E" },
//   monthUnderline: { height: 2.5, backgroundColor: "#2F6E8E", borderRadius: 2, width: "100%", marginTop: 4 },
//   body: { flex: 1, backgroundColor: C.bg },
//   periodCard: {
//     flexDirection: "row", alignItems: "center", justifyContent: "space-between",
//     backgroundColor: C.card, marginHorizontal: 16, marginTop: 16,
//     borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.cardBorder,
//   },
//   periodTitle: { fontSize: 17, fontWeight: "800", color: C.text },
//   emptyState: { alignItems: "center", paddingTop: 60, gap: 10 },
//   emptyEmoji: { fontSize: 44 },
//   emptyText:  { fontSize: 17, color: C.mutedLight, fontWeight: "700" },
//   emptySubtext: { fontSize: 13, color: C.muted },
//   empRow: {
//     flexDirection: "row", alignItems: "center",
//     backgroundColor: C.card, marginHorizontal: 16, marginTop: 10,
//     borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.cardBorder,
//   },
//   avatar:    { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginRight: 14 },
//   avatarText:{ color: "#FFF", fontWeight: "700", fontSize: 14 },
//   empInfo:   { flex: 1, gap: 4 },
//   empName:   { fontSize: 15, fontWeight: "700", color: C.text },
//   empSalaryLabel: { fontSize: 13, color: C.mutedLight },
//   empSalaryValue: { fontWeight: "700" },
//   paidBlock: { alignItems: "flex-end", gap: 2 },
//   paidMonth: { fontSize: 11, color: C.muted },
//   paidLabel: { fontSize: 13, color: C.mutedLight },
//   paidValue: { fontWeight: "700" },
//   summaryCard: {
//     backgroundColor: C.card, marginHorizontal: 16, marginTop: 20,
//     borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.cardBorder, gap: 10,
//   },
//   summaryRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//   summaryLabel: { fontSize: 14, color: C.muted },
//   summaryValue: { fontSize: 16, fontWeight: "800", color: "#2F6E8E" },
//   runBtn: {
//     marginHorizontal: 16, marginTop: 16,
//     backgroundColor: "#2F6E8E", borderRadius: 14,
//     paddingVertical: 16, alignItems: "center",
//     shadowColor: "#2F6E8E", shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
//   },
//   runBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
//   /* Calendar Modal */
//   calModalBackdrop: {
//     flex: 1, backgroundColor: "rgba(0,0,0,0.7)",
//     alignItems: "center", justifyContent: "center",
//   },
//   calModalCard: {
//     backgroundColor: "#0f1e30", borderRadius: 20,
//     padding: 16, width: "88%",
//     borderWidth: 1, borderColor: C.cardBorder,
//   },
//   calNavRow:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
//   calNavArrow: { fontSize: 24, color: "#2F6E8E", fontWeight: "700" },
//   calNavTitle: { fontSize: 16, fontWeight: "800", color: C.text },
//   calDoneBtn:  { marginTop: 12, backgroundColor: "#2F6E8E", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
//   calDoneBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
//   /* Add Modal */
//   modalOverlay:  { flex: 1, justifyContent: "flex-end" },
//   modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
//   modalSheet: {
//     backgroundColor: "#0f1e30", borderTopLeftRadius: 24, borderTopRightRadius: 24,
//     padding: 24, paddingBottom: 36,
//   },
//   sheetHandle:   { width: 40, height: 4, borderRadius: 2, backgroundColor: "#1a3a5c", alignSelf: "center", marginBottom: 20 },
//   sheetTitle:    { fontSize: 20, fontWeight: "800", color: C.text, marginBottom: 2 },
//   sheetSubtitle: { fontSize: 13, color: C.muted, marginBottom: 20 },
//   fieldLabel: { fontSize: 12, fontWeight: "600", color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
//   fieldInput: {
//     backgroundColor: "#0f2035", borderRadius: 12, borderWidth: 1, borderColor: "#1a3a5c",
//     paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: C.text,
//   },
//   modalActions: { flexDirection: "row", gap: 12, marginTop: 8 },
//   cancelBtn: {
//     flex: 1, paddingVertical: 14, borderRadius: 12,
//     borderWidth: 1, borderColor: "#1a3a5c", alignItems: "center",
//   },
//   cancelBtnText: { color: C.muted, fontSize: 15, fontWeight: "600" },
//   saveBtn:       { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: "#2F6E8E", alignItems: "center" },
//   saveBtnDisabled: { opacity: 0.4 },
//   saveBtnText:   { color: "#FFF", fontSize: 15, fontWeight: "700" },
// });











import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
// ADD this import at the top of the file:
import { BASE_URL } from "../api/config";

const C = {
  bg: "#112235",
  darkBrown: "#0f1e30",
  card: "#221508",
  cardBorder: "#3A2510",
  text: "#F0EDE8",
  muted: "#7A7570",
  mutedLight: "#9A8A80",
  red: "#FF4D6D",
};
const ACCENT_COLORS = [
  "#2F6E8E", "#4D6FFF", "#9B59B6", "#27AE60",
  "#E74C3C", "#F39C12", "#2DD4BF", "#FF6B9D",
];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Month names as returned by Java's Month.of(n).name()
const JAVA_MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
function initials(name) {
  return name.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}
// ─── Employee Payroll Row ─────────────────────────────────────────────────────
function EmpPayrollRow({ emp }) {
  return (
    <View style={styles.empRow}>
      <View style={[styles.avatar, { backgroundColor: emp.color }]}>
        <Text style={styles.avatarText}>{initials(emp.name)}</Text>
      </View>
      <View style={styles.empInfo}>
        <Text style={styles.empName}>{emp.name}</Text>
        <Text style={styles.empCode}>{emp.empCode}</Text>
        <Text style={styles.empSalaryLabel}>
          Basic:{" "}
          <Text style={[styles.empSalaryValue, { color: "#2F6E8E" }]}>
            ₹{emp.basicSalary}
          </Text>
        </Text>
        <Text style={styles.empSalaryLabel}>
          Days Present:{" "}
          <Text style={[styles.empSalaryValue, { color: "#2DD4BF" }]}>
            {emp.presentDays}
          </Text>
        </Text>
      </View>
      <View style={styles.paidBlock}>
        <Text style={styles.paidMonth}>{emp.paidMonth}</Text>
        <Text style={styles.paidLabel}>
          Net Paid:{"\n"}
          <Text style={[styles.paidValue, { color: "#2F6E8E" }]}>
            ₹{emp.netSalary}
          </Text>
        </Text>
        {/* Status badge */}
        {emp.noData ? (
          <View style={[styles.badge, { backgroundColor: "#3A2510" }]}>
            <Text style={[styles.badgeText, { color: "#F39C12" }]}>No Data</Text>
          </View>
        ) : (
          <View style={[styles.badge, { backgroundColor: "#0d2e1a" }]}>
            <Text style={[styles.badgeText, { color: "#2DD4BF" }]}>Paid</Text>
          </View>
        )}
      </View>
    </View>
  );
}
// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AdminPayrollScreen({ onBack }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-based
  const [employees, setEmployees] = useState([]);  // raw employee list
  const [payrollRows, setPayrollRows] = useState([]);  // mapped rows for display
  const [loading, setLoading] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const isFutureMonth = (month, year) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    return year > currentYear || (year === currentYear && month > currentMonth);
  };
  // ── 1. Fetch all employees once on mount ──────────────────────────────────
  useEffect(() => {
    fetchAllEmployees();
  }, []);
  const fetchAllEmployees = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/payslip/all-employees`);
      // If you don't have a /all-employees endpoint yet, fall back to
      // fetching employee IDs 1–10 (common during dev) — replace with
      // your actual endpoint when ready.
      if (!res.ok) {
        // fallback: try a fixed list of IDs you know exist
        fetchPayslipsForIds([1, 2, 3], viewMonth + 1, viewYear);
        return;
      }
      const data = await res.json(); // expects [{id, name, empCode}, ...]
      setEmployees(data);
    } catch (err) {
      console.log("fetchAllEmployees error:", err);
      // Graceful fallback — attempt fixed IDs so the screen isn't blank
      fetchPayslipsForIds([1], viewMonth + 1, viewYear);
    }
  };
  // ── 2. Re-fetch payslips whenever month/year or employee list changes ─────
  useEffect(() => {
    if (employees.length > 0) {
      fetchPayslipsForMonth(employees, viewMonth + 1, viewYear);
    }
  }, [employees, viewMonth, viewYear]);
  // ── Fetch payslip for every employee for the selected month ──────────────
  const fetchPayslipsForMonth = useCallback(async (empList, month, year) => {
    // 🚨 NEW: If future month → don't show any cards
    if (isFutureMonth(month, year)) {
      setPayrollRows([]);  // empty list
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.all(
        empList.map((emp, idx) =>
          fetch(`${BASE_URL}/api/payslip/${emp.id}/${month}/${year}`)
            .then(r => r.json())
            .then(data => buildRow(emp, data, idx, month, year))
            .catch(() => null) // ❌ don't build "no data row"
        )
      );
      // 🚨 NEW: Remove nulls (employees with no data)
      const filtered = results.filter(r => r && !r.noData);
      setPayrollRows(filtered);
    } catch (err) {
      console.log("fetchPayslipsForMonth error:", err);
      Alert.alert("Error", "Could not load payroll data.");
    } finally {
      setLoading(false);
    }
  }, []);
  // Fallback when /all-employees doesn't exist yet
  const fetchPayslipsForIds = async (ids, month, year) => {
    setLoading(true);
    try {
      const results = await Promise.all(
        ids.map((id, idx) =>
          fetch(`${BASE_URL}/api/payslip/${id}/${month}/${year}`)
            .then(r => r.json())
            .then(data => {
              const emp = { id, name: data.employeeName || `Emp #${id}`, empCode: data.empCode || "-" };
              return buildRow(emp, data, idx, month, year);
            })
            .catch(() => ({
              id: String(id), name: `Employee #${id}`, empCode: "-",
              basicSalary: "0.00", netSalary: "0.00", presentDays: 0,
              paidMonth: `${MONTHS_SHORT[month - 1]} ${year}`,
              color: ACCENT_COLORS[idx % ACCENT_COLORS.length], noData: true,
            }))
        )
      );
      setPayrollRows(results);
    } finally {
      setLoading(false);
    }
  };
  // ── Map API response → display row ────────────────────────────────────────
  const buildRow = (emp, data, idx, month, year) => {
    // data may be a payslip or a "no attendance" object
    const hasData = data && data.earnedSalary !== undefined && data.earnedSalary > 0;
    return {
      id: String(emp.id),
      name: data.employeeName || emp.name || `Emp #${emp.id}`,
      empCode: data.empCode || emp.empCode || "-",
      basicSalary: hasData ? data.basicSalary?.toFixed(2) : "0.00",
      netSalary: hasData ? data.netSalary?.toFixed(2) : "0.00",
      earnedSalary: hasData ? data.earnedSalary?.toFixed(2) : "0.00",
      presentDays: data.presentDays || 0,
      paidMonth: `${MONTHS_SHORT[month - 1]} ${year}`,
      color: ACCENT_COLORS[idx % ACCENT_COLORS.length],
      noData: !hasData,
    };
  };
  const buildNoDataRow = (emp, idx, month, year) => ({
    id: String(emp.id),
    name: emp.name || `Emp #${emp.id}`,
    empCode: emp.empCode || "-",
    basicSalary: "0.00",
    netSalary: "0.00",
    earnedSalary: "0.00",
    presentDays: 0,
    paidMonth: `${MONTHS_SHORT[month - 1]} ${year}`,
    color: ACCENT_COLORS[idx % ACCENT_COLORS.length],
    noData: true,
  });
  // ── Summary numbers ───────────────────────────────────────────────────────
  const totalPayroll = payrollRows.reduce((s, r) => s + parseFloat(r.netSalary || 0), 0);
  const paidCount = payrollRows.filter(r => !r.noData).length;
  // ── Month navigation ──────────────────────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backLabel}>Admin</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payroll</Text>
        {/* Year navigator */}
        <View style={styles.yearNav}>
          <TouchableOpacity onPress={() => setViewYear(y => y - 1)} style={styles.yearArrow}>
            <Text style={styles.yearArrowTxt}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.yearTxt}>{viewYear}</Text>
          <TouchableOpacity onPress={() => setViewYear(y => y + 1)} style={styles.yearArrow}>
            <Text style={styles.yearArrowTxt}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* ── Month tab strip ── */}
      <View style={styles.monthStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthScroll}>
          {MONTHS_SHORT.map((m, i) => (
            <TouchableOpacity
              key={i}
              style={styles.monthTab}
              onPress={() => setViewMonth(i)}
              activeOpacity={0.7}
            >
              <Text style={[styles.monthTabText, i === viewMonth && styles.monthTabActive]}>{m}</Text>
              {i === viewMonth && <View style={styles.monthUnderline} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* ── Period header ── */}
        <View style={styles.periodCard}>
          <Text style={styles.periodTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
          <TouchableOpacity onPress={() => fetchPayslipsForMonth(employees, viewMonth + 1, viewYear)}>
            <Text style={{ color: "#2F6E8E", fontSize: 13, fontWeight: "700" }}>↻ Refresh</Text>
          </TouchableOpacity>
        </View>
        {/* ── Loading ── */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#2F6E8E" />
            <Text style={[styles.emptyText, { marginTop: 12 }]}>Loading payroll…</Text>
          </View>
        ) : payrollRows.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💼</Text>
            <Text style={styles.emptyText}>No payroll data</Text>
            <Text style={styles.emptySubtext}>
              Payroll not generated for this month
            </Text>
          </View>
        ) : (
          <>
            {payrollRows.map(emp => (
              <EmpPayrollRow key={emp.id} emp={emp} />
            ))}
            {/* ── Summary card ── */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Net Payroll</Text>
                <Text style={styles.summaryValue}>₹{totalPayroll.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Employees with Data</Text>
                <Text style={[styles.summaryValue, { color: "#2DD4A0" }]}>
                  {paidCount} / {payrollRows.length}
                </Text>
              </View>
            </View>
            {/* <TouchableOpacity style={styles.runBtn} activeOpacity={0.85}>
              <Text style={styles.runBtnText}>Run Payroll for {MONTHS_SHORT[viewMonth]} {viewYear}</Text>
            </TouchableOpacity> */}
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.darkBrown },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14,
    backgroundColor: C.darkBrown,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 2, minWidth: 60 },
  backArrow: { fontSize: 28, color: "#2F6E8E", lineHeight: 30, marginTop: -2 },
  backLabel: { fontSize: 15, color: "#2F6E8E", fontWeight: "600" },
  headerTitle: { fontSize: 22, fontWeight: "800", color: C.text },
  yearNav: { flexDirection: "row", alignItems: "center", gap: 6 },
  yearArrow: { padding: 4 },
  yearArrowTxt: { fontSize: 20, color: "#2F6E8E", fontWeight: "700" },
  yearTxt: { fontSize: 14, color: C.text, fontWeight: "700", minWidth: 36, textAlign: "center" },
  monthStrip: { backgroundColor: C.darkBrown, borderBottomWidth: 1, borderBottomColor: "#1a3a5c" },
  monthScroll: { paddingHorizontal: 16, gap: 4 },
  monthTab: { paddingHorizontal: 14, paddingVertical: 10, alignItems: "center" },
  monthTabText: { fontSize: 14, fontWeight: "600", color: C.muted },
  monthTabActive: { color: "#2F6E8E" },
  monthUnderline: { height: 2.5, backgroundColor: "#2F6E8E", borderRadius: 2, width: "100%", marginTop: 4 },
  body: { flex: 1, backgroundColor: C.bg },
  periodCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: C.card, marginHorizontal: 16, marginTop: 16,
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.cardBorder,
  },
  periodTitle: { fontSize: 17, fontWeight: "800", color: C.text },
  centered: { alignItems: "center", paddingTop: 60 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyEmoji: { fontSize: 44 },
  emptyText: { fontSize: 17, color: C.mutedLight, fontWeight: "700" },
  emptySubtext: { fontSize: 13, color: C.muted, textAlign: "center", paddingHorizontal: 24 },
  // ── Employee row ──
  empRow: {
    flexDirection: "row", alignItems: "flex-start",
    backgroundColor: C.card, marginHorizontal: 16, marginTop: 10,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.cardBorder,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginRight: 14, marginTop: 2 },
  avatarText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  empInfo: { flex: 1, gap: 3 },
  empName: { fontSize: 15, fontWeight: "700", color: C.text },
  empCode: { fontSize: 11, color: C.muted },
  empSalaryLabel: { fontSize: 12, color: C.mutedLight, marginTop: 2 },
  empSalaryValue: { fontWeight: "700" },
  paidBlock: { alignItems: "flex-end", gap: 4, minWidth: 90 },
  paidMonth: { fontSize: 11, color: C.muted },
  paidLabel: { fontSize: 12, color: C.mutedLight, textAlign: "right" },
  paidValue: { fontWeight: "700", fontSize: 14 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 2 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  // ── Summary ──
  summaryCard: {
    backgroundColor: C.card, marginHorizontal: 16, marginTop: 20,
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.cardBorder, gap: 10,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 14, color: C.muted },
  summaryValue: { fontSize: 16, fontWeight: "800", color: "#2F6E8E" },
  runBtn: {
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: "#2F6E8E", borderRadius: 14,
    paddingVertical: 16, alignItems: "center",
    shadowColor: "#2F6E8E", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  runBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
});