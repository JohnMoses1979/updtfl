/**
 * userscreens/ViewPayslip.js
 * API: GET /api/payslip/{empId}/{month}/{year}
 * Uses UserContext for empId/userId
 */
import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Alert,
} from "react-native";
import { useUser } from "../context/UserContext";
import { BASE_URL } from "../api/config";
import { Platform, Linking } from "react-native";

const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Build list of past N months (newest first, excluding current) */
const getPastMonths = (count = 6) => {
  const months = [];
  const now = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: `${MONTHS_FULL[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`,
    });
  }
  return months;
};

const ViewPayslip = ({ navigation }) => {
  const { user } = useUser();
  const userId = user?.userId ?? 1;
  const displayName = user?.name || "Employee";
  const displayEmpId = user?.empId || "—";
  const displayDesignation = user?.designation || "Employee";

  const monthsList = getPastMonths(6);
  const [selected, setSelected] = useState(monthsList[0]);
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPayslip = async (month, year) => {
    setLoading(true);
    setError(null);
    setPayslip(null);
    try {
      const res = await fetch(`${BASE_URL}/api/payslip/${userId}/${month}/${year}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (!data || data.earnedSalary === 0) {
        setError(data?.message || "No attendance data for this month.");
      } else {
        setPayslip(data);
      }
    } catch (err) {
      setError(err.message || "Failed to load payslip");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selected) fetchPayslip(selected.month, selected.year);
  }, [selected, userId]);

  const fmt = (v) => `₹${Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const handleDownloadPdf = async () => {
    if (!selected || !payslip) {
      Alert.alert("No Payslip", "Please select a month with payslip data first.");
      return;
    }

    const url = `${BASE_URL}/api/payslip/download/${userId}/${selected.month}/${selected.year}`;

    if (Platform.OS === "web") {
      // ── WEB: fetch blob → create object URL → trigger download ────
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Server error ${response.status}`);
        }
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `payslip_${payslip.empCode || "EMP"}_${selected.label.replace(" ", "_")}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      } catch (err) {
        Alert.alert("Download Failed", err.message || "Could not download PDF.");
      }
    } else {
      // ── MOBILE (Expo Go): use Linking to open in browser ──────────
      // This opens the PDF in the device browser / PDF viewer
      // For a true "save to device" experience, expo-file-system is needed
      // but requires a custom dev build. Linking works in Expo Go.
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert(
            "Cannot Open",
            "Could not open the PDF URL. Please try on a browser."
          );
        }
      } catch (err) {
        Alert.alert("Download Failed", err.message || "Could not open PDF.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#112235" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>View Payslip</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Month Selector */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>Select Month</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
          {monthsList.map((m, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setSelected(m)}
              style={[
                styles.monthChip,
                selected?.label === m.label && styles.monthChipActive,
              ]}
            >
              <Text style={[
                styles.monthChipText,
                selected?.label === m.label && styles.monthChipTextActive,
              ]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Loading */}
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#2F6E8E" />
            <Text style={styles.loadingText}>Loading payslip…</Text>
          </View>
        )}

        {/* Error / No data */}
        {!loading && error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorIcon}>📭</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Payslip Card */}
        {!loading && payslip && (
          <>
            <View style={styles.slipCard}>
              <View style={styles.slipCardHeader}>
                <View>
                  <Text style={styles.slipTitle}>Salary Slip</Text>
                  <Text style={styles.slipSubtitle}>{selected?.label}</Text>
                </View>
                <View style={styles.presentBadge}>
                  <Text style={styles.presentBadgeText}>{payslip.presentDays} days</Text>
                </View>
              </View>

              {/* Employee Details */}
              <View style={styles.employeeGrid}>
                {[
                  ["Name", payslip.employeeName || displayName],
                  ["Employee ID", payslip.empCode || displayEmpId],
                  ["Designation", displayDesignation],
                  ["Per Day Rate", `₹${payslip.perDayRate || 612}`],
                ].map(([label, value]) => (
                  <View key={label} style={styles.employeeField}>
                    <Text style={styles.fieldLabel}>{label}</Text>
                    <Text style={styles.fieldValue} numberOfLines={1}>{value}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.divider} />

              {/* Earnings */}
              <Text style={styles.categoryTitle}>EARNINGS</Text>
              {[
                ["Basic Salary (50%)", payslip.basicSalary],
                ["House Rent Allowance (20%)", payslip.hra],
                ["Transport Allowance (10%)", payslip.transport],
                ["Special Allowance (20%)", payslip.specialAllowance],
              ].map(([label, val]) => (
                <View key={label} style={styles.lineItem}>
                  <Text style={styles.lineItemLabel}>{label}</Text>
                  <Text style={styles.lineItemAmount}>{fmt(val)}</Text>
                </View>
              ))}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Gross Earned Salary</Text>
                <Text style={[styles.totalAmount, styles.grossAmount]}>{fmt(payslip.earnedSalary)}</Text>
              </View>

              // After "Gross Earned Salary" total row, add before the divider:
              {payslip.grossSalary > 0 && (
                <View style={styles.lineItem}>
                  <Text style={styles.lineItemLabel}>Monthly Gross (CTC)</Text>
                  <Text style={styles.lineItemAmount}>{fmt(payslip.grossSalary)}</Text>
                </View>
              )}

              <View style={styles.divider} />

              {/* Deductions */}
              <Text style={[styles.categoryTitle, styles.deductionTitle]}>DEDUCTIONS</Text>
              {[
                ["EPF", payslip.tax],
                ["Insurance", payslip.insurance],
              ].map(([label, val]) => (
                <View key={label} style={styles.lineItem}>
                  <Text style={styles.lineItemLabel}>{label}</Text>
                  <Text style={[styles.lineItemAmount, styles.deductionAmount]}>-{fmt(val)}</Text>
                </View>
              ))}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Deductions</Text>
                <Text style={[styles.totalAmount, styles.deductionAmount]}>-{fmt(payslip.totalDeductions)}</Text>
              </View>

              <View style={styles.divider} />

              {/* Net Salary */}
              <View style={styles.netSalaryRow}>
                <Text style={styles.netSalaryLabel}>Net Salary</Text>
                <Text style={styles.netSalaryAmount}>{fmt(payslip.netSalary)}</Text>
              </View>
            </View>

            {/* Download Button */}
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleDownloadPdf}   // <-- was: () => Alert.alert(...)
            >
              <Text style={styles.downloadIcon}>⬇️</Text>
              <Text style={styles.downloadText}>Download PDF</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#112235" },
  container: { flex: 1, backgroundColor: "#112235", paddingHorizontal: 20 },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingTop: 16, paddingBottom: 20,
  },
  backButton: { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  backArrow: { fontSize: 22, color: "#ffffff", fontWeight: "500" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#ffffff" },
  sectionLabel: { marginBottom: 8 },
  sectionLabelText: { fontSize: 13, color: "#ffffff", fontWeight: "500" },
  monthScroll: { marginBottom: 18 },
  monthChip: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20, backgroundColor: "#1a3a5c",
    marginRight: 8, borderWidth: 1.5, borderColor: "transparent",
  },
  monthChipActive: { backgroundColor: "#2F6E8E", borderColor: "#2F6E8E" },
  monthChipText: { fontSize: 13, fontWeight: "600", color: "#7A9BB5" },
  monthChipTextActive: { color: "#fff" },
  centered: { alignItems: "center", paddingTop: 60, gap: 12 },
  loadingText: { color: "#9ca3af", fontSize: 14 },
  errorBox: { alignItems: "center", paddingTop: 60, gap: 10 },
  errorIcon: { fontSize: 40 },
  errorText: { color: "#9ca3af", fontSize: 14, textAlign: "center", paddingHorizontal: 20 },
  slipCard: {
    backgroundColor: "#ffffff", borderRadius: 18, padding: 20,
    marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  slipCardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 16,
  },
  slipTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  slipSubtitle: { fontSize: 13, color: "#9ca3af", marginTop: 2 },
  presentBadge: {
    backgroundColor: "#dcfce7", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  presentBadgeText: { fontSize: 12, fontWeight: "700", color: "#16a34a" },
  employeeGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  employeeField: { width: "50%", marginBottom: 10 },
  fieldLabel: { fontSize: 11, color: "#9ca3af", fontWeight: "500", marginBottom: 2 },
  fieldValue: { fontSize: 13, fontWeight: "600", color: "#111827" },
  divider: { height: 1, backgroundColor: "#DBEAFE", marginVertical: 14 },
  categoryTitle: {
    fontSize: 11, fontWeight: "700", color: "#9ca3af",
    letterSpacing: 0.8, marginBottom: 12,
  },
  deductionTitle: { color: "#f87171" },
  lineItem: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 10,
  },
  lineItemLabel: { fontSize: 14, color: "#374151" },
  lineItemAmount: { fontSize: 14, fontWeight: "600", color: "#111827" },
  deductionAmount: { color: "#ef4444" },
  grossAmount: { color: "#22c55e" },
  totalRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginTop: 6, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: "#DBEAFE",
  },
  totalLabel: { fontSize: 15, fontWeight: "700", color: "#111827" },
  totalAmount: { fontSize: 15, fontWeight: "700" },
  netSalaryRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#f0fdf4", borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    marginTop: 4, borderWidth: 1, borderColor: "#bbf7d0",
  },
  netSalaryLabel: { fontSize: 16, fontWeight: "700", color: "#111827" },
  netSalaryAmount: { fontSize: 22, fontWeight: "800", color: "#16a34a" },
  downloadButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#2F6E8E", borderRadius: 14, paddingVertical: 16, gap: 8,
    shadowColor: "#2F6E8E", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  downloadIcon: { fontSize: 18 },
  downloadText: { fontSize: 16, fontWeight: "700", color: "#ffffff" },
});

export default ViewPayslip;