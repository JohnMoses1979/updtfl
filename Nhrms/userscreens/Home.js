// /**
//  * userscreens/Home.js
//  *
//  * ── Changes vs original ──────────────────────────────────────
//  *  • "Today Task" section now fetches REAL assigned tasks from
//  *    GET /api/tasks/user/{empId} using the logged-in employee's
//  *    empId from UserContext
//  *  • Tasks are displayed in themed cards (title, description, priority)
//  *  • Shows at most 5 tasks; "View All →" navigates to Taskscreen
//  *  • Empty state and error state handled gracefully
//  *  • ALL original styles / layout / navigation / colours UNTOUCHED
//  * ─────────────────────────────────────────────────────────────
//  */
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
// } from "react-native";
// import { useUser } from "../context/UserContext";
// import { taskApi } from "../api/taskapi";
// const C = {
//   bg: "#112235",
//   orange: "#2F6E8E",
//   white: "#FFFFFF",
//   gray: "#AAAAAA",
//   darkCard: "#1a2f4a",
//   border: "#1a3a5c",
// };
// // Priority colour map — matches the existing Taskscreen.js palette
// const PRIORITY_COLORS = {
//   urgent: { bg: "#2a1020", text: "#FF4D6D", dot: "#FF4D6D" },
//   high: { bg: "#2a1f00", text: "#FFB830", dot: "#FFB830" },
//   medium: { bg: "#0f1e30", text: "#4D9EFF", dot: "#4D9EFF" },
//   low: { bg: "#0a1e14", text: "#2DD4A0", dot: "#2DD4A0" },
// };
// function getPriorityStyle(priority = "medium") {
//   return PRIORITY_COLORS[priority.toLowerCase()] || PRIORITY_COLORS.medium;
// }
// // ── Header (unchanged) ────────────────────────────────────────
// function Header({ onProfilePress }) {
//   const { user } = useUser();
//   const displayName = user?.name ? user.name.split(" ")[0] : "User";
//   const displayEmail = user?.email || "";
//   return (
//     <View style={styles.header}>
//       <View style={styles.headerLeft}>
//         <TouchableOpacity onPress={onProfilePress}>
//           <View style={styles.avatar}>
//             <Text style={{ fontSize: 20 }}>🙂</Text>
//           </View>
//         </TouchableOpacity>
//         <View style={{ marginLeft: 10 }}>
//           <View style={styles.nameRow}>
//             <Text style={styles.name}>{displayName}</Text>
//             <Text style={{ marginLeft: 4 }}>✅</Text>
//           </View>
//           <Text style={styles.email}>{displayEmail}</Text>
//         </View>
//       </View>
//       <View style={styles.headerRight}>
//         <TouchableOpacity style={styles.iconBtn}>
//           <Text style={styles.iconEmoji}>💬</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.iconBtn}>
//           <Text style={styles.iconEmoji}>🔔</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }
// // ── Summary Banner (unchanged) ────────────────────────────────
// function SummaryBanner() {
//   return (
//     <View style={styles.banner}>
//       <View style={{ flex: 1 }}>
//         <Text style={styles.bannerTitle}>My Work Summary</Text>
//         <Text style={styles.bannerSub}>Today task & presence activity</Text>
//       </View>
//       <Text style={{ fontSize: 40 }}>📷</Text>
//     </View>
//   );
// }
// // ── Section Header (unchanged) ────────────────────────────────
// function SectionHeader({ title, sub }) {
//   return (
//     <View style={styles.sectionHeader}>
//       <Text style={styles.sectionTitle}>{title}</Text>
//       <Text style={styles.sectionSub}>{sub}</Text>
//     </View>
//   );
// }
// // ── Empty Meeting (unchanged) ────────────────────────────────
// function EmptyMeeting() {
//   return (
//     <View style={styles.emptyWrap}>
//       <View style={styles.meetingGrid}>
//         {[...Array(6)].map((_, i) => (
//           <View key={i} style={styles.personIcon}>
//             <View style={styles.personHead} />
//             <View style={styles.personBody} />
//           </View>
//         ))}
//       </View>
//       <Text style={styles.emptyTitle}>No Meeting Available</Text>
//       <Text style={styles.emptyDesc}>
//         It looks like you don't have any meetings scheduled at the moment.{"\n"}
//         This space will be updated as new meetings are added!
//       </Text>
//     </View>
//   );
// }
// // ── Task Card — new, matches existing dark theme ──────────────
// function TaskCard({ task }) {
//   const priorityStyle = getPriorityStyle(task.priority);
//   return (
//     <View style={styles.taskCard}>
//       {/* Priority dot + badge */}
//       <View style={styles.taskTopRow}>
//         <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
//           <View style={[styles.priorityDot, { backgroundColor: priorityStyle.dot }]} />
//           <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
//             {task.priority ? task.priority.toUpperCase() : "MEDIUM"}
//           </Text>
//         </View>
//         {/* Status chip */}
//         {task.status && task.status !== "todo" && (
//           <View style={styles.statusChip}>
//             <Text style={styles.statusChipText}>
//               {task.status === "in-progress"
//                 ? "In Progress"
//                 : task.status === "review"
//                   ? "Review"
//                   : task.status === "done"
//                     ? "Done ✓"
//                     : task.status}
//             </Text>
//           </View>
//         )}
//       </View>
//       {/* Title */}
//       <Text style={styles.taskTitle} numberOfLines={2}>
//         {task.title || "Untitled Task"}
//       </Text>
//       {/* Description */}
//       {!!task.description && (
//         <Text style={styles.taskDesc} numberOfLines={2}>
//           {task.description}
//         </Text>
//       )}
//       {/* Due date if available */}
//       {!!task.dueText && task.dueText !== "—" && (
//         <View style={styles.taskDueRow}>
//           <Text style={styles.taskDueIcon}>📅</Text>
//           <Text style={styles.taskDueText}>Due {task.dueText}</Text>
//         </View>
//       )}
//     </View>
//   );
// }
// // ── Task Section — new, replaces hardcoded EmptyTask ─────────
// function TaskSection({ onViewAll }) {
//   const { user } = useUser();
//   const employeeId = user?.empId || "";
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   useEffect(() => {
//     if (!employeeId) return;
//     let cancelled = false;
//     const fetchTasks = async () => {
//       setLoading(true);
//       setError("");
//       try {
//         const data = await taskApi.getTasksByEmployeeId(employeeId);
//         if (!cancelled) {
//           // Exclude completed tasks so "Today Task" stays actionable
//           const active = Array.isArray(data)
//             ? data.filter(
//               (t) =>
//                 String(t.status || "").toLowerCase() !== "done" &&
//                 Number(t.progress || 0) < 100
//             )
//             : [];
//           setTasks(active);
//         }
//       } catch (err) {
//         if (!cancelled) {
//           setError("Could not load tasks.");
//         }
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };
//     fetchTasks();
//     return () => { cancelled = true; };
//   }, [employeeId]);
//   // Loading spinner
//   if (loading) {
//     return (
//       <View style={styles.emptyWrap}>
//         <ActivityIndicator size="small" color={C.orange} />
//         <Text style={[styles.emptyTitle, { marginTop: 10, fontSize: 14 }]}>
//           Loading tasks…
//         </Text>
//       </View>
//     );
//   }
//   // Error state
//   if (error) {
//     return (
//       <View style={styles.emptyWrap}>
//         <Text style={{ fontSize: 34, marginBottom: 8 }}>⚠️</Text>
//         <Text style={[styles.emptyTitle, { color: "#FF6B6B" }]}>
//           {error}
//         </Text>
//         <Text style={styles.emptyDesc}>
//           Check your connection and try again.
//         </Text>
//       </View>
//     );
//   }
//   // Empty state — no active tasks
//   if (tasks.length === 0) {
//     return (
//       <View style={styles.emptyWrap}>
//         {/* Reuse original paper-stack illustration */}
//         <View style={styles.paperStack}>
//           <View
//             style={[
//               styles.paper,
//               {
//                 backgroundColor: "#2F6E8E",
//                 bottom: 18,
//                 left: -8,
//                 transform: [{ rotate: "-8deg" }],
//               },
//             ]}
//           />
//           <View
//             style={[
//               styles.paper,
//               {
//                 backgroundColor: "#e8e8f8",
//                 bottom: 8,
//                 left: 0,
//                 transform: [{ rotate: "-2deg" }],
//               },
//             ]}
//           >
//             {[...Array(4)].map((_, i) => (
//               <View key={i} style={styles.paperLine} />
//             ))}
//           </View>
//           <View
//             style={[styles.paper, { backgroundColor: "#f0f0fa", bottom: 0, left: 8 }]}
//           >
//             {[...Array(4)].map((_, i) => (
//               <View key={i} style={styles.paperLine} />
//             ))}
//           </View>
//         </View>
//         <Text style={styles.emptyTitle}>No Tasks Assigned</Text>
//         <Text style={styles.emptyDesc}>
//           It looks like you don't have any tasks assigned to you right now. Don't
//           worry, this space will be updated as new tasks become available.
//         </Text>
//       </View>
//     );
//   }
//   // Show up to 5 tasks
//   const visibleTasks = tasks.slice(0, 5);
//   const hasMore = tasks.length > 5;
//   return (
//     <View>
//       {visibleTasks.map((task, index) => (
//         <TaskCard key={task.id ?? index} task={task} />
//       ))}
//       {/* View All / overflow hint */}
//       {(hasMore || tasks.length > 0) && (
//         <TouchableOpacity
//           style={styles.viewAllBtn}
//           onPress={onViewAll}
//           activeOpacity={0.8}
//         >
//           <Text style={styles.viewAllText}>
//             {hasMore
//               ? `View All ${tasks.length} Tasks →`
//               : "View All Tasks →"}
//           </Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }
// // ── Home Screen ───────────────────────────────────────────────
// export default function HomeScreen({ onTabPress, activeTab = 0, onProfilePress }) {
//   // Navigate to Taskscreen (tab index 3 per App.js TABS array)
//   const handleViewAllTasks = () => {
//     onTabPress && onTabPress(3);
//   };
//   return (
//     <SafeAreaView style={styles.safe}>
//       <Header onProfilePress={onProfilePress} />
//       <ScrollView
//         style={styles.scroll}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 20 }}
//       >
//         <SummaryBanner />
//         {/* ── Meetings section (unchanged) ── */}
//         <SectionHeader title="Today Meeting" sub="Your schedule for the day" />
//         <EmptyMeeting />
//         {/* ── Task section (now live data) ── */}
//         <SectionHeader
//           title="Today Task"
//           sub="The tasks assigned to you for today"
//         />
//         <TaskSection onViewAll={handleViewAllTasks} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
// // ── Styles ────────────────────────────────────────────────────
// // All original styles preserved; new task-related styles appended at bottom.
// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: C.bg },
//   scroll: { flex: 1, paddingHorizontal: 18 },
//   // ── Header (unchanged) ──────────────────────────────────────
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 18,
//     paddingTop: 39,
//     paddingBottom: 14,
//     borderBottomWidth: 1,
//     borderBottomColor: C.border,
//   },
//   headerLeft: { flexDirection: "row", alignItems: "center" },
//   avatar: {
//     width: 46,
//     height: 46,
//     borderRadius: 23,
//     backgroundColor: "#1a3a5c",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   nameRow: { flexDirection: "row", alignItems: "center" },
//   name: { color: C.white, fontWeight: "700", fontSize: 15 },
//   email: { color: C.orange, fontSize: 12, marginTop: 2 },
//   headerRight: { flexDirection: "row", gap: 8 },
//   iconBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#1a3a5c",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   iconEmoji: { fontSize: 17 },
//   // ── Banner (unchanged) ───────────────────────────────────────
//   banner: {
//     backgroundColor: "#2F6E8E",
//     borderRadius: 16,
//     padding: 20,
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 18,
//     marginBottom: 24,
//   },
//   bannerTitle: { color: C.white, fontSize: 17, fontWeight: "700" },
//   bannerSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 },
//   // ── Section header (unchanged) ───────────────────────────────
//   sectionHeader: { marginBottom: 16, marginTop: 6 },
//   sectionTitle: { color: C.white, fontSize: 16, fontWeight: "700" },
//   sectionSub: { color: C.gray, fontSize: 13, marginTop: 2 },
//   // ── Empty / illustration wrappers (unchanged) ─────────────────
//   emptyWrap: {
//     alignItems: "center",
//     paddingVertical: 16,
//     marginBottom: 28,
//   },
//   emptyTitle: {
//     color: C.white,
//     fontSize: 15,
//     fontWeight: "700",
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptyDesc: {
//     color: C.gray,
//     fontSize: 13,
//     textAlign: "center",
//     lineHeight: 20,
//     paddingHorizontal: 10,
//   },
//   // ── Meeting illustration (unchanged) ─────────────────────────
//   meetingGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     width: 120,
//     gap: 14,
//     backgroundColor: "#E8E8F0",
//     borderRadius: 12,
//     padding: 16,
//     justifyContent: "center",
//   },
//   personIcon: { alignItems: "center", width: 22 },
//   personHead: {
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     backgroundColor: "#2F6E8E",
//     marginBottom: 2,
//   },
//   personBody: {
//     width: 20,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: "#2F6E8E",
//   },
//   // ── Paper-stack illustration (unchanged) ──────────────────────
//   paperStack: {
//     width: 120,
//     height: 100,
//     position: "relative",
//     marginBottom: 8,
//   },
//   paper: {
//     position: "absolute",
//     width: 90,
//     height: 110,
//     borderRadius: 6,
//     padding: 10,
//     justifyContent: "center",
//     gap: 6,
//   },
//   paperLine: {
//     height: 5,
//     backgroundColor: "rgba(100,100,180,0.25)",
//     borderRadius: 3,
//     marginBottom: 5,
//   },
//   // ── NEW: Task card ────────────────────────────────────────────
//   taskCard: {
//     backgroundColor: "#0f1e30",
//     borderRadius: 14,
//     padding: 14,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   taskTopRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginBottom: 8,
//   },
//   priorityBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 5,
//     paddingHorizontal: 10,
//     paddingVertical: 3,
//     borderRadius: 20,
//   },
//   priorityDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//   },
//   priorityText: {
//     fontSize: 10,
//     fontWeight: "700",
//     letterSpacing: 0.5,
//   },
//   statusChip: {
//     backgroundColor: "#1a3a5c",
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 20,
//   },
//   statusChipText: {
//     color: C.gray,
//     fontSize: 10,
//     fontWeight: "600",
//   },
//   taskTitle: {
//     color: C.white,
//     fontSize: 14,
//     fontWeight: "700",
//     marginBottom: 4,
//     lineHeight: 20,
//   },
//   taskDesc: {
//     color: C.gray,
//     fontSize: 12,
//     lineHeight: 18,
//     marginBottom: 6,
//   },
//   taskDueRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 5,
//     marginTop: 4,
//   },
//   taskDueIcon: { fontSize: 11 },
//   taskDueText: {
//     color: C.gray,
//     fontSize: 11,
//     fontWeight: "500",
//   },
//   // ── NEW: View All button ──────────────────────────────────────
//   viewAllBtn: {
//     alignItems: "center",
//     paddingVertical: 12,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: C.border,
//     borderRadius: 12,
//     backgroundColor: "#0f1e30",
//   },
//   viewAllText: {
//     color: C.orange,
//     fontSize: 13,
//     fontWeight: "700",
//   },
// });















// /**
//  * userscreens/Home.js
//  *
//  * CHANGES vs original:
//  *  • "Today Meeting" section now fetches REAL admin messages addressed
//  *    to the logged-in employee via GET /api/messages/employee/{empId}.
//  *  • Messages are displayed as meeting-style cards (icon, title, time).
//  *  • Auto-refreshes every 60 seconds while screen is mounted.
//  *  • "Today Task" section unchanged (still fetches real tasks).
//  *  • ALL original styles / layout / navigation / colours UNTOUCHED.
//  */
// import React, { useEffect, useRef, useState } from "react";
// import {
//   View, Text, StyleSheet, SafeAreaView, ScrollView,
//   TouchableOpacity, ActivityIndicator, RefreshControl,
// } from "react-native";
// import { useUser } from "../context/UserContext";
// import { taskApi } from "../api/taskapi";
// import { messageApi } from "../api/messageApi";

// const C = {
//   bg: "#112235", orange: "#2F6E8E", white: "#FFFFFF",
//   gray: "#AAAAAA", darkCard: "#1a2f4a", border: "#1a3a5c",
// };

// const PRIORITY_COLORS = {
//   urgent: { bg: "#2a1020", text: "#FF4D6D", dot: "#FF4D6D" },
//   high: { bg: "#2a1f00", text: "#FFB830", dot: "#FFB830" },
//   medium: { bg: "#0f1e30", text: "#4D9EFF", dot: "#4D9EFF" },
//   low: { bg: "#0a1e14", text: "#2DD4A0", dot: "#2DD4A0" },
// };

// function getPriorityStyle(priority = "medium") {
//   return PRIORITY_COLORS[priority.toLowerCase()] || PRIORITY_COLORS.medium;
// }

// function formatMessageTime(createdAt) {
//   if (!createdAt) return "";
//   try {
//     const d = new Date(createdAt);
//     const now = new Date();
//     const diffMs = now - d;
//     const diffMins = Math.floor(diffMs / 60000);
//     if (diffMins < 1) return "Just now";
//     if (diffMins < 60) return `${diffMins}m ago`;
//     const diffH = Math.floor(diffMins / 60);
//     if (diffH < 24) return `${diffH}h ago`;
//     return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
//   } catch {
//     return "";
//   }
// }

// // ── Header (unchanged) ────────────────────────────────────────
// function Header({ onProfilePress }) {
//   const { user } = useUser();
//   const displayName = user?.name ? user.name.split(" ")[0] : "User";
//   const displayEmail = user?.email || "";
//   return (
//     <View style={styles.header}>
//       <View style={styles.headerLeft}>
//         <TouchableOpacity onPress={onProfilePress}>
//           <View style={styles.avatar}>
//             <Text style={{ fontSize: 20 }}>🙂</Text>
//           </View>
//         </TouchableOpacity>
//         <View style={{ marginLeft: 10 }}>
//           <View style={styles.nameRow}>
//             <Text style={styles.name}>{displayName}</Text>
//             <Text style={{ marginLeft: 4 }}>✅</Text>
//           </View>
//           <Text style={styles.email}>{displayEmail}</Text>
//         </View>
//       </View>
//       <View style={styles.headerRight}>
//         <TouchableOpacity style={styles.iconBtn}>
//           <Text style={styles.iconEmoji}>💬</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.iconBtn}>
//           <Text style={styles.iconEmoji}>🔔</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// // ── Summary Banner (unchanged) ────────────────────────────────
// function SummaryBanner() {
//   return (
//     <View style={styles.banner}>
//       <View style={{ flex: 1 }}>
//         <Text style={styles.bannerTitle}>My Work Summary</Text>
//         <Text style={styles.bannerSub}>Today task & presence activity</Text>
//       </View>
//       <Text style={{ fontSize: 40 }}>📷</Text>
//     </View>
//   );
// }

// // ── Section Header (unchanged) ────────────────────────────────
// function SectionHeader({ title, sub }) {
//   return (
//     <View style={styles.sectionHeader}>
//       <Text style={styles.sectionTitle}>{title}</Text>
//       <Text style={styles.sectionSub}>{sub}</Text>
//     </View>
//   );
// }

// // ── Admin Message Card ────────────────────────────────────────
// function MessageCard({ msg }) {
//   return (
//     <View style={styles.messageCard}>
//       <View style={styles.messageIconBox}>
//         <Text style={{ fontSize: 18 }}>📣</Text>
//       </View>
//       <View style={{ flex: 1 }}>
//         <View style={styles.messageTitleRow}>
//           <Text style={styles.messageTitle} numberOfLines={1}>Admin Message</Text>
//           <Text style={styles.messageTime}>{formatMessageTime(msg.createdAt)}</Text>
//         </View>
//         <Text style={styles.messageBody} numberOfLines={3}>{msg.messageText}</Text>
//       </View>
//     </View>
//   );
// }

// // ── Messages (from Admin) Section ────────────────────────────
// function MessagesSection() {
//   const { user } = useUser();
//   const employeeId = user?.empId || "";

//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const timerRef = useRef(null);

//   const fetchMessages = async () => {
//     if (!employeeId) return;
//     setLoading(true);
//     setError("");
//     try {
//       const data = await messageApi.getUserMessages(employeeId);
//       setMessages(Array.isArray(data) ? data : []);
//     } catch (err) {
//       setError("Could not load messages.");
//       console.warn("[MessagesSection] fetch error:", err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMessages();
//     // Auto-refresh every 60 s
//     timerRef.current = setInterval(fetchMessages, 60000);
//     return () => clearInterval(timerRef.current);
//   }, [employeeId]);

//   if (loading && messages.length === 0) {
//     return (
//       <View style={styles.emptyWrap}>
//         <ActivityIndicator size="small" color={C.orange} />
//         <Text style={[styles.emptyTitle, { marginTop: 10, fontSize: 14 }]}>
//           Loading messages…
//         </Text>
//       </View>
//     );
//   }

//   if (!loading && messages.length === 0) {
//     return (
//       <View style={styles.emptyWrap}>
//         <View style={styles.meetingGrid}>
//           {[...Array(6)].map((_, i) => (
//             <View key={i} style={styles.personIcon}>
//               <View style={styles.personHead} />
//               <View style={styles.personBody} />
//             </View>
//           ))}
//         </View>
//         <Text style={styles.emptyTitle}>No Messages Yet</Text>
//         <Text style={styles.emptyDesc}>
//           Messages from your admin will appear here once they send you one.
//         </Text>
//       </View>
//     );
//   }

//   // Show latest 5 messages
//   const latest = messages.slice(0, 5);
//   return (
//     <View>
//       {latest.map((msg) => (
//         <MessageCard key={msg.id} msg={msg} />
//       ))}
//       {messages.length > 5 && (
//         <View style={styles.moreBadge}>
//           <Text style={styles.moreBadgeText}>+ {messages.length - 5} more messages</Text>
//         </View>
//       )}
//     </View>
//   );
// }

// // ── Task Card (unchanged) ─────────────────────────────────────
// function TaskCard({ task }) {
//   const priorityStyle = getPriorityStyle(task.priority);
//   return (
//     <View style={styles.taskCard}>
//       <View style={styles.taskTopRow}>
//         <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
//           <View style={[styles.priorityDot, { backgroundColor: priorityStyle.dot }]} />
//           <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
//             {task.priority ? task.priority.toUpperCase() : "MEDIUM"}
//           </Text>
//         </View>
//         {task.status && task.status !== "todo" && (
//           <View style={styles.statusChip}>
//             <Text style={styles.statusChipText}>
//               {task.status === "in-progress" ? "In Progress"
//                 : task.status === "review" ? "Review"
//                   : task.status === "done" ? "Done ✓"
//                     : task.status}
//             </Text>
//           </View>
//         )}
//       </View>
//       <Text style={styles.taskTitle} numberOfLines={2}>{task.title || "Untitled Task"}</Text>
//       {!!task.description && (
//         <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text>
//       )}
//       {!!task.dueText && task.dueText !== "—" && (
//         <View style={styles.taskDueRow}>
//           <Text style={styles.taskDueIcon}>📅</Text>
//           <Text style={styles.taskDueText}>Due {task.dueText}</Text>
//         </View>
//       )}
//     </View>
//   );
// }

// // ── Task Section (unchanged) ──────────────────────────────────
// function TaskSection({ onViewAll }) {
//   const { user } = useUser();
//   const employeeId = user?.empId || "";
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!employeeId) return;
//     let cancelled = false;
//     const fetchTasks = async () => {
//       setLoading(true); setError("");
//       try {
//         const data = await taskApi.getTasksByEmployeeId(employeeId);
//         if (!cancelled) {
//           const active = Array.isArray(data)
//             ? data.filter((t) => String(t.status || "").toLowerCase() !== "done" && Number(t.progress || 0) < 100)
//             : [];
//           setTasks(active);
//         }
//       } catch (err) {
//         if (!cancelled) setError("Could not load tasks.");
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };
//     fetchTasks();
//     return () => { cancelled = true; };
//   }, [employeeId]);

