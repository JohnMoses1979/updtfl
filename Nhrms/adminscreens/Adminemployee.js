// adminscreens/Adminemployee.js
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
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { employeeApi } from "../api/employeeApi";

const C = {
  bg: "#112235",
  card: "#FFFFFF",
  orange: "#3B82F6",
  text: "#F0EDE8",
  textDark: "#0f1e30",
  muted: "#7A7570",
  mutedDark: "#888",
  border: "#E8E4DF",
  red: "#FF4D6D",
  blue: "#4D9EFF",
  teal: "#2DD4BF",
  success: "#22C55E",
};

const ACCENT_COLORS = [
  "#4D6FFF", "#2F6E8E", "#9B59B6", "#27AE60",
  "#E74C3C", "#F39C12", "#2DD4BF", "#FF6B9D",
];

function initials(name = "") {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
}

function accentFor(empId = "", idx = 0) {
  if (!empId) return ACCENT_COLORS[idx % ACCENT_COLORS.length];
  let hash = 0;
  for (let i = 0; i < empId.length; i++) {
    hash = empId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
}

function EmployeeCard({ emp, onDelete, onEdit, index }) {
  const color = accentFor(emp.empId || emp.id, index);
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: color + "22", borderColor: color, borderWidth: 2 }]}>
          <Text style={[styles.avatarText, { color }]}>{initials(emp.name)}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.empName}>{emp.name}</Text>
          <Text style={styles.empIdText}>{emp.empId}</Text>
        </View>
        {emp.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedBadgeText}>✓ Active</Text>
          </View>
        )}
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Designation</Text>
          <Text style={styles.infoValue}>{emp.designation || "—"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue} numberOfLines={1}>{emp.email || "—"}</Text>
        </View>
        {emp.monthlySalary > 0 && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Monthly Salary</Text>
            <Text style={styles.infoValueBold}>₹{emp.monthlySalary.toLocaleString("en-IN")}</Text>
          </View>
        )}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => onEdit(emp)}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionText, { color: C.blue }]}>EDIT</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => onDelete(emp)}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionText, { color: C.red }]}>DELETE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const EMPTY_FORM = {
  empId: "",
  name: "",
  email: "",
  designation: "",
  password: "",
  monthlySalary: "",
};

