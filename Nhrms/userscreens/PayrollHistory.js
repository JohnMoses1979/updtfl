/**
 * userscreens/PayrollHistory.js
 * API: GET /api/payslip/{userId}/{month}/{year}  (per month)
 *      GET /api/payslip/all-employees (admin, not used here)
 * Uses UserContext for userId
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
} from "react-native";
import { useUser } from "../context/UserContext";
import { BASE_URL } from "../api/config";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Build list of last N months (newest first), excluding current month */
const generatePastMonths = (count = 12) => {
  const now = new Date();
  const result = [];
  for (let i = 1; i <= count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ month: d.getMonth() + 1, year: d.getFullYear() });
  }
  return result;
};

const PayrollHistory = ({ navigation }) => {
  const { user } = useUser();
  const userId = user?.userId ?? 1;
  const displayName = user?.name || "Employee";
  const displayEmpId = user?.empId || "—";
  const displayDesignation = user?.designation || "Employee";

  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  const fmt = (v) => `₹${Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const fetchAllHistory = useCallback(async () => {
    setLoading(true);
    const allMonths = generatePastMonths(12);
    const results = [];

    await Promise.all(
      allMonths.map(async ({ month, year }) => {
        try {
          const res = await fetch(`${BASE_URL}/api/payslip/${userId}/${month}/${year}`);
          if (!res.ok) return;
          const data = await res.json();
          if (data && data.earnedSalary && data.earnedSalary > 0) {
            results.push({
              monthIdx: month - 1,
              monthNum: month,
              year: String(year),
              monthName: MONTHS[month - 1],
              gross: data.earnedSalary,
              net: data.netSalary,
              presentDays: data.presentDays,
              empCode: data.empCode,
            });
          }
        } catch (_) {
          // skip silently
        }
      })
    );

    // Sort newest first
    results.sort((a, b) => {
      if (b.year !== a.year) return parseInt(b.year) - parseInt(a.year);
      return b.monthIdx - a.monthIdx;
    });

    setHistoryData(results);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchAllHistory(); }, [fetchAllHistory]);

  const years = [...new Set(historyData.map((r) => r.year))].sort((a, b) => b - a);
  if (years.length > 0 && !years.includes(selectedYear)) {
    setSelectedYear(years[0]);
  }

  const filteredData = historyData.filter((r) => r.year === selectedYear);
  const totalNet = filteredData.reduce((s, r) => s + (r.net || 0), 0);
  const avgNet = filteredData.length > 0 ? totalNet / filteredData.length : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#EFF6FF" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payroll History</Text>
          <TouchableOpacity onPress={fetchAllHistory} style={styles.refreshBtn}>
            <Text style={styles.refreshIcon}>↻</Text>
          </TouchableOpacity>
        </View>

        {/* Employee Info Strip */}
        <View style={styles.empInfoStrip}>
          <View style={styles.empInfoLeft}>
            <Text style={styles.empInfoName}>{displayName}</Text>
            <Text style={styles.empInfoSub}>{displayDesignation} · {displayEmpId}</Text>
          </View>
        </View>

        {/* Year Selector */}
        {years.length > 0 && (
          <>
            <View style={styles.sectionLabel}>
              <Text style={styles.sectionLabelText}>Select Year</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {years.map((yr) => (
                <TouchableOpacity
                  key={yr}
                  onPress={() => setSelectedYear(yr)}
                  style={[styles.yearChip, selectedYear === yr && styles.yearChipActive]}
                >
                  <Text style={[styles.yearChipText, selectedYear === yr && styles.yearChipTextActive]}>
                    {yr}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Summary Cards */}
        {!loading && filteredData.length > 0 && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Total ({selectedYear})</Text>
              <Text style={[styles.summaryCardAmount, styles.greenAmount]}>{fmt(totalNet)}</Text>
            </View>
            <View style={[styles.summaryCard, styles.summaryCardBlue]}>
              <Text style={styles.summaryCardLabel}>Avg Monthly</Text>
              <Text style={[styles.summaryCardAmount, styles.blueAmount]}>{fmt(avgNet)}</Text>
            </View>
          </View>
        )}

        {/* Chart — mini bar visualization */}
        {!loading && filteredData.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Net Salary Trend — {selectedYear}</Text>
            <View style={styles.miniChart}>
              {[...filteredData].reverse().map((item, i) => {
                const maxNet = Math.max(...filteredData.map((d) => d.net || 0), 1);
                const barH = ((item.net || 0) / maxNet) * 50;
                return (
                  <View key={i} style={styles.barWrapper}>
                    <View style={[styles.miniBar, { height: Math.max(barH, 4) }]} />
                    <Text style={styles.barLabel}>{item.monthName.slice(0, 1)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* History Table */}
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>
            Salary History · {selectedYear}
          </Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>MONTH</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: "right" }]}>GROSS</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: "right" }]}>NET</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "right" }]}>DAYS</Text>
          </View>

          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Loading payroll data…</Text>
            </View>
          ) : filteredData.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No records for {selectedYear}</Text>
              <Text style={styles.emptySubText}>Payroll data appears after check-out is recorded.</Text>
            </View>
          ) : (
            filteredData.map((item, index) => (
              <View
                key={`${item.year}-${item.monthIdx}`}
                style={[
                  styles.tableRow,
                  index === filteredData.length - 1 && styles.tableRowLast,
                ]}
              >
                <View style={{ flex: 2 }}>
                  <Text style={styles.monthName}>{item.monthName}</Text>
                  <Text style={styles.yearTag}>{item.presentDays} days present</Text>
                </View>
                <Text style={[styles.tableCell, { flex: 1.5, textAlign: "right" }]}>
                  {fmt(item.gross)}
                </Text>
                <Text style={[styles.tableCell, styles.netCell, { flex: 1.5, textAlign: "right" }]}>
                  {fmt(item.net)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: "right", color: "#6b7280" }]}>
                  {item.presentDays}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EFF6FF" },
  container: { flex: 1, backgroundColor: "#EFF6FF", paddingHorizontal: 20 },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingTop: 16, paddingBottom: 20,
  },
  backButton: { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  backArrow: { fontSize: 22, color: "#111827", fontWeight: "500" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  refreshBtn: {
    width: 36, height: 36, justifyContent: "center", alignItems: "center",
    backgroundColor: "#dbeafe", borderRadius: 10,
  },
  refreshIcon: { fontSize: 20, color: "#2563eb", fontWeight: "700" },
  empInfoStrip: {
    backgroundColor: "#ffffff", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14,
    borderWidth: 1, borderColor: "#e5e7eb",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  empInfoLeft: { flex: 1 },
  empInfoName: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 2 },
  empInfoSub: { fontSize: 12, color: "#6b7280" },
  sectionLabel: { marginBottom: 8 },
  sectionLabelText: { fontSize: 13, color: "#6b7280", fontWeight: "500" },
  yearChip: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#f3f4f6", marginRight: 8,
    borderWidth: 1.5, borderColor: "transparent",
  },
  yearChipActive: { backgroundColor: "#eff6ff", borderColor: "#2563eb" },
  yearChipText: { fontSize: 14, fontWeight: "600", color: "#6b7280" },
  yearChipTextActive: { color: "#2563eb" },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  summaryCard: {
    flex: 1, backgroundColor: "#f0fdf4",
    borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: "#bbf7d0",
  },
  summaryCardBlue: { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
  summaryCardLabel: { fontSize: 11, color: "#6b7280", fontWeight: "500", marginBottom: 6 },
  summaryCardAmount: { fontSize: 18, fontWeight: "800" },
  greenAmount: { color: "#16a34a" },
  blueAmount: { color: "#2563eb" },
  chartCard: {
    backgroundColor: "#ffffff", borderRadius: 16, padding: 16,
    marginBottom: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  chartTitle: { fontSize: 12, fontWeight: "600", color: "#9ca3af", marginBottom: 10 },
  miniChart: { flexDirection: "row", alignItems: "flex-end", height: 60, gap: 3 },
  barWrapper: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  miniBar: { width: "100%", borderRadius: 3, backgroundColor: "#bfdbfe", minHeight: 4 },
  barLabel: { fontSize: 7, color: "#9ca3af", marginTop: 3 },
  tableCard: {
    backgroundColor: "#ffffff", borderRadius: 18, padding: 18,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  tableTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 14 },
  tableHeader: {
    flexDirection: "row", paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: "#DBEAFE", marginBottom: 4,
  },
  tableHeaderCell: {
    fontSize: 10, fontWeight: "700", color: "#9ca3af",
    letterSpacing: 0.5, textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
  },
  tableRowLast: { borderBottomWidth: 0 },
  monthName: { fontSize: 13, fontWeight: "600", color: "#111827", marginBottom: 2 },
  yearTag: { fontSize: 11, color: "#9ca3af" },
  tableCell: { fontSize: 13, fontWeight: "600", color: "#374151" },
  netCell: { color: "#16a34a", fontWeight: "800" },
  loadingState: { alignItems: "center", paddingVertical: 30, gap: 12 },
  loadingText: { fontSize: 13, color: "#9ca3af" },
  emptyState: { alignItems: "center", paddingVertical: 30, gap: 8 },
  emptyIcon: { fontSize: 36 },
  emptyText: { fontSize: 14, color: "#6b7280", fontWeight: "600" },
  emptySubText: { fontSize: 12, color: "#9ca3af", textAlign: "center" },
});

export default PayrollHistory;