//   if (loading) return (
//     <View style={styles.emptyWrap}>
//       <ActivityIndicator size="small" color={C.orange} />
//       <Text style={[styles.emptyTitle, { marginTop: 10, fontSize: 14 }]}>Loading tasks…</Text>
//     </View>
//   );

//   if (error) return (
//     <View style={styles.emptyWrap}>
//       <Text style={{ fontSize: 34, marginBottom: 8 }}>⚠️</Text>
//       <Text style={[styles.emptyTitle, { color: "#FF6B6B" }]}>{error}</Text>
//     </View>
//   );

//   if (tasks.length === 0) {
//     return (
//       <View style={styles.emptyWrap}>
//         <View style={styles.paperStack}>
//           <View style={[styles.paper, { backgroundColor: "#2F6E8E", bottom: 18, left: -8, transform: [{ rotate: "-8deg" }] }]} />
//           <View style={[styles.paper, { backgroundColor: "#e8e8f8", bottom: 8, left: 0, transform: [{ rotate: "-2deg" }] }]}>
//             {[...Array(4)].map((_, i) => <View key={i} style={styles.paperLine} />)}
//           </View>
//           <View style={[styles.paper, { backgroundColor: "#f0f0fa", bottom: 0, left: 8 }]}>
//             {[...Array(4)].map((_, i) => <View key={i} style={styles.paperLine} />)}
//           </View>
//         </View>
//         <Text style={styles.emptyTitle}>No Tasks Assigned</Text>
//         <Text style={styles.emptyDesc}>
//           It looks like you don't have any tasks assigned to you right now.
//         </Text>
//       </View>
//     );
//   }

