// api/employeeApi.js
import { request } from "./apiClient";

export const employeeApi = {
  // Get all employees from the `employees` table
  getAll: () => request("/employees"),

  // Get single employee by numeric DB id
  getById: (id) => request(`/employees/${id}`),

  // Create new employee (saves to `employees` + mirrors to `app_user`)
  create: (payload) =>
    request("/employees", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Update employee by numeric DB id
  update: (id, payload) =>
    request(`/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // Delete employee by numeric DB id
  delete: (id) =>
    request(`/employees/${id}`, {
      method: "DELETE",
    }),
};