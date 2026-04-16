// api/notificationApi.js
import { request } from "./apiClient";

export const notificationApi = {
    // Get pending signup approvals for admin
    getAdminNotifications: () =>
        request("/employees/admin-notifications"),

    getAdminNotificationHistory: () =>
        request("/employees/admin-notifications/history"),

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
        request(`/employees/admin-notifications/${notificationId}/read`, {
            method: "PUT",
        }),
};