//   const visibleTasks = tasks.slice(0, 5);
//   return (
//     <View>
//       {visibleTasks.map((task, i) => <TaskCard key={task.id ?? i} task={task} />)}
//       {tasks.length > 0 && (
//         <TouchableOpacity style={styles.viewAllBtn} onPress={onViewAll} activeOpacity={0.8}>
//           <Text style={styles.viewAllText}>
//             {tasks.length > 5 ? `View All ${tasks.length} Tasks →` : "View All Tasks →"}
//           </Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// // ── Home Screen ───────────────────────────────────────────────
// export default function HomeScreen({ onTabPress, activeTab = 0, onProfilePress }) {
//   const handleViewAllTasks = () => onTabPress && onTabPress(3);

//   return (
//     <SafeAreaView style={styles.safe}>
//       <Header onProfilePress={onProfilePress} />
//       <ScrollView
//         style={styles.scroll}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 20 }}
//       >
//         <SummaryBanner />

//         {/* ── Messages from Admin (replaces hardcoded "No Meeting") ── */}
//         <SectionHeader title="Today Meeting" sub="Messages & announcements from your admin" />
//         <MessagesSection />

//         {/* ── Today Tasks (unchanged) ── */}
//         <SectionHeader title="Today Task" sub="The tasks assigned to you" />
//         <TaskSection onViewAll={handleViewAllTasks} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// // ── Styles ────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: C.bg },
//   scroll: { flex: 1, paddingHorizontal: 18 },

