/**
 * api/taskapi.js
 *
 * ROOT CAUSE FIX:
 *   Previously called /api/users/search which returned AppUser records.
 *   AppUser.employeeId != Employee.empId in many cases because they are
 *   separate tables populated independently.
 *
 *   Now /api/users/* returns Employee records (via fixed TaskController).
 *   The assigneeId sent to the backend is Employee.id (Long), and
 *   assigneeEmployeeId is Employee.empId — the same string the user
 *   gets in UserContext after login. So tasks are found by the correct key.
 */
import { API_BASE_URL, request } from "./apiClient";

export const taskApi = {
  // ── Employee search (admin task assignment dropdown) ─────────────────────
  searchUsers: (search = "") =>
    request(`/users/search?query=${encodeURIComponent(search)}`),

  getAssignableUsers: (search = "") =>
    request(`/users/search?query=${encodeURIComponent(search)}`),

  // ── Admin task endpoints ──────────────────────────────────────────────────
  getAllTasks: () => request("/tasks/admin"),

  getAdminTasks: () => request("/tasks/admin"),

  createTask: (payload) =>
    request("/tasks/admin", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateTaskByAdmin: (taskId, payload) =>
    request(`/tasks/admin/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteTask: (taskId) =>
    request(`/tasks/admin/${taskId}`, {
      method: "DELETE",
    }),

  // ── User (employee) task endpoints ───────────────────────────────────────
  /**
   * Fetch tasks for a logged-in employee.
   *
   * employeeId = user.empId from UserContext (e.g. "BSSE001")
   * Backend queries Task.assigneeEmployeeId which equals Employee.empId.
   */
  getTasksByEmployeeId: (employeeId) =>
    request(`/tasks/user/${encodeURIComponent(employeeId)}`),

  getUserTasks: (employeeId) =>
    request(`/tasks/user/${encodeURIComponent(employeeId)}`),

  getUserTaskNotifications: (employeeId) =>
    request(`/tasks/user/${encodeURIComponent(employeeId)}/notifications`),

  updateTaskByUser: (taskId, payload) =>
    request(`/tasks/user/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  markUserTaskNotificationAsRead: (taskId) =>
    request(`/tasks/user/${taskId}/notification-read`, {
      method: "PUT",
    }),

  getAdminTaskNotifications: () => request("/tasks/admin/notifications"),

  markAdminTaskNotificationAsRead: (taskId) =>
    request(`/tasks/admin/notifications/${taskId}/read`, {
      method: "PUT",
    }),

  // ── Performance helpers ───────────────────────────────────────────────────
  getPerformanceTasks: () => request("/tasks/admin"),

  getCompletedTasks: async () => {
    const tasks = await request("/tasks/admin");
    return (tasks || []).filter((task) => {
      const status = String(task.status || "").toLowerCase();
      const progress = Number(task.progress || 0);
      return status === "done" || status === "completed" || progress >= 100;
    });
  },
};

// ── userApi — now returns Employee records from /api/users/* ─────────────────
export const userApi = {
  getUsers: () => request("/users"),

  searchUsers: (search = "") =>
    request(`/users/search?query=${encodeURIComponent(search)}`),

  getUserByEmployeeId: (employeeId) =>
    request(`/users/employee/${encodeURIComponent(employeeId)}`),
};
