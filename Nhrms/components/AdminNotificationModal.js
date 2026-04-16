import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { notificationApi } from "../api/notificationApi";

const C = {
  bg: "#112235",
  card: "#0f1e30",
  border: "#1a3a5c",
  text: "#F0EDE8",
  muted: "#7A7570",
  accent: "#2F6E8E",
  success: "#22C55E",
  warning: "#FFB830",
  danger: "#FF4D6D",
  info: "#4D9EFF",
};

function getBadgeConfig(type, active) {
  if (!active) return { label: "History", color: C.muted };
  if (type === "SIGNUP_REQUEST") return { label: "Pending", color: C.warning };
  if (type === "LEAVE_REQUEST") return { label: "Leave", color: C.info };
  if (type === "TASK_UPDATED") return { label: "Task", color: C.accent };
  return { label: "Notice", color: C.info };
}

function getPrimaryActionLabel(notification) {
  switch (notification.type) {
    case "SIGNUP_REQUEST":
      return "Approve";
    case "LEAVE_REQUEST":
      return "Open Leave";
    case "TASK_UPDATED":
      return "Open Task";
    default:
      return "Open";
  }
}

function getTargetScreen(notification) {
  if (notification.targetPage) return notification.targetPage;
  if (notification.type === "LEAVE_REQUEST" || notification.type === "LEAVE_ACTION") return "leave";
  if (notification.type === "SIGNUP_REQUEST" || notification.type === "APPROVAL_ACTION") return "employees";
  return "tasks";
}

export default function AdminNotificationModal({ visible, onClose, onNavigate }) {
  const [tab, setTab] = useState("active");
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [activeNotifications, setActiveNotifications] = useState([]);
  const [historyNotifications, setHistoryNotifications] = useState([]);

  const displayedNotifications = useMemo(
    () => (tab === "active" ? activeNotifications : historyNotifications),
    [activeNotifications, historyNotifications, tab]
  );

  const loadNotifications = async (nextTab = tab) => {
    setLoading(true);
    try {
      const requests = [notificationApi.getAdminNotifications().catch(() => [])];
      if (visible || nextTab === "history") {
        requests.push(notificationApi.getAdminNotificationHistory().catch(() => []));
      }

      const [activeList, historyList = []] = await Promise.all(requests);
      setActiveNotifications(Array.isArray(activeList) ? activeList : []);
      setHistoryNotifications(Array.isArray(historyList) ? historyList : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    setTab("active");
    loadNotifications("active");
  }, [visible]);

  const closeAndNavigate = (screen) => {
    onClose?.();
    onNavigate?.(screen);
  };

  const handleOpen = async (notification) => {
    try {
      if (notification.active && notification.id) {
        await notificationApi.markAsRead(notification.id).catch(() => null);
        await loadNotifications(tab);
      }
      closeAndNavigate(getTargetScreen(notification));
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to open notification");
    }
  };

  const handleApprove = async (notification) => {
    setProcessingId(notification.id);
    try {
      await notificationApi.approveEmployee(notification.employeeId);
      await loadNotifications(tab);
      Alert.alert("Approved", `${notification.employeeName} has been approved.`);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to approve employee");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (notification) => {
    Alert.alert(
      "Reject Employee",
      `Reject ${notification.employeeName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setProcessingId(notification.id);
            try {
              await notificationApi.rejectEmployee(notification.employeeId);
              await loadNotifications(tab);
              Alert.alert("Rejected", `${notification.employeeName} has been rejected.`);
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to reject employee");
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            {[
              { key: "active", label: `Active (${activeNotifications.length})` },
              { key: "history", label: `History (${historyNotifications.length})` },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.tabBtn, tab === item.key && styles.tabBtnActive]}
                onPress={async () => {
                  setTab(item.key);
                  if (item.key === "history" && historyNotifications.length === 0) {
                    await loadNotifications(item.key);
                  }
                }}
              >
                <Text style={[styles.tabText, tab === item.key && styles.tabTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={C.accent} size="large" />
              <Text style={styles.emptySubText}>Loading notifications...</Text>
            </View>
          ) : displayedNotifications.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>
                {tab === "active" ? "No active notifications" : "No notification history yet"}
              </Text>
              <Text style={styles.emptySubText}>
                Leave requests, task updates, and approval activity will show here.
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {displayedNotifications.map((notification) => {
                const badge = getBadgeConfig(notification.type, notification.active);
                return (
                  <View
                    key={`${notification.type}-${notification.id}-${notification.taskId || notification.leaveId || notification.employeeId || "n"}`}
                    style={styles.card}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>
                          {(notification.employeeName || notification.title || "N").charAt(0).toUpperCase()}
                        </Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{notification.title}</Text>
                        <Text style={styles.cardMeta}>
                          {notification.employeeName || "Admin"}
                          {notification.employeeEmpId ? ` • ${notification.employeeEmpId}` : ""}
                        </Text>
                      </View>

                      <View style={[styles.badge, { backgroundColor: `${badge.color}22`, borderColor: `${badge.color}55` }]}>
                        <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                      </View>
                    </View>

                    <Text style={styles.body}>{notification.body}</Text>
                    {!!notification.createdAt && (
                      <Text style={styles.dateText}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </Text>
                    )}

                    {tab === "active" && (
                      <View style={styles.actions}>
                        <TouchableOpacity
                          style={[styles.primaryBtn, processingId === notification.id && styles.btnDisabled]}
                          disabled={processingId === notification.id}
                          onPress={() => {
                            if (notification.type === "SIGNUP_REQUEST") {
                              handleApprove(notification);
                            } else {
                              handleOpen(notification);
                            }
                          }}
                        >
                          <Text style={styles.primaryBtnText}>
                            {processingId === notification.id ? "Please wait..." : getPrimaryActionLabel(notification)}
                          </Text>
                        </TouchableOpacity>

                        {notification.type === "SIGNUP_REQUEST" && (
                          <TouchableOpacity
                            style={[styles.secondaryBtn, processingId === notification.id && styles.btnDisabled]}
                            disabled={processingId === notification.id}
                            onPress={() => handleReject(notification)}
                          >
                            <Text style={styles.secondaryBtnText}>Reject</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    minHeight: "68%",
    maxHeight: "86%",
    borderTopWidth: 1,
    borderColor: C.border,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: C.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: {
    color: C.text,
    fontSize: 20,
    fontWeight: "800",
  },
  closeText: {
    color: C.accent,
    fontSize: 14,
    fontWeight: "700",
  },
  tabs: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: C.card,
  },
  tabBtnActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  tabText: {
    color: C.text,
    fontSize: 13,
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#fff",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    color: C.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubText: {
    color: C.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#17314d",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  cardTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 2,
  },
  cardMeta: {
    color: C.muted,
    fontSize: 12,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  body: {
    color: C.text,
    fontSize: 13,
    lineHeight: 20,
  },
  dateText: {
    color: C.muted,
    fontSize: 11,
    marginTop: 10,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: C.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.danger,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: C.danger,
    fontSize: 13,
    fontWeight: "800",
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