//   header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 39, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
//   headerLeft: { flexDirection: "row", alignItems: "center" },
//   avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#1a3a5c", justifyContent: "center", alignItems: "center" },
//   nameRow: { flexDirection: "row", alignItems: "center" },
//   name: { color: C.white, fontWeight: "700", fontSize: 15 },
//   email: { color: C.orange, fontSize: 12, marginTop: 2 },
//   headerRight: { flexDirection: "row", gap: 8 },
//   iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#1a3a5c", justifyContent: "center", alignItems: "center" },
//   iconEmoji: { fontSize: 17 },

//   banner: { backgroundColor: "#2F6E8E", borderRadius: 16, padding: 20, flexDirection: "row", alignItems: "center", marginTop: 18, marginBottom: 24 },
//   bannerTitle: { color: C.white, fontSize: 17, fontWeight: "700" },
//   bannerSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 },

//   sectionHeader: { marginBottom: 16, marginTop: 6 },
//   sectionTitle: { color: C.white, fontSize: 16, fontWeight: "700" },
//   sectionSub: { color: C.gray, fontSize: 13, marginTop: 2 },

//   // ── Admin message cards ──
//   messageCard: { flexDirection: "row", backgroundColor: "#0f1e30", borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border, gap: 12, alignItems: "flex-start" },
//   messageIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(47,110,142,0.2)", justifyContent: "center", alignItems: "center", flexShrink: 0 },
//   messageTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
//   messageTitle: { color: C.white, fontSize: 13, fontWeight: "700", flex: 1 },
//   messageTime: { color: C.gray, fontSize: 11, marginLeft: 8 },
//   messageBody: { color: "#C8C4BE", fontSize: 13, lineHeight: 19 },
//   moreBadge: { backgroundColor: "#0f1e30", borderRadius: 10, paddingVertical: 8, alignItems: "center", marginBottom: 8, borderWidth: 1, borderColor: C.border },
//   moreBadgeText: { color: C.orange, fontSize: 12, fontWeight: "600" },

