/**
 * userscreens/EmployeeDashboard.js
 * API: GET /api/payroll/salary/{employeeId}
 * Uses UserContext for user info
 * Navigates to: ViewPayslip, SalaryBreakdown, PayrollHistory
 */
import React, { useEffect, useState } from "react";
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

const EmployeeDashboard = ({ navigation, onTabPress }) => {
  const { user } = useUser();
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(true);

  const displayName = user?.name || "Employee";
  const displayDesignation = user?.designation || "Employee";
  const displayEmpId = user?.empId || "—";
  const userId = user?.userId ?? 1;

  const fetchSalary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/payroll/salary/${userId}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setSalary(data);
    } catch (err) {
      console.error("[EmployeeDashboard] salary fetch error:", err.message);
      setSalary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSalary(); }, [userId]);

  const earnedSalary = salary?.earnedSalary ?? 0;
  const grossSalary = salary?.grossSalary ?? 0;
  const presentDays = salary?.presentDays ?? 0;
  const currentMonth = salary?.month ? MONTHS[(salary.month - 1)] : MONTHS[new Date().getMonth()];
  const currentYear = salary?.year ?? new Date().getFullYear();

  const recentPayslips = [
    {
      month: "This Month",
      generated: `${presentDays} days present`,
      amount: `₹${earnedSalary.toLocaleString("en-IN")}`,
      status: "Active",
    },
    {
      month: "Last Month",
      generated: "Payroll processed",
      amount: `₹${grossSalary.toLocaleString("en-IN")}`,
      status: "Paid",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#112235" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{displayName} 👋</Text>
          </View>
          <TouchableOpacity style={styles.bellButton}>
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Salary Card */}
        {loading ? (
          <View style={[styles.salaryCard, { alignItems: "center", justifyContent: "center", minHeight: 160 }]}>
            <ActivityIndicator color="#fff" size="large" />
            <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 10 }}>Loading salary…</Text>
          </View>
        ) : (
          <View style={styles.salaryCard}>
            <Text style={styles.salaryLabel}>
              {currentMonth} {currentYear} Salary
            </Text>
            <Text style={styles.salaryAmount}>₹{earnedSalary.toLocaleString("en-IN")}</Text>
            <Text style={styles.employeeInfo}>{displayDesignation} · {displayEmpId}</Text>
            <View style={styles.salaryStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Gross</Text>
                <Text style={styles.statValue}>₹{grossSalary.toLocaleString("en-IN")}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Present Days</Text>
                <Text style={[styles.statValue, { color: "#bbf7d0" }]}>{presentDays}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Earned</Text>
                <Text style={[styles.statValue, styles.overtimeValue]}>₹{earnedSalary.toLocaleString("en-IN")}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {[
            { label: "Payslip", emoji: "📄", bg: "#DBEAFE", onPress: () => navigation?.navigate("ViewPayslip") },
            { label: "Breakdown", emoji: "💵", bg: "#dcfce7", onPress: () => navigation?.navigate("SalaryBreakdown") },
            { label: "History", emoji: "🕐", bg: "#ede9fe", onPress: () => navigation?.navigate("PayrollHistory") },
          ].map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionItem} onPress={a.onPress}>
              <View style={[styles.actionIcon, { backgroundColor: a.bg }]}>
                <Text style={styles.actionEmoji}>{a.emoji}</Text>
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Payslips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Payslips</Text>
            <TouchableOpacity onPress={() => navigation?.navigate("PayrollHistory")}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentPayslips.map((slip, index) => (
            <View key={index} style={styles.payslipItem}>
              <View style={styles.payslipIconWrap}>
                <Text style={styles.payslipIcon}>📋</Text>
              </View>
              <View style={styles.payslipInfo}>
                <Text style={styles.payslipMonth}>{slip.month}</Text>
                <Text style={styles.payslipDate}>{slip.generated}</Text>
              </View>
              <View style={styles.payslipRight}>
                <Text style={styles.payslipAmount}>{slip.amount}</Text>
                <View style={styles.paidBadge}>
                  <Text style={styles.paidText}>{slip.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#112235" },
  container: { flex: 1, backgroundColor: "#112235", paddingHorizontal: 20 },
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingTop: 39, paddingBottom: 16,
  },
  welcomeText: { fontSize: 14, color: "#ffffff" },
  nameText: { fontSize: 22, fontWeight: "700", color: "#ffffff", marginTop: 2 },
  bellButton: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "#fff", justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  bellIcon: { fontSize: 18 },
  salaryCard: {
    backgroundColor: "#2F6E8E", borderRadius: 20, padding: 22, marginBottom: 20,
    shadowColor: "#3F7F9E", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  salaryLabel: { fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: "500", marginBottom: 4 },
  salaryAmount: { fontSize: 38, fontWeight: "800", color: "#ffffff", marginBottom: 4 },
  employeeInfo: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 20 },
  salaryStats: {
    flexDirection: "row", backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 8,
  },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.25)", marginVertical: 2 },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.75)", marginBottom: 3 },
  statValue: { fontSize: 15, fontWeight: "700", color: "#ffffff" },
  overtimeValue: { color: "#bbf7d0" },
  quickActions: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24, gap: 12 },
  actionItem: {
    flex: 1, backgroundColor: "#ffffff", borderRadius: 16,
    paddingVertical: 18, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  actionEmoji: { fontSize: 20 },
  actionLabel: { fontSize: 12, fontWeight: "600", color: "#374151" },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#ffffff" },
  seeAll: { fontSize: 13, color: "#2F6E8E", fontWeight: "600" },
  payslipItem: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#0f1e30", borderRadius: 14,
    padding: 14, marginBottom: 10,
  },
  payslipIconWrap: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: "#1a3a5c", justifyContent: "center",
    alignItems: "center", marginRight: 12,
  },
  payslipIcon: { fontSize: 18 },
  payslipInfo: { flex: 1 },
  payslipMonth: { fontSize: 14, fontWeight: "600", color: "#ffffff" },
  payslipDate: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  payslipRight: { alignItems: "flex-end" },
  payslipAmount: { fontSize: 15, fontWeight: "700", color: "#ffffff", marginBottom: 4 },
  paidBadge: { backgroundColor: "#dcfce7", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  paidText: { fontSize: 11, fontWeight: "600", color: "#16a34a" },
});

export default EmployeeDashboard;