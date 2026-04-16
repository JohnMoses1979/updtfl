import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Image,
} from "react-native";
import { useUser } from "../context/UserContext";
import { taskApi } from "../api/taskapi";
import { messageApi } from "../api/messageApi";

const C = {
  bg: "#112235",
  orange: "#2F6E8E",
  white: "#FFFFFF",
  gray: "#AAAAAA",
  border: "#1a3a5c",
};

const PRIORITY_COLORS = {
  urgent: { bg: "#2a1020", text: "#FF4D6D", dot: "#FF4D6D" },
  high: { bg: "#2a1f00", text: "#FFB830", dot: "#FFB830" },
  medium: { bg: "#0f1e30", text: "#4D9EFF", dot: "#4D9EFF" },
  low: { bg: "#0a1e14", text: "#2DD4A0", dot: "#2DD4A0" },
};

function getPriorityStyle(priority = "medium") {
  return PRIORITY_COLORS[String(priority).toLowerCase()] || PRIORITY_COLORS.medium;
}

function formatMessageTime(createdAt) {
  if (!createdAt) return "";
  try {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

function getInitials(name = "") {
  const parts = String(name).trim().split(" ").filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function Header({ onProfilePress, onNotificationPress, hasUnreadNotifications }) {
  const { user } = useUser();
  const displayName = user?.name ? user.name.split(" ")[0] : "User";
  const displayEmail = user?.email || "";
  const avatarUri = user?.avatarUri || "";

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity onPress={onProfilePress}>
          <View style={styles.avatar}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : null}
            <Text style={{ fontSize: 20 }}></Text>
          </View>
        </TouchableOpacity>
        <View style={{ marginLeft: 10 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={{ marginLeft: 4 }}>✅</Text>
          </View>
          <Text style={styles.email}>{displayEmail}</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.iconEmoji}>💬</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={onNotificationPress}>
          <Text style={styles.iconEmoji}>🔔</Text>
          {hasUnreadNotifications ? <View style={styles.notifDot} /> : null}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SummaryBanner() {
  return (
    <View style={styles.banner}>
      <View style={{ flex: 1 }}>
        <Text style={styles.bannerTitle}>My Work Summary</Text>
        <Text style={styles.bannerSub}>Today task and presence activity</Text>
      </View>
      <Text style={{ fontSize: 40 }}>📷</Text>
    </View>
  );
}

function SectionHeader({ title, sub }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSub}>{sub}</Text>
    </View>
  );
}

function MessageCard({ msg }) {
  const [expanded, setExpanded] = useState(false);
  const messageText = msg.messageText || msg.message || "";
  const isLong = messageText.length > 120;

  return (
    <TouchableOpacity
      style={styles.messageCard}
      activeOpacity={isLong ? 0.8 : 1}
      onPress={() => isLong && setExpanded((value) => !value)}
    >
      <View style={styles.messageIconBox}>
        <Text style={{ fontSize: 18 }}>📣</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.messageTitleRow}>
          <Text style={styles.messageTitle} numberOfLines={1}>
            Admin Message
          </Text>
          <Text style={styles.messageTime}>{formatMessageTime(msg.createdAt)}</Text>
        </View>
        <Text style={styles.messageBody} numberOfLines={expanded ? undefined : 3}>
          {messageText}
        </Text>
        {isLong ? (
          <Text style={styles.expandText}>{expanded ? "Show less" : "Show more"}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function MessagesSection() {
  const { user } = useUser();
  const employeeId = user?.empId || "";
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const timerRef = useRef(null);

  const fetchMessages = async (isRefresh = false) => {
    if (!employeeId) return;

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");
    try {
      const data = await messageApi.getUserMessages(employeeId);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const filtered = Array.isArray(data)
        ? data.filter((item) => !item.createdAt || new Date(item.createdAt) > oneDayAgo)
        : [];
      setMessages(filtered);
    } catch (err) {
      setError("Could not load messages.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!employeeId) return undefined;

    fetchMessages();
    timerRef.current = setInterval(() => fetchMessages(), 60000);
    return () => clearInterval(timerRef.current);
  }, [employeeId]);

  if (loading && messages.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <ActivityIndicator size="small" color={C.orange} />
        <Text style={[styles.emptyTitle, { marginTop: 10, fontSize: 14 }]}>
          Loading messages...
        </Text>
      </View>
    );
  }

  if (error && messages.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={{ fontSize: 34, marginBottom: 8 }}>⚠️</Text>
        <Text style={[styles.emptyTitle, { color: "#FF6B6B" }]}>{error}</Text>
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMessages(true)}
            tintColor={C.orange}
            colors={[C.orange]}
          />
        }
      >
        <View style={styles.emptyWrap}>
          <View style={styles.meetingGrid}>
            {[...Array(6)].map((_, index) => (
              <View key={index} style={styles.personIcon}>
                <View style={styles.personHead} />
                <View style={styles.personBody} />
              </View>
            ))}
          </View>
          <Text style={styles.emptyTitle}>No Messages Today</Text>
          <Text style={styles.emptyDesc}>
            Messages from your admin will appear here. They are cleared after 24 hours.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <View>
      {messages.map((msg) => (
        <MessageCard key={msg.id} msg={msg} />
      ))}
      <View style={styles.moreBadge}>
        <Text style={styles.moreBadgeText}>
          {messages.length} message{messages.length !== 1 ? "s" : ""} today
        </Text>
      </View>
    </View>
  );
}

function TaskCard({ task }) {
  const priorityStyle = getPriorityStyle(task.priority);

  return (
    <View style={styles.taskCard}>
      <View style={styles.taskTopRow}>
        <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
          <View style={[styles.priorityDot, { backgroundColor: priorityStyle.dot }]} />
          <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
            {task.priority ? String(task.priority).toUpperCase() : "MEDIUM"}
          </Text>
        </View>
        {task.status && task.status !== "todo" ? (
          <View style={styles.statusChip}>
            <Text style={styles.statusChipText}>
              {task.status === "in-progress"
                ? "In Progress"
                : task.status === "review"
                  ? "Review"
                  : task.status === "done"
                    ? "Done"
                    : task.status}
            </Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.taskTitle} numberOfLines={2}>
        {task.title || "Untitled Task"}
      </Text>
      {task.description ? (
        <Text style={styles.taskDesc} numberOfLines={2}>
          {task.description}
        </Text>
      ) : null}
      {task.dueText && task.dueText !== "—" ? (
        <View style={styles.taskDueRow}>
          <Text style={styles.taskDueIcon}>📅</Text>
          <Text style={styles.taskDueText}>Due {task.dueText}</Text>
        </View>
      ) : null}
    </View>
  );
}

function TaskSection({ onViewAll }) {
  const { user } = useUser();
  const employeeId = user?.empId || "";
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!employeeId) return undefined;

    let cancelled = false;

    const fetchTasks = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await taskApi.getTasksByEmployeeId(employeeId);
        if (cancelled) return;

        const active = Array.isArray(data)
          ? data.filter(
              (task) =>
                String(task.status || "").toLowerCase() !== "done" &&
                Number(task.progress || 0) < 100,
            )
          : [];
        setTasks(active);
      } catch (err) {
        if (!cancelled) setError("Could not load tasks.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTasks();
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  if (loading) {
    return (
      <View style={styles.emptyWrap}>
        <ActivityIndicator size="small" color={C.orange} />
        <Text style={[styles.emptyTitle, { marginTop: 10, fontSize: 14 }]}>
          Loading tasks...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={{ fontSize: 34, marginBottom: 8 }}>⚠️</Text>
        <Text style={[styles.emptyTitle, { color: "#FF6B6B" }]}>{error}</Text>
      </View>
    );
  }

  if (tasks.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <View style={styles.paperStack}>
          <View
            style={[
              styles.paper,
              {
                backgroundColor: "#2F6E8E",
                bottom: 18,
                left: -8,
                transform: [{ rotate: "-8deg" }],
              },
            ]}
          />
          <View
            style={[
              styles.paper,
              {
                backgroundColor: "#e8e8f8",
                bottom: 8,
                left: 0,
                transform: [{ rotate: "-2deg" }],
              },
            ]}
          >
            {[...Array(4)].map((_, index) => (
              <View key={index} style={styles.paperLine} />
            ))}
          </View>
          <View style={[styles.paper, { backgroundColor: "#f0f0fa", bottom: 0, left: 8 }]}>
            {[...Array(4)].map((_, index) => (
              <View key={index} style={styles.paperLine} />
            ))}
          </View>
        </View>
        <Text style={styles.emptyTitle}>No Tasks Assigned</Text>
        <Text style={styles.emptyDesc}>
          It looks like you do not have any active tasks right now.
        </Text>
      </View>
    );
  }

  const visibleTasks = tasks.slice(0, 5);
  return (
    <View>
      {visibleTasks.map((task, index) => (
        <TaskCard key={task.id ?? index} task={task} />
      ))}
      <TouchableOpacity style={styles.viewAllBtn} onPress={onViewAll} activeOpacity={0.8}>
        <Text style={styles.viewAllText}>
          {tasks.length > 5 ? `View All ${tasks.length} Tasks ->` : "View All Tasks ->"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function NotificationItem({ item, onPress }) {
  const title =
    item.kind === "task"
      ? item.title || "Task update"
      : item.employeeName
        ? `Message for ${item.employeeName}`
        : "Admin message";
  const body =
    item.kind === "task"
      ? item.body || "A task was updated."
      : item.messageText || item.message || "New message received.";

  return (
    <TouchableOpacity style={styles.notificationCard} activeOpacity={0.85} onPress={onPress}>
      <View
        style={[
          styles.notificationIconWrap,
          { backgroundColor: item.kind === "task" ? "#1d3f60" : "#17384f" },
        ]}
      >
        <Text style={styles.notificationIcon}>{item.kind === "task" ? "📝" : "📣"}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.notificationTitleRow}>
          <Text style={styles.notificationItemTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.notificationTime}>{formatMessageTime(item.createdAt)}</Text>
        </View>
        <Text style={styles.notificationBody} numberOfLines={2}>
          {body}
        </Text>
        <Text style={styles.notificationAction}>
          {item.kind === "task" ? "Open task" : "Open message"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ onTabPress, onProfilePress }) {
  const { user } = useUser();
  const employeeId = user?.empId || "";
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const handleViewAllTasks = () => {
    onTabPress && onTabPress(3);
  };

  const loadNotifications = async () => {
    if (!employeeId) {
      setNotifications([]);
      return;
    }

    setNotifLoading(true);
    try {
      const [taskNotifs, messageNotifs] = await Promise.all([
        taskApi.getUserTaskNotifications(employeeId).catch(() => []),
        messageApi.getUserNotifications(employeeId).catch(() => []),
      ]);

      const merged = [
        ...(Array.isArray(taskNotifs)
          ? taskNotifs.map((item) => ({ ...item, kind: "task" }))
          : []),
        ...(Array.isArray(messageNotifs)
          ? messageNotifs.map((item) => ({ ...item, kind: "message" }))
          : []),
      ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      setNotifications(merged);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    if (!employeeId) return undefined;

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [employeeId]);

  const openNotifications = async () => {
    setNotifModalVisible(true);
    await loadNotifications();
  };

  const handleNotificationTap = async (item) => {
    try {
      if (item.kind === "task" && item.taskId) {
        await taskApi.markUserTaskNotificationAsRead(item.taskId).catch(() => null);
        setNotifModalVisible(false);
        onTabPress && onTabPress(3);
      } else if (item.kind === "message" && item.id) {
        await messageApi.markAsRead(item.id).catch(() => null);
        setNotifModalVisible(false);
      }
    } finally {
      setNotifications((prev) => prev.filter((notif) => notif.id !== item.id));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        onProfilePress={onProfilePress}
        onNotificationPress={openNotifications}
        hasUnreadNotifications={notifications.length > 0}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <SummaryBanner />
        <SectionHeader
          title="Today Messages"
          sub="Messages and announcements from admin (last 24 hours)"
        />
        <MessagesSection />
        <SectionHeader title="Today Task" sub="The tasks assigned to you" />
        <TaskSection onViewAll={handleViewAllTasks} />
      </ScrollView>

      <Modal
        visible={notifModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotifModalVisible(false)}
      >
        <View style={styles.notificationOverlay}>
          <TouchableOpacity
            style={styles.notificationBackdrop}
            activeOpacity={1}
            onPress={() => setNotifModalVisible(false)}
          />
          <View style={styles.notificationSheet}>
            <View style={styles.notificationHandle} />
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>
                Notifications
                {notifications.length > 0 ? (
                  <Text style={styles.notificationBadge}> ({notifications.length})</Text>
                ) : null}
              </Text>
              <TouchableOpacity onPress={() => setNotifModalVisible(false)}>
                <Text style={styles.notificationClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {notifLoading ? (
              <View style={styles.notificationEmpty}>
                <ActivityIndicator size="large" color={C.orange} />
                <Text style={styles.notificationEmptyText}>Loading notifications...</Text>
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.notificationEmpty}>
                <Text style={{ fontSize: 36 }}>✅</Text>
                <Text style={styles.notificationEmptyTitle}>No new notifications</Text>
                <Text style={styles.notificationEmptyText}>
                  New admin messages and task updates will appear here.
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {notifications.map((item) => (
                  <NotificationItem
                    key={`${item.kind}-${item.id}`}
                    item={item}
                    onPress={() => handleNotificationTap(item)}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1, paddingHorizontal: 18 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 39,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#1a3a5c",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  nameRow: { flexDirection: "row", alignItems: "center" },
  name: { color: C.white, fontWeight: "700", fontSize: 15 },
  email: { color: C.orange, fontSize: 12, marginTop: 2 },
  headerRight: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1a3a5c",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  iconEmoji: { fontSize: 17 },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4D6D",
  },

  banner: {
    backgroundColor: "#2F6E8E",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 24,
  },
  bannerTitle: { color: C.white, fontSize: 17, fontWeight: "700" },
  bannerSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 },

  sectionHeader: { marginBottom: 16, marginTop: 6 },
  sectionTitle: { color: C.white, fontSize: 16, fontWeight: "700" },
  sectionSub: { color: C.gray, fontSize: 13, marginTop: 2 },

  messageCard: {
    flexDirection: "row",
    backgroundColor: "#0f1e30",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
    alignItems: "flex-start",
  },
  messageIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(47,110,142,0.2)",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  messageTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  messageTitle: { color: C.white, fontSize: 13, fontWeight: "700", flex: 1 },
  messageTime: { color: C.gray, fontSize: 11, marginLeft: 8 },
  messageBody: { color: "#C8C4BE", fontSize: 13, lineHeight: 20 },
  expandText: { color: C.orange, fontSize: 12, marginTop: 4, fontWeight: "600" },
  moreBadge: {
    backgroundColor: "#0f1e30",
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  moreBadgeText: { color: C.orange, fontSize: 12, fontWeight: "600" },

  emptyWrap: {
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 28,
  },
  emptyTitle: {
    color: C.white,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    color: C.gray,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  meetingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 120,
    gap: 14,
    backgroundColor: "#E8E8F0",
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
  },
  personIcon: { alignItems: "center", width: 22 },
  personHead: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#2F6E8E",
    marginBottom: 2,
  },
  personBody: {
    width: 20,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2F6E8E",
  },

  paperStack: {
    width: 120,
    height: 100,
    position: "relative",
    marginBottom: 8,
  },
  paper: {
    position: "absolute",
    width: 90,
    height: 110,
    borderRadius: 6,
    padding: 10,
    justifyContent: "center",
    gap: 6,
  },
  paperLine: {
    height: 5,
    backgroundColor: "rgba(100,100,180,0.25)",
    borderRadius: 3,
    marginBottom: 5,
  },

  taskCard: {
    backgroundColor: "#0f1e30",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  taskTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  statusChip: {
    backgroundColor: "#1a3a5c",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusChipText: {
    color: C.gray,
    fontSize: 10,
    fontWeight: "600",
  },
  taskTitle: {
    color: C.white,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
    lineHeight: 20,
  },
  taskDesc: {
    color: C.gray,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  taskDueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  taskDueIcon: { fontSize: 11 },
  taskDueText: {
    color: C.gray,
    fontSize: 11,
    fontWeight: "500",
  },
  viewAllBtn: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    backgroundColor: "#0f1e30",
  },
  viewAllText: {
    color: C.orange,
    fontSize: 13,
    fontWeight: "700",
  },

  notificationOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  notificationBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  notificationSheet: {
    backgroundColor: "#0f1e30",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 28,
    maxHeight: "82%",
  },
  notificationHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#1a3a5c",
    alignSelf: "center",
    marginBottom: 16,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  notificationTitle: {
    color: C.white,
    fontSize: 18,
    fontWeight: "800",
  },
  notificationBadge: {
    color: "#FF4D6D",
    fontWeight: "800",
  },
  notificationClose: {
    color: C.gray,
    fontSize: 22,
  },
  notificationEmpty: {
    alignItems: "center",
    paddingVertical: 42,
    gap: 8,
  },
  notificationEmptyTitle: {
    color: C.white,
    fontSize: 16,
    fontWeight: "700",
  },
  notificationEmptyText: {
    color: C.gray,
    fontSize: 13,
    textAlign: "center",
  },
  notificationCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#112235",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  notificationIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationIcon: { fontSize: 18 },
  notificationTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationItemTitle: {
    color: C.white,
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  notificationTime: {
    color: C.gray,
    fontSize: 11,
    marginLeft: 8,
  },
  notificationBody: {
    color: "#C8C4BE",
    fontSize: 12,
    lineHeight: 18,
  },
  notificationAction: {
    color: C.orange,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },
});
