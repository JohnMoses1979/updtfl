/**
 * userscreens/Taskscreen.js
 *
 * ROOT CAUSE FIX:
 *   Previously this received `loggedInUser` prop from App.js but App.js
 *   never passed it — the prop was always undefined, so employeeId was
 *   always "" and GET /tasks/user/ was never called with a real value.
 *
 *   Fix: read empId directly from UserContext (same source as Attendance,
 *   Leave, Payroll screens). No prop needed.
 */
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  RefreshControl,
  ActivityIndicator,  // ADD THIS
} from "react-native";
import { taskApi } from "../api/taskapi";
import { useUser } from "../context/UserContext";
import { BASE_URL } from "../api/config";  // ADD THIS

const STATUS_COLORS = {
  "To Do": { bg: "#FFF3ED", text: "#3B82F6", dot: "#3B82F6" },
  "In Progress": { bg: "#FFF8E1", text: "#F59E0B", dot: "#F59E0B" },
  Review: { bg: "#FEF3C7", text: "#D97706", dot: "#D97706" },
  Done: { bg: "#ECFDF5", text: "#10B981", dot: "#10B981" },
};

const PRIORITY_COLORS = {
  High: { bg: "#FEE2E2", text: "#EF4444" },
  Medium: { bg: "#FEF3C7", text: "#D97706" },
  Low: { bg: "#DBEAFE", text: "#3B82F6" },
  Urgent: { bg: "#FCE7F3", text: "#E11D48" },
};

const ALL_STATUSES = ["To Do", "In Progress", "Review", "Done"];
const ALL_PRIORITIES = ["High", "Medium", "Low", "Urgent"];

function formatStatus(status = "") {
  const s = status.toLowerCase();
  if (s === "todo") return "To Do";
  if (s === "in-progress") return "In Progress";
  if (s === "review") return "Review";
  if (s === "done") return "Done";
  return "To Do";
}

function backendStatus(status = "") {
  const s = status.toLowerCase();
  if (s === "to do") return "todo";
  if (s === "in progress") return "in-progress";
  if (s === "review") return "review";
  if (s === "done") return "done";
  return "todo";
}

function formatPriority(priority = "") {
  const p = priority.toLowerCase();
  if (p === "high") return "High";
  if (p === "medium") return "Medium";
  if (p === "low") return "Low";
  if (p === "urgent") return "Urgent";
  return "Medium";
}

function backendPriority(priority = "") {
  return priority.toLowerCase();
}

