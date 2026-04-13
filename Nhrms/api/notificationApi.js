// api/notificationApi.js
import { request } from "./apiClient";

export const notificationApi = {
    // Get pending signup approvals for admin
    getAdminNotifications: () =>
        request("/employees/admin-notifications"),

    // Get pending approval employees
    getPendingApprovals: () =>
        request("/employees/pending-approval"),

    // Approve employee signup
    approveEmployee: (employeeId) =>
        request(`/employees/${employeeId}/approve`, {
            method: "PUT",
        }),

    // Reject employee signup
    rejectEmployee: (employeeId) =>
        request(`/employees/${employeeId}/reject`, {
            method: "PUT",
        }),

    // Mark notification as read (kept for compatibility)
    markAsRead: (notificationId) =>
        request(`/notifications/${notificationId}/read`, {
            method: "PUT",
        }).catch(() => ({ status: "ok" })), // graceful fail if endpoint doesn't exist
};