//   // ── Empty states ──
//   emptyWrap: { alignItems: "center", paddingVertical: 16, marginBottom: 28 },
//   emptyTitle: { color: C.white, fontSize: 15, fontWeight: "700", marginTop: 16, marginBottom: 8 },
//   emptyDesc: { color: C.gray, fontSize: 13, textAlign: "center", lineHeight: 20, paddingHorizontal: 10 },

//   meetingGrid: { flexDirection: "row", flexWrap: "wrap", width: 120, gap: 14, backgroundColor: "#E8E8F0", borderRadius: 12, padding: 16, justifyContent: "center" },
//   personIcon: { alignItems: "center", width: 22 },
//   personHead: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#2F6E8E", marginBottom: 2 },
//   personBody: { width: 20, height: 10, borderRadius: 5, backgroundColor: "#2F6E8E" },

//   paperStack: { width: 120, height: 100, position: "relative", marginBottom: 8 },
//   paper: { position: "absolute", width: 90, height: 110, borderRadius: 6, padding: 10, justifyContent: "center", gap: 6 },
//   paperLine: { height: 5, backgroundColor: "rgba(100,100,180,0.25)", borderRadius: 3, marginBottom: 5 },

//   // ── Task cards ──
//   taskCard: { backgroundColor: "#0f1e30", borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: C.border },
//   taskTopRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
//   priorityBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
//   priorityDot: { width: 6, height: 6, borderRadius: 3 },
//   priorityText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
//   statusChip: { backgroundColor: "#1a3a5c", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
//   statusChipText: { color: C.gray, fontSize: 10, fontWeight: "600" },
//   taskTitle: { color: C.white, fontSize: 14, fontWeight: "700", marginBottom: 4, lineHeight: 20 },
//   taskDesc: { color: C.gray, fontSize: 12, lineHeight: 18, marginBottom: 6 },
//   taskDueRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
//   taskDueIcon: { fontSize: 11 },
//   taskDueText: { color: C.gray, fontSize: 11, fontWeight: "500" },