export default function AdminEmployeesScreen({ onBack }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null); // numeric DB id
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ── Fetch employees from backend ─────────────────────────────────────────
  const fetchEmployees = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const data = await employeeApi.getAll();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load employees");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  // ── Open modal ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalVisible(true);
  };

  const openEdit = (emp) => {
    setEditingId(emp.id);
    setForm({
      empId: emp.empId || "",
      name: emp.name || "",
      email: emp.email || "",
      designation: emp.designation || "",
      password: "",   // never pre-fill password
      monthlySalary: emp.monthlySalary ? String(emp.monthlySalary) : "",
    });
    setError("");
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
  };

  // ── Save (create or update) ─────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.empId.trim()) { setError("Employee ID is required"); return; }
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (!form.email.trim()) { setError("Email is required"); return; }
    if (!form.designation.trim()) { setError("Designation is required"); return; }
    if (!editingId && !form.password.trim()) {
      setError("Password is required for new employees"); return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        empId: form.empId.trim().toUpperCase(),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        designation: form.designation.trim(),
        monthlySalary: form.monthlySalary ? parseFloat(form.monthlySalary) : 0,
      };
      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      if (editingId) {
        await employeeApi.update(editingId, payload);
      } else {
        await employeeApi.create(payload);
      }

      closeModal();
      await fetchEmployees();
    } catch (err) {
      setError(err.message || "Failed to save employee");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = (emp) => {
    Alert.alert(
      "Delete Employee",
      `Are you sure you want to delete ${emp.name} (${emp.empId})?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await employeeApi.delete(emp.id);
              await fetchEmployees();
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to delete employee");
            }
          },
        },
      ]
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backLabel}>Admin</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Employee Management</Text>
        <View style={styles.headerIcons}>
          <View style={{ position: "relative" }}>
            <TouchableOpacity style={styles.iconBtn}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <View style={styles.activeTab}>
          <Text style={styles.activeTabText}>EMPLOYEES LIST</Text>
          <View style={styles.tabUnderline} />
        </View>
        <Text style={styles.countBadge}>{employees.length}</Text>
      </View>

      {/* Body */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2F6E8E" />
          <Text style={styles.loadingText}>Loading employees…</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.body}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchEmployees(true)}
              tintColor="#2F6E8E"
              colors={["#2F6E8E"]}
            />
          }
        >
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => fetchEmployees()}>
                <Text style={styles.retryText}>Tap to retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!error && employees.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={styles.emptyText}>No employees yet</Text>
              <Text style={styles.emptySubtext}>Tap "+ Add Employee" to get started</Text>
            </View>
          )}

          {employees.map((emp, idx) => (
            <EmployeeCard
              key={emp.id}
              emp={emp}
              index={idx}
              onDelete={handleDelete}
              onEdit={openEdit}
            />
          ))}

          <TouchableOpacity style={styles.addBtn} activeOpacity={0.85} onPress={openAdd}>
            <Text style={styles.addBtnText}>+ Add Employee</Text>
          </TouchableOpacity>
          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      {/* Add / Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeModal}
          />
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              {editingId ? "Edit Employee" : "Add New Employee"}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {!!error && (
                <View style={styles.modalError}>
                  <Text style={styles.modalErrorText}>{error}</Text>
                </View>
              )}

              {[
                { label: "Employee ID *", key: "empId", ph: "e.g. BSSE001", caps: "characters" },
                { label: "Full Name *", key: "name", ph: "e.g. Ravi Kumar", caps: "words" },
                { label: "Email *", key: "email", ph: "e.g. ravi@company.com", caps: "none", kb: "email-address" },
                { label: "Designation *", key: "designation", ph: "e.g. Software Developer", caps: "words" },
                {
                  label: editingId ? "New Password (leave blank to keep existing)" : "Password *",
                  key: "password",
                  ph: editingId ? "Leave blank to keep current" : "Min 6 characters",
                  secure: true,
                },
                { label: "Monthly Salary (₹)", key: "monthlySalary", ph: "e.g. 19000", kb: "decimal-pad" },
              ].map(({ label, key, ph, caps, kb, secure }) => (
                <View key={key} style={{ marginBottom: 16 }}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder={ph}
                    placeholderTextColor={C.muted}
                    value={form[key]}
                    onChangeText={(val) => {
                      setForm((prev) => ({ ...prev, [key]: val }));
                      setError("");
                    }}
                    autoCapitalize={caps || "none"}
                    keyboardType={kb || "default"}
                    secureTextEntry={!!secure}
                  />
                </View>
              ))}

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                  onPress={handleSave}
                  activeOpacity={0.85}
                  disabled={saving}
                >
                  {saving
                    ? <ActivityIndicator color="#FFF" size="small" />
                    : <Text style={styles.saveBtnText}>
                      {editingId ? "Save Changes" : "Add Employee"}
                    </Text>
                  }
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 60 },
  loadingText: { color: C.muted, fontSize: 14 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 29, paddingBottom: 12,
    backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: "#0f1e30",
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 2, minWidth: 60 },
  backArrow: { fontSize: 28, color: "#2F6E8E", lineHeight: 30, marginTop: -2 },
  backLabel: { fontSize: 15, color: "#2F6E8E", fontWeight: "600" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: C.text },
  headerIcons: { flexDirection: "row", gap: 12, alignItems: "center" },
  iconBtn: { padding: 4 },

  tabBar: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, backgroundColor: C.bg,
    borderBottomWidth: 1, borderBottomColor: "#0f1e30", paddingTop: 4,
  },
  activeTab: { paddingBottom: 10, paddingRight: 12 },
  activeTabText: { fontSize: 13, fontWeight: "800", color: "#2F6E8E", letterSpacing: 0.5 },
  tabUnderline: { height: 2.5, backgroundColor: "#2F6E8E", borderRadius: 2, marginTop: 6 },
  countBadge: {
    backgroundColor: "#1a3a5c", color: "#2F6E8E",
    fontSize: 12, fontWeight: "700",
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
    marginLeft: 4, marginBottom: 10,
  },

  body: { flex: 1, backgroundColor: C.bg, paddingTop: 16 },

  errorBox: { margin: 16, backgroundColor: "#FFF0F3", borderRadius: 12, padding: 14, alignItems: "center", gap: 6 },
  errorText: { color: C.red, fontSize: 13, textAlign: "center" },
  retryText: { color: "#2F6E8E", fontSize: 13, fontWeight: "600" },

  emptyState: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 18, color: C.text, fontWeight: "700" },
  emptySubtext: { fontSize: 14, color: C.muted },

  card: {
    backgroundColor: C.card, marginHorizontal: 16, marginBottom: 14,
    borderRadius: 14, padding: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontWeight: "800" },
  empName: { fontSize: 16, fontWeight: "700", color: C.textDark },
  empIdText: { fontSize: 12, color: C.mutedDark, marginTop: 2 },
  verifiedBadge: {
    backgroundColor: "#E8FAF7", borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, marginLeft: 8,
  },
  verifiedBadgeText: { color: "#0F6E56", fontSize: 11, fontWeight: "700" },

  infoGrid: { gap: 5, marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoLabel: { fontSize: 12, color: "#AAA", width: 120 },
  infoValue: { fontSize: 12, color: C.textDark, flex: 1 },
  infoValueBold: { fontSize: 13, fontWeight: "700", color: C.textDark },

  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center" },
  deleteBtn: { backgroundColor: "#FFF0F3" },
  editBtn: { backgroundColor: "#EEF5FF" },
  actionText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },

  addBtn: {
    marginHorizontal: 16, marginTop: 4, marginBottom: 8,
    backgroundColor: "#2F6E8E", borderRadius: 14,
    paddingVertical: 14, alignItems: "center",
    shadowColor: "#2F6E8E", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  addBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },

  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  modalSheet: {
    backgroundColor: "#0f1e30", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36, maxHeight: "90%",
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#1a3a5c", alignSelf: "center", marginBottom: 20 },
  sheetTitle: { fontSize: 20, fontWeight: "800", color: C.text, marginBottom: 20 },

  modalError: { backgroundColor: "#2a0a0a", borderRadius: 10, padding: 12, marginBottom: 16 },
  modalErrorText: { color: "#FF6B6B", fontSize: 13, textAlign: "center" },

  fieldLabel: { fontSize: 12, fontWeight: "600", color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  fieldInput: {
    backgroundColor: "#0f2035", borderRadius: 12, borderWidth: 1, borderColor: "#1a3a5c",
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: C.text,
  },

  modalActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: "#1a3a5c", alignItems: "center",
  },
  cancelBtnText: { color: C.muted, fontSize: 15, fontWeight: "600" },
  saveBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: "#2F6E8E", alignItems: "center" },
  saveBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
});