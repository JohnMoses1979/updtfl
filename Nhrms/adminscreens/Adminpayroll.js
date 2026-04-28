


// import React, { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   StatusBar,
//   Modal,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// // ADD this import at the top of the file:
// import { BASE_URL } from "../api/config";

// const C = {
//   bg: "#112235",
//   darkBrown: "#0f1e30",
//   card: "#221508",
//   cardBorder: "#3A2510",
//   text: "#F0EDE8",
//   muted: "#7A7570",
//   mutedLight: "#9A8A80",
//   red: "#FF4D6D",
// };
// const ACCENT_COLORS = [
//   "#2F6E8E", "#4D6FFF", "#9B59B6", "#27AE60",
//   "#E74C3C", "#F39C12", "#2DD4BF", "#FF6B9D",
// ];
// const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
// const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// // Month names as returned by Java's Month.of(n).name()
// const JAVA_MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
// function initials(name) {
//   return name.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
// }
// // ─── Employee Payroll Row ─────────────────────────────────────────────────────
// function EmpPayrollRow({ emp }) {
//   return (
//     <View style={styles.empRow}>
//       <View style={[styles.avatar, { backgroundColor: emp.color }]}>
//         <Text style={styles.avatarText}>{initials(emp.name)}</Text>
//       </View>
//       <View style={styles.empInfo}>
//         <Text style={styles.empName}>{emp.name}</Text>
//         <Text style={styles.empCode}>{emp.empCode}</Text>
//         <Text style={styles.empSalaryLabel}>
//           Basic:{" "}
//           <Text style={[styles.empSalaryValue, { color: "#2F6E8E" }]}>
//             ₹{emp.basicSalary}
//           </Text>
//         </Text>
//         <Text style={styles.empSalaryLabel}>
//           Days Present:{" "}
//           <Text style={[styles.empSalaryValue, { color: "#2DD4BF" }]}>
//             {emp.presentDays}
//           </Text>
//         </Text>
//       </View>
//       <View style={styles.paidBlock}>
//         <Text style={styles.paidMonth}>{emp.paidMonth}</Text>
//         <Text style={styles.paidLabel}>
//           Net Paid:{"\n"}
//           <Text style={[styles.paidValue, { color: "#2F6E8E" }]}>
//             ₹{emp.netSalary}
//           </Text>
//         </Text>
//         {/* Status badge */}
//         {emp.noData ? (
//           <View style={[styles.badge, { backgroundColor: "#3A2510" }]}>
//             <Text style={[styles.badgeText, { color: "#F39C12" }]}>No Data</Text>
//           </View>
//         ) : (
//           <View style={[styles.badge, { backgroundColor: "#0d2e1a" }]}>
//             <Text style={[styles.badgeText, { color: "#2DD4BF" }]}>Paid</Text>
//           </View>
//         )}
//       </View>
//     </View>
//   );
// }
// // ─── Main Screen ─────────────────────────────────────────────────────────────
// export default function AdminPayrollScreen({ onBack }) {
//   const today = new Date();
//   const [viewYear, setViewYear] = useState(today.getFullYear());
//   const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-based
//   const [employees, setEmployees] = useState([]);  // raw employee list
//   const [payrollRows, setPayrollRows] = useState([]);  // mapped rows for display
//   const [loading, setLoading] = useState(false);
//   const [calendarVisible, setCalendarVisible] = useState(false);
//   const isFutureMonth = (month, year) => {
//     const now = new Date();
//     const currentMonth = now.getMonth() + 1;
//     const currentYear = now.getFullYear();
//     return year > currentYear || (year === currentYear && month > currentMonth);
//   };
//   // ── 1. Fetch all employees once on mount ──────────────────────────────────
//   useEffect(() => {
//     fetchAllEmployees();
//   }, []);
//   const fetchAllEmployees = async () => {
//     try {
//       const res = await fetch(`${BASE_URL}/api/payslip/all-employees`);
//       // If you don't have a /all-employees endpoint yet, fall back to
//       // fetching employee IDs 1–10 (common during dev) — replace with
//       // your actual endpoint when ready.
//       if (!res.ok) {
//         // fallback: try a fixed list of IDs you know exist
//         fetchPayslipsForIds([1, 2, 3], viewMonth + 1, viewYear);
//         return;
//       }
//       const data = await res.json(); // expects [{id, name, empCode}, ...]
//       setEmployees(data);
//     } catch (err) {
//       console.log("fetchAllEmployees error:", err);
//       // Graceful fallback — attempt fixed IDs so the screen isn't blank
//       fetchPayslipsForIds([1], viewMonth + 1, viewYear);
//     }
//   };
//   // ── 2. Re-fetch payslips whenever month/year or employee list changes ─────
//   useEffect(() => {
//     if (employees.length > 0) {
//       fetchPayslipsForMonth(employees, viewMonth + 1, viewYear);
//     }
//   }, [employees, viewMonth, viewYear]);
//   // ── Fetch payslip for every employee for the selected month ──────────────
//   const fetchPayslipsForMonth = useCallback(async (empList, month, year) => {
//     // 🚨 NEW: If future month → don't show any cards
//     if (isFutureMonth(month, year)) {
//       setPayrollRows([]);  // empty list
//       return;
//     }
//     setLoading(true);
//     try {
//       const results = await Promise.all(
//         empList.map((emp, idx) =>
//           fetch(`${BASE_URL}/api/payslip/${emp.id}/${month}/${year}`)
//             .then(r => r.json())
//             .then(data => buildRow(emp, data, idx, month, year))
//             .catch(() => null) // ❌ don't build "no data row"
//         )
//       );
//       // 🚨 NEW: Remove nulls (employees with no data)
//       const filtered = results.filter(r => r && !r.noData);
//       setPayrollRows(filtered);
//     } catch (err) {
//       console.log("fetchPayslipsForMonth error:", err);
//       Alert.alert("Error", "Could not load payroll data.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);
//   // Fallback when /all-employees doesn't exist yet
//   const fetchPayslipsForIds = async (ids, month, year) => {
//     setLoading(true);
//     try {
//       const results = await Promise.all(
//         ids.map((id, idx) =>
//           fetch(`${BASE_URL}/api/payslip/${id}/${month}/${year}`)
//             .then(r => r.json())
//             .then(data => {
//               const emp = { id, name: data.employeeName || `Emp #${id}`, empCode: data.empCode || "-" };
//               return buildRow(emp, data, idx, month, year);
//             })
//             .catch(() => ({
//               id: String(id), name: `Employee #${id}`, empCode: "-",
//               basicSalary: "0.00", netSalary: "0.00", presentDays: 0,
//               paidMonth: `${MONTHS_SHORT[month - 1]} ${year}`,
//               color: ACCENT_COLORS[idx % ACCENT_COLORS.length], noData: true,
//             }))
//         )
//       );
//       setPayrollRows(results);
//     } finally {
//       setLoading(false);
//     }
//   };
//   // ── Map API response → display row ────────────────────────────────────────
//   const buildRow = (emp, data, idx, month, year) => {
//     // data may be a payslip or a "no attendance" object
//     const hasData = data && data.earnedSalary !== undefined && data.earnedSalary > 0;
//     return {
//       id: String(emp.id),
//       name: data.employeeName || emp.name || `Emp #${emp.id}`,
//       empCode: data.empCode || emp.empCode || "-",
//       basicSalary: hasData ? data.basicSalary?.toFixed(2) : "0.00",
//       netSalary: hasData ? data.netSalary?.toFixed(2) : "0.00",
//       earnedSalary: hasData ? data.earnedSalary?.toFixed(2) : "0.00",
//       presentDays: data.presentDays || 0,
//       paidMonth: `${MONTHS_SHORT[month - 1]} ${year}`,
//       color: ACCENT_COLORS[idx % ACCENT_COLORS.length],
//       noData: !hasData,
//     };
//   };
//   const buildNoDataRow = (emp, idx, month, year) => ({
//     id: String(emp.id),
//     name: emp.name || `Emp #${emp.id}`,
//     empCode: emp.empCode || "-",
//     basicSalary: "0.00",
//     netSalary: "0.00",
//     earnedSalary: "0.00",
//     presentDays: 0,
//     paidMonth: `${MONTHS_SHORT[month - 1]} ${year}`,
//     color: ACCENT_COLORS[idx % ACCENT_COLORS.length],
//     noData: true,
//   });
//   // ── Summary numbers ───────────────────────────────────────────────────────
//   const totalPayroll = payrollRows.reduce((s, r) => s + parseFloat(r.netSalary || 0), 0);
//   const paidCount = payrollRows.filter(r => !r.noData).length;
//   // ── Month navigation ──────────────────────────────────────────────────────
//   const prevMonth = () => {
//     if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
//     else setViewMonth(m => m - 1);
//   };
//   const nextMonth = () => {
//     if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
//     else setViewMonth(m => m + 1);
//   };
//   // ─────────────────────────────────────────────────────────────────────────
//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle="light-content" backgroundColor={C.bg} />
//       {/* ── Header ── */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
//           <Text style={styles.backArrow}>‹</Text>
//           <Text style={styles.backLabel}>Admin</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Payroll</Text>
//         {/* Year navigator */}
//         <View style={styles.yearNav}>
//           <TouchableOpacity onPress={() => setViewYear(y => y - 1)} style={styles.yearArrow}>
//             <Text style={styles.yearArrowTxt}>‹</Text>
//           </TouchableOpacity>
//           <Text style={styles.yearTxt}>{viewYear}</Text>
//           <TouchableOpacity onPress={() => setViewYear(y => y + 1)} style={styles.yearArrow}>
//             <Text style={styles.yearArrowTxt}>›</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//       {/* ── Month tab strip ── */}
//       <View style={styles.monthStrip}>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthScroll}>
//           {MONTHS_SHORT.map((m, i) => (
//             <TouchableOpacity
//               key={i}
//               style={styles.monthTab}
//               onPress={() => setViewMonth(i)}
//               activeOpacity={0.7}
//             >
//               <Text style={[styles.monthTabText, i === viewMonth && styles.monthTabActive]}>{m}</Text>
//               {i === viewMonth && <View style={styles.monthUnderline} />}
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>
//       <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
//         {/* ── Period header ── */}
//         <View style={styles.periodCard}>
//           <Text style={styles.periodTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
//           <TouchableOpacity onPress={() => fetchPayslipsForMonth(employees, viewMonth + 1, viewYear)}>
//             <Text style={{ color: "#2F6E8E", fontSize: 13, fontWeight: "700" }}>↻ Refresh</Text>
//           </TouchableOpacity>
//         </View>
//         {/* ── Loading ── */}
//         {loading ? (
//           <View style={styles.centered}>
//             <ActivityIndicator size="large" color="#2F6E8E" />
//             <Text style={[styles.emptyText, { marginTop: 12 }]}>Loading payroll…</Text>
//           </View>
//         ) : payrollRows.length === 0 ? (
//           <View style={styles.emptyState}>
//             <Text style={styles.emptyEmoji}>💼</Text>
//             <Text style={styles.emptyText}>No payroll data</Text>
//             <Text style={styles.emptySubtext}>
//               Payroll not generated for this month
//             </Text>
//           </View>
//         ) : (
//           <>
//             {payrollRows.map(emp => (
//               <EmpPayrollRow key={emp.id} emp={emp} />
//             ))}
//             {/* ── Summary card ── */}
//             <View style={styles.summaryCard}>
//               <View style={styles.summaryRow}>
//                 <Text style={styles.summaryLabel}>Total Net Payroll</Text>
//                 <Text style={styles.summaryValue}>₹{totalPayroll.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</Text>
//               </View>
//               <View style={styles.summaryRow}>
//                 <Text style={styles.summaryLabel}>Employees with Data</Text>
//                 <Text style={[styles.summaryValue, { color: "#2DD4A0" }]}>
//                   {paidCount} / {payrollRows.length}
//                 </Text>
//               </View>
//             </View>
//             {/* <TouchableOpacity style={styles.runBtn} activeOpacity={0.85}>
//               <Text style={styles.runBtnText}>Run Payroll for {MONTHS_SHORT[viewMonth]} {viewYear}</Text>
//             </TouchableOpacity> */}
//           </>
//         )}
//         <View style={{ height: 40 }} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
// // ─── Styles ───────────────────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: C.darkBrown },
//   header: {
//     flexDirection: "row", alignItems: "center", justifyContent: "space-between",
//     paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14,
//     backgroundColor: C.darkBrown,
//   },
//   backBtn: { flexDirection: "row", alignItems: "center", gap: 2, minWidth: 60 },
//   backArrow: { fontSize: 28, color: "#2F6E8E", lineHeight: 30, marginTop: -2 },
//   backLabel: { fontSize: 15, color: "#2F6E8E", fontWeight: "600" },
//   headerTitle: { fontSize: 22, fontWeight: "800", color: C.text },
//   yearNav: { flexDirection: "row", alignItems: "center", gap: 6 },
//   yearArrow: { padding: 4 },
//   yearArrowTxt: { fontSize: 20, color: "#2F6E8E", fontWeight: "700" },
//   yearTxt: { fontSize: 14, color: C.text, fontWeight: "700", minWidth: 36, textAlign: "center" },
//   monthStrip: { backgroundColor: C.darkBrown, borderBottomWidth: 1, borderBottomColor: "#1a3a5c" },
//   monthScroll: { paddingHorizontal: 16, gap: 4 },
//   monthTab: { paddingHorizontal: 14, paddingVertical: 10, alignItems: "center" },
//   monthTabText: { fontSize: 14, fontWeight: "600", color: C.muted },
//   monthTabActive: { color: "#2F6E8E" },
//   monthUnderline: { height: 2.5, backgroundColor: "#2F6E8E", borderRadius: 2, width: "100%", marginTop: 4 },
//   body: { flex: 1, backgroundColor: C.bg },
//   periodCard: {
//     flexDirection: "row", alignItems: "center", justifyContent: "space-between",
//     backgroundColor: C.card, marginHorizontal: 16, marginTop: 16,
//     borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.cardBorder,
//   },
//   periodTitle: { fontSize: 17, fontWeight: "800", color: C.text },
//   centered: { alignItems: "center", paddingTop: 60 },
//   emptyState: { alignItems: "center", paddingTop: 60, gap: 10 },
//   emptyEmoji: { fontSize: 44 },
//   emptyText: { fontSize: 17, color: C.mutedLight, fontWeight: "700" },
//   emptySubtext: { fontSize: 13, color: C.muted, textAlign: "center", paddingHorizontal: 24 },
//   // ── Employee row ──
//   empRow: {
//     flexDirection: "row", alignItems: "flex-start",
//     backgroundColor: C.card, marginHorizontal: 16, marginTop: 10,
//     borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.cardBorder,
//   },
//   avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginRight: 14, marginTop: 2 },
//   avatarText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
//   empInfo: { flex: 1, gap: 3 },
//   empName: { fontSize: 15, fontWeight: "700", color: C.text },
//   empCode: { fontSize: 11, color: C.muted },
//   empSalaryLabel: { fontSize: 12, color: C.mutedLight, marginTop: 2 },
//   empSalaryValue: { fontWeight: "700" },
//   paidBlock: { alignItems: "flex-end", gap: 4, minWidth: 90 },
//   paidMonth: { fontSize: 11, color: C.muted },
//   paidLabel: { fontSize: 12, color: C.mutedLight, textAlign: "right" },
//   paidValue: { fontWeight: "700", fontSize: 14 },
//   badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 2 },
//   badgeText: { fontSize: 11, fontWeight: "700" },
//   // ── Summary ──
//   summaryCard: {
//     backgroundColor: C.card, marginHorizontal: 16, marginTop: 20,
//     borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.cardBorder, gap: 10,
//   },
//   summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//   summaryLabel: { fontSize: 14, color: C.muted },
//   summaryValue: { fontSize: 16, fontWeight: "800", color: "#2F6E8E" },
//   runBtn: {
//     marginHorizontal: 16, marginTop: 16,
//     backgroundColor: "#2F6E8E", borderRadius: 14,
//     paddingVertical: 16, alignItems: "center",
//     shadowColor: "#2F6E8E", shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
//   },
//   runBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
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
export default function AdminPayroll({ onBack }) {
  const today = new Date();
  const initialPayrollMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const [viewYear, setViewYear] = useState(initialPayrollMonth.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialPayrollMonth.getMonth()); // 0-based
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
 