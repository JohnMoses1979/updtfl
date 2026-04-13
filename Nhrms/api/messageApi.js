// // import { request } from "./apiClient";

// // export const messageApi = {
// //   getEmployees: (search = "") =>
// //     request(`/messages/users${search ? `?search=${encodeURIComponent(search)}` : ""}`),

// //   sendMessage: (payload) =>
// //     request("/messages/send", {
// //       method: "POST",
// //       body: JSON.stringify(payload),
// //     }),

// //   getUserMessages: (employeeId) =>
// //     request(`/messages/employee/${encodeURIComponent(employeeId)}`),
// // };




// // api/messageApi.js
// import { request } from "./apiClient";

// export const messageApi = {
//   /** Fetch employee list for the recipient dropdown (with optional search) */
//   getEmployees: (search = "") =>
//     request(
//       `/messages/users${search ? `?search=${encodeURIComponent(search)}` : ""}`
//     ),

//   /**
//    * Send a message to a single employee.
//    * payload: { employeeId: string, message: string }
//    */
//   sendMessage: (payload) =>
//     request("/messages/send", {
//       method: "POST",
//       body: JSON.stringify(payload),
//     }),

//   /**
//    * Send the same message to ALL employees at once.
//    * Iterates the full employee list and sends individual messages.
//    * Returns a summary { sent, failed }.
//    */
//   sendMessageToAll: async (messageText) => {
//     if (!messageText || !messageText.trim()) {
//       throw new Error("Message cannot be empty");
//     }
//     // Fetch all employees first
//     const employees = await request("/messages/users");
//     if (!Array.isArray(employees) || employees.length === 0) {
//       throw new Error("No employees found");
//     }

//     let sent = 0;
//     let failed = 0;
//     for (const emp of employees) {
//       try {
//         await request("/messages/send", {
//           method: "POST",
//           body: JSON.stringify({
//             employeeId: emp.employeeId,
//             message: messageText.trim(),
//           }),
//         });
//         sent++;
//       } catch {
//         failed++;
//       }
//     }
//     return { sent, failed, total: employees.length };
//   },

//   /**
//    * Fetch all messages addressed to a specific employee.
//    * Used by the employee Home / Dashboard screen.
//    */
//   getUserMessages: (employeeId) =>
//     request(`/messages/employee/${encodeURIComponent(employeeId)}`),
// };





// api/messageApi.js
import { request } from "./apiClient";

export const messageApi = {
  /** Fetch employee list for the recipient dropdown (with optional search) */
  getEmployees: (search = "") =>
    request(
      `/messages/users${search ? `?search=${encodeURIComponent(search)}` : ""}`
    ),

  /**
   * Send a message to a single employee.
   * payload: { employeeId: string, message: string }
   */
  sendMessage: (payload) =>
    request("/messages/send", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  /**
   * ISSUE 5 FIX: Send broadcast to ALL employees.
   * Backend handles broadcast when employeeId is "ALL" or null.
   */
  sendBroadcastMessage: (messageText) =>
    request("/messages/send", {
      method: "POST",
      body: JSON.stringify({
        employeeId: "ALL",
        message: messageText.trim(),
      }),
    }),

  /**
   * Legacy sendMessageToAll - kept for backwards compatibility.
   * Now delegates to single broadcast API call.
   */
  sendMessageToAll: async (messageText) => {
    if (!messageText || !messageText.trim()) {
      throw new Error("Message cannot be empty");
    }
    const result = await request("/messages/send", {
      method: "POST",
      body: JSON.stringify({
        employeeId: "ALL",
        message: messageText.trim(),
      }),
    });
    return { sent: 1, failed: 0, total: 1 };
  },

  /**
   * ISSUE 3 FIX: Fetch all messages for an employee.
   * Backend filters to last 24 hours — full message text returned.
   */
  getUserMessages: (employeeId) =>
    request(`/messages/employee/${encodeURIComponent(employeeId)}`),
};