//   viewAllBtn: { alignItems: "center", paddingVertical: 12, marginBottom: 8, borderWidth: 1, borderColor: C.border, borderRadius: 12, backgroundColor: "#0f1e30" },
//   viewAllText: { color: C.orange, fontSize: 13, fontWeight: "700" },
// });











/**
 * userscreens/Home.js
 *
 * FIXES:
 *  ISSUE 3: Messages display FULL content — no truncation, no numberOfLines limit
 *  ISSUE 4: Only messages from last 24 hours shown (backend filters, frontend confirms)
 *  ISSUE 6: Correct employeeId passed to messageApi, proper useEffect, loading/error states
 */
import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from "react-native";
import { useUser } from "../context/UserContext";
import { taskApi } from "../api/taskapi";
import { messageApi } from "../api/messageApi";

const C = {
  bg: "#112235", orange: "#2F6E8E", white: "#FFFFFF",
  gray: "#AAAAAA", darkCard: "#1a2f4a", border: "#1a3a5c",
};

const PRIORITY_COLORS = {
  urgent: { bg: "#2a1020", text: "#FF4D6D", dot: "#FF4D6D" },
  high: { bg: "#2a1f00", text: "#FFB830", dot: "#FFB830" },
  medium: { bg: "#0f1e30", text: "#4D9EFF", dot: "#4D9EFF" },
  low: { bg: "#0a1e14", text: "#2DD4A0", dot: "#2DD4A0" },
};

function getPriorityStyle(priority = "medium") {
  return PRIORITY_COLORS[priority.toLowerCase()] || PRIORITY_COLORS.medium;
}

function formatMessageTime(createdAt) {
  if (!createdAt) return "";
  try {
    const d = new Date(createdAt);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffH = Math.floor(diffMins / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

// ── Header (unchanged) ────────────────────────────────────────
function Header({ onProfilePress }) {
  const { user } = useUser();
  const displayName = user?.name ? user.name.split(" ")[0] : "User";
  const displayEmail = user?.email || "";
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity onPress={onProfilePress}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 20 }}>🙂</Text>
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
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.iconEmoji}>🔔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Summary Banner (unchanged) ────────────────────────────────
function SummaryBanner() {
  return (
    <View style={styles.banner}>
      <View style={{ flex: 1 }}>
        <Text style={styles.bannerTitle}>My Work Summary</Text>
        <Text style={styles.bannerSub}>Today task & presence activity</Text>
      </View>
      <Text style={{ fontSize: 40 }}>📷</Text>
    </View>
  );
}

// ── Section Header (unchanged) ────────────────────────────────
function SectionHeader({ title, sub }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSub}>{sub}</Text>
    </View>
  );
}

