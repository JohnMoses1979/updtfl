/**
 * userscreens/SalaryBreakdown.js
 * API: GET /api/payslip/{userId}/{month}/{year}
 * Uses UserContext for userId
 */
import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
} from "react-native";
import { useUser } from "../context/UserContext";
import { BASE_URL } from "../api/config";

const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ProgressBar = ({ percentage, color }) => (
  <View style={styles.progressTrack}>
    <View style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%`, backgroundColor: color }]} />
  </View>
);

const SalaryBreakdown = ({ navigation }) => {
  const { user } = useUser();
  const userId = user?.userId ?? 1;

  const now = new Date();
  // Default to last month (payroll is typically for last month)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const [month] = useState(lastMonth.getMonth() + 1);
  const [year] = useState(lastMonth.getFullYear());

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayslip = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/payslip/${userId}/${month}/${year}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      if (!json || json.earnedSalary === 0) {
        setError(json?.message || "No payslip data for last month.");
      } else {
        setData(json);
      }
    } catch (err) {
      setError(err.message || "Failed to load salary breakdown");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayslip(); }, [userId]);

  const fmt = (v) => `₹${Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#112235" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2F6E8E" />
          <Text style={styles.loadingText}>Loading salary breakdown…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#112235" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>📊</Text>
          <Text style={styles.errorText}>{error || "No data available"}</Text>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const earned = data.earnedSalary ?? 0;
  const basic = data.basicSalary ?? 0;
  const hra = data.hra ?? 0;
  const transport = data.transport ?? 0;
  const specialAllow = data.specialAllowance ?? 0;
  const tax = data.tax ?? 0;
  const insurance = data.insurance ?? 0;
  const totalDeductions = data.totalDeductions ?? (tax + insurance);
  const netSalary = data.netSalary ?? (earned - totalDeductions);
  const presentDays = data.presentDays ?? 0;
  const perDayRate = data.perDayRate ?? 612;
  const monthLabel = `${MONTHS_FULL[month - 1]} ${year}`;

  const earnings = [
    { label: "Basic Salary (50%)", amount: fmt(basic), percentage: earned > 0 ? (basic / earned) * 100 : 0, color: "#22c55e" },
    { label: "HRA (20%)", amount: fmt(hra), percentage: earned > 0 ? (hra / earned) * 100 : 0, color: "#86efac" },
    { label: "Transport (10%)", amount: fmt(transport), percentage: earned > 0 ? (transport / earned) * 100 : 0, color: "#4ade80" },
    { label: "Special Allowance (20%)", amount: fmt(specialAllow), percentage: earned > 0 ? (specialAllow / earned) * 100 : 0, color: "#bbf7d0" },
  ];

  const deductions = [
    { label: "EPF", amount: fmt(tax), percentage: earned > 0 ? (tax / earned) * 100 : 0, color: "#f87171" },
    { label: "Insurance", amount: fmt(insurance), percentage: earned > 0 ? (insurance / earned) * 100 : 0, color: "#fca5a5" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#112235" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Salary Breakdown</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Employee Info */}
        <View style={styles.empCard}>
          <Text style={styles.empName}>{data.employeeName} · {data.empCode}</Text>
          <Text style={styles.empMeta}>
            {monthLabel} · {presentDays} days present @ ₹{perDayRate}/day
          </Text>
        </View>

        {/* Summary Cards */}
        // Replace the summaryRow section:
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.grossCard]}>
            <Text style={styles.summaryCardLabel}>Gross (CTC)</Text>
            <Text style={[styles.summaryCardAmount, styles.grossAmount]}>
              {fmt(data.grossSalary || earned)}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.deductionCard]}>
            <Text style={styles.summaryCardLabel}>Deductions</Text>
            <Text style={[styles.summaryCardAmount, styles.deductionAmount]}>{fmt(totalDeductions)}</Text>
          </View>
        </View>

        {/* Net Salary */}
        <View style={styles.netCard}>
          <Text style={styles.netLabel}>Net Salary</Text>
          <Text style={styles.netAmount}>{fmt(netSalary)}</Text>
        </View>

        {/* Earnings Breakdown */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitleIcon}>💚</Text>
            <Text style={styles.cardTitle}>Earnings Breakdown</Text>
          </View>
          {earnings.map((item, i) => (
            <View key={i} style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <Text style={styles.breakdownLabel}>{item.label}</Text>
                <Text style={styles.breakdownMeta}>
                  {item.amount}
                  <Text style={styles.breakdownPercent}> · {item.percentage.toFixed(1)}%</Text>
                </Text>
              </View>
              <ProgressBar percentage={item.percentage} color={item.color} />
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Earnings</Text>
            <Text style={[styles.totalAmount, styles.grossAmount]}>{fmt(earned)}</Text>
          </View>
        </View>

        {/* Deductions Breakdown */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitleIcon}>🔴</Text>
            <Text style={styles.cardTitle}>Deductions Breakdown</Text>
          </View>
          {deductions.map((item, i) => (
            <View key={i} style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <Text style={styles.breakdownLabel}>{item.label}</Text>
                <Text style={styles.breakdownMeta}>
                  {item.amount}
                  <Text style={styles.breakdownPercent}> · {item.percentage.toFixed(2)}%</Text>
                </Text>
              </View>
              <ProgressBar percentage={item.percentage * 8} color={item.color} />
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Deductions</Text>
            <Text style={[styles.totalAmount, styles.deductionAmount]}>{fmt(totalDeductions)}</Text>
          </View>
        </View>

        {/* Attendance Summary */}
        <View style={[styles.card, styles.overtimeCard]}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitleIcon}>📅</Text>
            <Text style={[styles.cardTitle, styles.overtimeTitle]}>Attendance Summary</Text>
          </View>
          <View style={styles.overtimeRow}>
            <Text style={styles.overtimeLabel}>Days Present</Text>
            <Text style={styles.overtimeValue}>{presentDays} days</Text>
          </View>
          <View style={styles.overtimeRow}>
            <Text style={styles.overtimeLabel}>Per Day Rate</Text>
            <Text style={styles.overtimeValue}>₹{perDayRate}/day</Text>
          </View>
          <View style={[styles.overtimeRow, styles.overtimeLastRow]}>
            <Text style={styles.overtimeLabel}>Total Earned</Text>
            <Text style={styles.otPayValue}>{fmt(earned)}</Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#112235" },
  container: { flex: 1, backgroundColor: "#112235", paddingHorizontal: 20 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: "#9ca3af", fontSize: 14 },
  errorContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 30 },
  errorIcon: { fontSize: 48 },
  errorText: { color: "#9ca3af", fontSize: 14, textAlign: "center" },
  backBtn: { backgroundColor: "#1a3a5c", padding: 12, borderRadius: 10, marginTop: 10 },
  backBtnText: { color: "#2F6E8E", fontWeight: "600" },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingTop: 16, paddingBottom: 20,
  },
  backButton: { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  backArrow: { fontSize: 22, color: "#c7cddb", fontWeight: "500" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#c8cdd9" },
  empCard: { backgroundColor: "#1e3a5f", borderRadius: 14, padding: 14, marginBottom: 12 },
  empName: { fontSize: 15, fontWeight: "700", color: "#ffffff", marginBottom: 4 },
  empMeta: { fontSize: 12, color: "#93c5fd" },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: "center" },
  grossCard: { backgroundColor: "#eff6ff" },
  deductionCard: { backgroundColor: "#fff1f2" },
  summaryCardLabel: { fontSize: 12, color: "#6b7280", fontWeight: "500", marginBottom: 6 },
  summaryCardAmount: { fontSize: 20, fontWeight: "800" },
  grossAmount: { color: "#2563eb" },
  deductionAmount: { color: "#ef4444" },
  netCard: {
    backgroundColor: "#f0fdf4", borderRadius: 16, padding: 16,
    alignItems: "center", marginBottom: 16,
    borderWidth: 1, borderColor: "#bbf7d0",
  },
  netLabel: { fontSize: 12, color: "#16a34a", fontWeight: "600", marginBottom: 4 },
  netAmount: { fontSize: 28, fontWeight: "800", color: "#111827" },
  card: {
    backgroundColor: "#ffffff", borderRadius: 18, padding: 18,
    marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 6 },
  cardTitleIcon: { fontSize: 16 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  breakdownItem: { marginBottom: 14 },
  breakdownHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 6,
  },
  breakdownLabel: { fontSize: 13, color: "#374151", fontWeight: "500" },
  breakdownMeta: { fontSize: 13, fontWeight: "600", color: "#111827" },
  breakdownPercent: { color: "#9ca3af", fontWeight: "400" },
  progressTrack: { height: 6, backgroundColor: "#DBEAFE", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  totalRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginTop: 8, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: "#DBEAFE",
  },
  totalLabel: { fontSize: 15, fontWeight: "700", color: "#111827" },
  totalAmount: { fontSize: 16, fontWeight: "800" },
  overtimeCard: { backgroundColor: "#eff6ff", borderWidth: 1, borderColor: "#bfdbfe" },
  overtimeTitle: { color: "#1d4ed8" },
  overtimeRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: "rgba(147,197,253,0.4)",
  },
  overtimeLastRow: { borderBottomWidth: 0 },
  overtimeLabel: { fontSize: 14, color: "#374151" },
  overtimeValue: { fontSize: 14, fontWeight: "600", color: "#2F6E8E" },
  otPayValue: { fontSize: 16, fontWeight: "800", color: "#22c55e" },
});

export default SalaryBreakdown;