function Badge({ label, colors }) {
  return (
    <View style={[badgeS.wrap, { backgroundColor: colors.bg }]}>
      <View style={[badgeS.dot, { backgroundColor: colors.text }]} />
      <Text style={[badgeS.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const badgeS = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  text: { fontSize: 11, fontWeight: "600" },
});

function ProgressBar({ value, color = "#3B82F6" }) {
  return (
    <View style={progS.track}>
      <View style={[progS.fill, { width: `${value}%`, backgroundColor: color }]} />
    </View>
  );
}

const progS = StyleSheet.create({
  track: { height: 5, backgroundColor: "#F0F0F0", borderRadius: 3, marginTop: 10, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
});

function TaskCard({ task, onUpdate }) {
  const sc = STATUS_COLORS[task.status] || STATUS_COLORS["To Do"];
  const pc = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium;
  const progressColor =
    task.status === "Done" ? "#10B981" :
      task.status === "In Progress" ? "#F59E0B" :
        task.status === "Review" ? "#D97706" : "#3B82F6";

  return (
    <View style={cardS.wrap}>
      <View style={cardS.topRow}>
        <View style={[cardS.iconCircle, { backgroundColor: sc.bg }]}>
          <Text style={{ fontSize: 14 }}>
            {task.status === "Done" ? "✅" :
              task.status === "In Progress" ? "⚡" :
                task.status === "Review" ? "📝" : "📋"}
          </Text>
        </View>
        <Text style={cardS.title} numberOfLines={2}>{task.title}</Text>
      </View>

      {!!task.description && (
        <Text style={cardS.description}>{task.description}</Text>
      )}

      <View style={cardS.badges}>
        <Badge label={task.status} colors={sc} />
        <Badge label={task.priority} colors={pc} />
      </View>

      <ProgressBar value={task.progress} color={progressColor} />

      <View style={cardS.footer}>
        <View style={cardS.footerLeft}>
          <Text style={cardS.meta}>📅 {task.due}</Text>
          <Text style={[cardS.meta, { marginLeft: 12 }]}>💬 {task.comments}</Text>
        </View>
        <TouchableOpacity style={cardS.updateBtn} onPress={() => onUpdate(task)}>
          <Text style={cardS.updateBtnText}>Update</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const cardS = StyleSheet.create({
  wrap: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  topRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  iconCircle: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 10, flexShrink: 0 },
  title: { flex: 1, fontSize: 14, fontWeight: "700", color: "#111827", lineHeight: 20 },
  description: { fontSize: 12, color: "#6B7280", lineHeight: 18, marginBottom: 10 },
  badges: { flexDirection: "row", flexWrap: "wrap" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  footerLeft: { flexDirection: "row", alignItems: "center" },
  meta: { fontSize: 12, color: "#9CA3AF" },
  updateBtn: { backgroundColor: "#3B82F6", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  updateBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});

function UpdateModal({ task, visible, onClose, onSave }) {
  const [status, setStatus] = useState(task?.status || "To Do");
  const [priority, setPriority] = useState(task?.priority || "Medium");
  const [progress, setProgress] = useState(String(task?.progress ?? 0));
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (task) {
      setStatus(task.status);
      setPriority(task.priority);
      setProgress(String(task.progress));
      setComment("");
    }
  }, [task]);

  const handleSave = () => {
    const prog = Math.min(100, Math.max(0, parseInt(progress, 10) || 0));
    const finalStatus = prog >= 100 ? "Done" : status;
    const finalProgress = prog >= 100 ? 100 : prog;

    onSave({
      ...task,
      status: finalStatus,
      priority,
      progress: finalProgress,
      comments: (task.comments || 0) + (comment.trim() ? 1 : 0),
      newComment: comment.trim(),
    });
  };

  if (!task) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalS.overlay}>
        <View style={modalS.sheet}>
          <View style={modalS.handle} />
          <Text style={modalS.title}>Update Task</Text>
          <Text style={modalS.taskName} numberOfLines={2}>{task.title}</Text>

          <Text style={modalS.label}>Status</Text>
          <View style={modalS.optionRow}>
            {ALL_STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[modalS.optionChip, status === s && modalS.optionChipActive]}
                onPress={() => setStatus(s)}
              >
                <Text style={[modalS.optionText, status === s && modalS.optionTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={modalS.label}>Priority</Text>
          <View style={modalS.optionRow}>
            {ALL_PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p}
                style={[modalS.optionChip, priority === p && modalS.optionChipActive]}
                onPress={() => setPriority(p)}
              >
                <Text style={[modalS.optionText, priority === p && modalS.optionTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={modalS.label}>Progress ({progress}%)</Text>
          <View style={modalS.progressSliderRow}>
            {[0, 25, 50, 75, 100].map((v) => (
              <TouchableOpacity
                key={v}
                style={[modalS.progressChip, parseInt(progress, 10) === v && modalS.progressChipActive]}
                onPress={() => setProgress(String(v))}
              >
                <Text style={[modalS.progressChipText, parseInt(progress, 10) === v && modalS.progressChipTextActive]}>
                  {v}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={modalS.input}
            value={progress}
            onChangeText={setProgress}
            keyboardType="numeric"
            placeholder="Or type a value (0–100)"
            placeholderTextColor="#9CA3AF"
            maxLength={3}
          />

          <Text style={modalS.label}>Add a Comment</Text>
          <TextInput
            style={[modalS.input, modalS.textArea]}
            value={comment}
            onChangeText={setComment}
            placeholder="What's the latest update?"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
          />

          <View style={modalS.actions}>
            <TouchableOpacity style={modalS.cancelBtn} onPress={onClose}>
              <Text style={modalS.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalS.saveBtn} onPress={handleSave}>
              <Text style={modalS.saveText}>Save Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalS = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  handle: { width: 40, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 4 },
  taskName: { fontSize: 13, color: "#6B7280", marginBottom: 20, lineHeight: 18 },
  label: { fontSize: 12, fontWeight: "700", color: "#374151", marginBottom: 8, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  optionRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  optionChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: "#F3F4F6", borderWidth: 1.5, borderColor: "transparent" },
  optionChipActive: { backgroundColor: "#FFF3ED", borderColor: "#3B82F6" },
  optionText: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  optionTextActive: { color: "#3B82F6" },
  progressSliderRow: { flexDirection: "row", gap: 6, marginBottom: 10 },
  progressChip: { flex: 1, borderRadius: 10, paddingVertical: 8, backgroundColor: "#F3F4F6", alignItems: "center", borderWidth: 1.5, borderColor: "transparent" },
  progressChipActive: { backgroundColor: "#FFF3ED", borderColor: "#3B82F6" },
  progressChipText: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  progressChipTextActive: { color: "#3B82F6" },
  input: { backgroundColor: "#F9FAFB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: "#111827", borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 4 },
  textArea: { height: 80, textAlignVertical: "top" },
  actions: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, backgroundColor: "#F3F4F6", alignItems: "center" },
  cancelText: { fontSize: 14, fontWeight: "700", color: "#6B7280" },
  saveBtn: { flex: 2, borderRadius: 14, paddingVertical: 14, backgroundColor: "#3B82F6", alignItems: "center" },
  saveText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});

function mapTask(task) {
  return {
    id: String(task.id),
    title: task.title || "",
    status: formatStatus(task.status),
    priority: formatPriority(task.priority),
    due: task.dueText || "TBD",
    comments: Number(task.commentsCount || 0),
    progress: Number(task.progress || 0),
    description: task.description || "",
  };
}

/**
 * Taskscreen
 *
 * FIX: No longer receives `loggedInUser` prop.
 * Reads empId from UserContext — same pattern as all other user screens.
 */
export default function Taskscreen() {
  const { user } = useUser();
  const employeeId = user?.empId || ""; // e.g. "BSSE001"

  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [updateTarget, setUpdateTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadTasks(mode = "load") {
    if (!employeeId) {
      setTasks([]);
      setError(
        "No employee ID found. Please log in again."
      );
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      setError("");
      if (mode === "refresh") setRefreshing(true);
      else setLoading(true);

      // ── Add timeout so loading doesn't hang forever on mobile ────
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const data = await Promise.race([
        taskApi.getUserTasks(employeeId),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Request timed out. Check your network connection.")),
            15000
          )
        ),
      ]);

      clearTimeout(timeoutId);
      setTasks((data || []).map(mapTask));
    } catch (e) {
      const msg = e.message || "Failed to load tasks";
      setError(msg);
      console.error("[Taskscreen] loadTasks error:", msg);
      setTasks([]);
    } finally {
      if (mode === "refresh") setRefreshing(false);
      else setLoading(false);
    }
  }

  useEffect(() => { loadTasks(); }, [employeeId]);

  const filters = useMemo(() => ([
    { label: "All", count: tasks.length },
    { label: "To Do", count: tasks.filter((t) => t.status === "To Do").length },
    { label: "In Progress", count: tasks.filter((t) => t.status === "In Progress").length },
    { label: "Review", count: tasks.filter((t) => t.status === "Review").length },
    { label: "Done", count: tasks.filter((t) => t.status === "Done").length },
  ]), [tasks]);

  const filtered = filter === "All" ? tasks : tasks.filter((t) => t.status === filter);
  const toDo = tasks.filter((t) => t.status === "To Do").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const review = tasks.filter((t) => t.status === "Review").length;
  const done = tasks.filter((t) => t.status === "Done").length;

  const handleUpdate = async (updated) => {
    try {
      const finalProgress = updated.progress >= 100 || updated.status === "Done"
        ? 100 : updated.progress;
      const finalStatus = finalProgress >= 100 ? "Done" : updated.status;

      await taskApi.updateTaskByUser(updated.id, {
        status: backendStatus(finalStatus),
        priority: backendPriority(updated.priority),
        progress: finalProgress,
        addComment: updated.newComment || "",
      });
      setUpdateTarget(null);
      await loadTasks("refresh");
    } catch (e) {
      setError(e.message || "Failed to update task");
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#2F6E8E" />

      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Challenges Awaiting</Text>
          <Text style={s.headerSub}>Let's tackle your to-do list</Text>
        </View>
        <TouchableOpacity
          style={s.headerIcon}
          onPress={() => loadTasks("refresh")}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 22 }}>↻</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadTasks("refresh")}
          />
        }
      >
        {!!error && <Text style={s.errorText}>{error}</Text>}

        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>Summary of Your Work</Text>
          <Text style={s.summarySub}>Your current task progress</Text>
          <View style={s.summaryRow}>
            {[
              { label: "To Do", count: toDo, emoji: "🔴" },
              { label: "In Progress", count: inProgress, emoji: "🟡" },
              { label: "Review", count: review, emoji: "🟠" },
              { label: "Done", count: done, emoji: "🟢" },
            ].map((item) => (
              <View key={item.label} style={s.summaryItem}>
                <Text style={s.summaryEmoji}>{item.emoji}</Text>
                <Text style={s.summaryCount}>{item.count}</Text>
                <Text style={s.summaryLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.filterScroll}
          contentContainerStyle={s.filterContent}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f.label}
              style={[s.filterChip, filter === f.label && s.filterChipActive]}
              onPress={() => setFilter(f.label)}
            >
              <Text style={[s.filterText, filter === f.label && s.filterTextActive]}>
                {f.label}
              </Text>
              <View style={[s.filterBadge, filter === f.label && s.filterBadgeActive]}>
                <Text style={[s.filterBadgeText, filter === f.label && s.filterBadgeTextActive]}>
                  {f.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={s.taskList}>
          {loading ? (
            <View style={s.empty}>
              <ActivityIndicator size="large" color="#2F6E8E" />
              <Text style={s.emptyText}>Loading tasks…</Text>
              <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 4, textAlign: "center" }}>
                Connecting to {BASE_URL}
              </Text>
            </View>
          ) : error ? (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>⚠️</Text>
              <Text style={[s.emptyText, { color: "#FF6B6B" }]}>Could not load tasks</Text>
              <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 4, textAlign: "center", paddingHorizontal: 20 }}>
                {error}
              </Text>
              <TouchableOpacity
                onPress={() => loadTasks()}
                style={{ marginTop: 14, backgroundColor: "#2F6E8E", borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filtered.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyEmoji}>🎉</Text>
              <Text style={s.emptyText}>
                {employeeId ? "No tasks assigned yet" : "Please log in to see your tasks"}
              </Text>
            </View>
          ) : (
            filtered.map((task) => (
              <TaskCard key={task.id} task={task} onUpdate={setUpdateTarget} />
            ))
          )}
        </View>
      </ScrollView>

      <UpdateModal
        task={updateTarget}
        visible={!!updateTarget}
        onClose={() => setUpdateTarget(null)}
        onSave={handleUpdate}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#112235" },
  scroll: { flex: 1, backgroundColor: "#F5F5F7" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, backgroundColor: "#2F6E8E" },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#fff", paddingTop: 39 },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 9 },
  headerIcon: { width: 39, height: 39, borderRadius: 10, backgroundColor: "rgba(186,230,253,0.2)", justifyContent: "center", alignItems: "center", paddingTop: 2 },
  errorText: { color: "red", fontSize: 12, marginHorizontal: 16, marginTop: 10 },
  summaryCard: { backgroundColor: "#fff", marginHorizontal: 16, marginTop: 10, borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  summaryTitle: { fontSize: 15, fontWeight: "700", color: "#3B82F6" },
  summarySub: { fontSize: 12, color: "#9CA3AF", marginBottom: 14, marginTop: 2 },
  summaryRow: { flexDirection: "row", justifyContent: "space-around", flexWrap: "wrap", gap: 8 },
  summaryItem: { alignItems: "center", flex: 1, minWidth: 70, backgroundColor: "#F9FAFB", borderRadius: 14, paddingVertical: 12 },
  summaryEmoji: { fontSize: 16, marginBottom: 4 },
  summaryCount: { fontSize: 22, fontWeight: "800", color: "#111827" },
  summaryLabel: { fontSize: 10, color: "#6B7280", marginTop: 2, fontWeight: "600" },
  filterScroll: { backgroundColor: "#F5F5F7", paddingTop: 4 },
  filterContent: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#E5E7EB" },
  filterChipActive: { backgroundColor: "#3B82F6", borderColor: "#3B82F6" },
  filterText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  filterTextActive: { color: "#fff" },
  filterBadge: { marginLeft: 6, backgroundColor: "#F3F4F6", borderRadius: 10, minWidth: 20, height: 20, justifyContent: "center", alignItems: "center", paddingHorizontal: 5 },
  filterBadgeActive: { backgroundColor: "rgba(255,255,255,0.3)" },
  filterBadgeText: { fontSize: 11, fontWeight: "700", color: "#6B7280" },
  filterBadgeTextActive: { color: "#fff" },
  taskList: { paddingHorizontal: 16, paddingTop: 4 },
  empty: { alignItems: "center", paddingVertical: 40 },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 15, color: "#9CA3AF", fontWeight: "600" },
});