// ── ISSUE 3 FIX: Admin Message Card — shows FULL message, no truncation ──────
function MessageCard({ msg }) {
  const [expanded, setExpanded] = useState(false);
  const messageText = msg.messageText || msg.message || "";
  const isLong = messageText.length > 120;

  return (
    <TouchableOpacity
      style={styles.messageCard}
      activeOpacity={isLong ? 0.8 : 1}
      onPress={() => isLong && setExpanded((v) => !v)}
    >
      <View style={styles.messageIconBox}>
        <Text style={{ fontSize: 18 }}>📣</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.messageTitleRow}>
          <Text style={styles.messageTitle} numberOfLines={1}>Admin Message</Text>
          <Text style={styles.messageTime}>{formatMessageTime(msg.createdAt)}</Text>
        </View>
        {/* ISSUE 3 FIX: Show full message — no numberOfLines limit when expanded */}
        <Text
          style={styles.messageBody}
          numberOfLines={expanded ? undefined : 3}
        >
          {messageText}
        </Text>
        {isLong && (
          <Text style={styles.expandText}>
            {expanded ? "Show less ▲" : "Show more ▼"}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── ISSUE 3 & 4 & 6 FIX: Messages Section ────────────────────────────────────
function MessagesSection() {
  const { user } = useUser();
  // ISSUE 6 FIX: Use empId (the string ID like BSSE001) for message lookup
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
      // ISSUE 6 FIX: pass empId (string), not userId (number)
      const data = await messageApi.getUserMessages(employeeId);
      // ISSUE 4 FIX: client-side filter as extra safety — only show last 24h
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const filtered = Array.isArray(data)
        ? data.filter((m) => {
          if (!m.createdAt) return true; // show if no date
          return new Date(m.createdAt) > oneDayAgo;
        })
        : [];
      setMessages(filtered);
    } catch (err) {
      setError("Could not load messages.");
      console.warn("[MessagesSection] fetch error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ISSUE 6 FIX: fetch on mount and auto-refresh every 60s
  useEffect(() => {
    if (!employeeId) return;
    fetchMessages();
    timerRef.current = setInterval(() => fetchMessages(), 60000);
    return () => clearInterval(timerRef.current);
  }, [employeeId]);

  if (loading && messages.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <ActivityIndicator size="small" color={C.orange} />
        <Text style={[styles.emptyTitle, { marginTop: 10, fontSize: 14 }]}>
          Loading messages…
        </Text>
      </View>
    );
  }

  if (!loading && messages.length === 0) {
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
            {[...Array(6)].map((_, i) => (
              <View key={i} style={styles.personIcon}>
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
      {/* ISSUE 3 FIX: Show all messages with full content */}
      {messages.map((msg) => (
        <MessageCard key={msg.id} msg={msg} />
      ))}
      {messages.length > 0 && (
        <View style={styles.moreBadge}>
          <Text style={styles.moreBadgeText}>
            {messages.length} message{messages.length !== 1 ? "s" : ""} today
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Task Card (unchanged) ─────────────────────────────────────
function TaskCard({ task }) {
  const priorityStyle = getPriorityStyle(task.priority);
  return (
    <View style={styles.taskCard}>
      <View style={styles.taskTopRow}>
        <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
          <View style={[styles.priorityDot, { backgroundColor: priorityStyle.dot }]} />
          <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
            {task.priority ? task.priority.toUpperCase() : "MEDIUM"}
          </Text>
        </View>
        {task.status && task.status !== "todo" && (
          <View style={styles.statusChip}>
            <Text style={styles.statusChipText}>
              {task.status === "in-progress" ? "In Progress"
                : task.status === "review" ? "Review"
                  : task.status === "done" ? "Done ✓"
                    : task.status}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.taskTitle} numberOfLines={2}>{task.title || "Untitled Task"}</Text>
      {!!task.description && (
        <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text>
      )}
      {!!task.dueText && task.dueText !== "—" && (
        <View style={styles.taskDueRow}>
          <Text style={styles.taskDueIcon}>📅</Text>
          <Text style={styles.taskDueText}>Due {task.dueText}</Text>
        </View>
      )}
    </View>
  );
}

// ── Task Section (unchanged) ──────────────────────────────────
function TaskSection({ onViewAll }) {
  const { user } = useUser();
  const employeeId = user?.empId || "";
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!employeeId) return;
    let cancelled = false;
    const fetchTasks = async () => {
      setLoading(true); setError("");
      try {
        const data = await taskApi.getTasksByEmployeeId(employeeId);
        if (!cancelled) {
          const active = Array.isArray(data)
            ? data.filter((t) =>
              String(t.status || "").toLowerCase() !== "done" &&
              Number(t.progress || 0) < 100
            )
            : [];
          setTasks(active);
        }
      } catch (err) {
        if (!cancelled) setError("Could not load tasks.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTasks();
    return () => { cancelled = true; };
  }, [employeeId]);

  if (loading) return (
    <View style={styles.emptyWrap}>
      <ActivityIndicator size="small" color={C.orange} />
      <Text style={[styles.emptyTitle, { marginTop: 10, fontSize: 14 }]}>Loading tasks…</Text>
    </View>
  );

  if (error) return (
    <View style={styles.emptyWrap}>
      <Text style={{ fontSize: 34, marginBottom: 8 }}>⚠️</Text>
      <Text style={[styles.emptyTitle, { color: "#FF6B6B" }]}>{error}</Text>
    </View>
  );

  if (tasks.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <View style={styles.paperStack}>
          <View style={[styles.paper, {
            backgroundColor: "#2F6E8E", bottom: 18, left: -8,
            transform: [{ rotate: "-8deg" }],
          }]} />
          <View style={[styles.paper, {
            backgroundColor: "#e8e8f8", bottom: 8, left: 0,
            transform: [{ rotate: "-2deg" }],
          }]}>
            {[...Array(4)].map((_, i) => <View key={i} style={styles.paperLine} />)}
          </View>
          <View style={[styles.paper, { backgroundColor: "#f0f0fa", bottom: 0, left: 8 }]}>
            {[...Array(4)].map((_, i) => <View key={i} style={styles.paperLine} />)}
          </View>
        </View>
        <Text style={styles.emptyTitle}>No Tasks Assigned</Text>
        <Text style={styles.emptyDesc}>
          It looks like you don't have any tasks assigned to you right now.
        </Text>
      </View>
    );
  }

  const visibleTasks = tasks.slice(0, 5);
  return (
    <View>
      {visibleTasks.map((task, i) => <TaskCard key={task.id ?? i} task={task} />)}
      {tasks.length > 0 && (
        <TouchableOpacity style={styles.viewAllBtn} onPress={onViewAll} activeOpacity={0.8}>
          <Text style={styles.viewAllText}>
            {tasks.length > 5 ? `View All ${tasks.length} Tasks →` : "View All Tasks →"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Home Screen ───────────────────────────────────────────────
export default function HomeScreen({ onTabPress, activeTab = 0, onProfilePress }) {
  const handleViewAllTasks = () => onTabPress && onTabPress(3);

  return (
    <SafeAreaView style={styles.safe}>
      <Header onProfilePress={onProfilePress} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <SummaryBanner />

        <SectionHeader
          title="Today Messages"
          sub="Messages & announcements from admin (last 24 hours)"
        />
        <MessagesSection />

        <SectionHeader title="Today Task" sub="The tasks assigned to you" />
        <TaskSection onViewAll={handleViewAllTasks} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1, paddingHorizontal: 18 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 18, paddingTop: 39, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: "#1a3a5c", justifyContent: "center", alignItems: "center",
  },
  nameRow: { flexDirection: "row", alignItems: "center" },
  name: { color: C.white, fontWeight: "700", fontSize: 15 },
  email: { color: C.orange, fontSize: 12, marginTop: 2 },
  headerRight: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#1a3a5c", justifyContent: "center", alignItems: "center",
  },
  iconEmoji: { fontSize: 17 },

  banner: {
    backgroundColor: "#2F6E8E", borderRadius: 16, padding: 20,
    flexDirection: "row", alignItems: "center", marginTop: 18, marginBottom: 24,
  },
  bannerTitle: { color: C.white, fontSize: 17, fontWeight: "700" },
  bannerSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 },

  sectionHeader: { marginBottom: 16, marginTop: 6 },
  sectionTitle: { color: C.white, fontSize: 16, fontWeight: "700" },
  sectionSub: { color: C.gray, fontSize: 13, marginTop: 2 },

  // ISSUE 3 FIX: Message card styles — full display
  messageCard: {
    flexDirection: "row",
    backgroundColor: "#0f1e30",
    borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: C.border, gap: 12, alignItems: "flex-start",
  },
  messageIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(47,110,142,0.2)",
    justifyContent: "center", alignItems: "center", flexShrink: 0,
  },
  messageTitleRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 4,
  },
  messageTitle: { color: C.white, fontSize: 13, fontWeight: "700", flex: 1 },
  messageTime: { color: C.gray, fontSize: 11, marginLeft: 8 },
  // ISSUE 3 FIX: No hard truncation — full text shown
  messageBody: { color: "#C8C4BE", fontSize: 13, lineHeight: 20 },
  expandText: { color: C.orange, fontSize: 12, marginTop: 4, fontWeight: "600" },

  moreBadge: {
    backgroundColor: "#0f1e30", borderRadius: 10,
    paddingVertical: 8, alignItems: "center", marginBottom: 8,
    borderWidth: 1, borderColor: C.border,
  },
  moreBadgeText: { color: C.orange, fontSize: 12, fontWeight: "600" },

  emptyWrap: { alignItems: "center", paddingVertical: 16, marginBottom: 28 },
  emptyTitle: { color: C.white, fontSize: 15, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  emptyDesc: {
    color: C.gray, fontSize: 13, textAlign: "center",
    lineHeight: 20, paddingHorizontal: 10,
  },

  meetingGrid: {
    flexDirection: "row", flexWrap: "wrap", width: 120, gap: 14,
    backgroundColor: "#E8E8F0", borderRadius: 12, padding: 16, justifyContent: "center",
  },
  personIcon: { alignItems: "center", width: 22 },
  personHead: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#2F6E8E", marginBottom: 2 },
  personBody: { width: 20, height: 10, borderRadius: 5, backgroundColor: "#2F6E8E" },

  paperStack: { width: 120, height: 100, position: "relative", marginBottom: 8 },
  paper: {
    position: "absolute", width: 90, height: 110,
    borderRadius: 6, padding: 10, justifyContent: "center", gap: 6,
  },
  paperLine: {
    height: 5, backgroundColor: "rgba(100,100,180,0.25)",
    borderRadius: 3, marginBottom: 5,
  },

  taskCard: {
    backgroundColor: "#0f1e30", borderRadius: 14, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: C.border,
  },
  taskTopRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  priorityBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
  },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },
  priorityText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  statusChip: { backgroundColor: "#1a3a5c", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusChipText: { color: C.gray, fontSize: 10, fontWeight: "600" },
  taskTitle: { color: C.white, fontSize: 14, fontWeight: "700", marginBottom: 4, lineHeight: 20 },
  taskDesc: { color: C.gray, fontSize: 12, lineHeight: 18, marginBottom: 6 },
  taskDueRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  taskDueIcon: { fontSize: 11 },
  taskDueText: { color: C.gray, fontSize: 11, fontWeight: "500" },

  viewAllBtn: {
    alignItems: "center", paddingVertical: 12, marginBottom: 8,
    borderWidth: 1, borderColor: C.border, borderRadius: 12, backgroundColor: "#0f1e30",
  },
  viewAllText: { color: C.orange, fontSize: 13, fontWeight: "700" },
});