import { BASE_URL } from "./config";
 
function toJsonOrThrow(response) {
  if (!response.ok) {
    throw new Error(`Server error ${response.status}`);
  }
  return response.json();
}
 
export async function fetchCurrentMonthSalary(empId) {
  const normalized = String(empId || "").trim();
  if (!normalized) {
    throw new Error("Employee ID is required");
  }
 
  const res = await fetch(`${BASE_URL}/api/payroll/salary/by-emp/${encodeURIComponent(normalized)}`);
  return toJsonOrThrow(res);
}
 
export async function fetchPayslipByEmp(empId, month, year) {
  const normalized = String(empId || "").trim();
  if (!normalized) {
    throw new Error("Employee ID is required");
  }
 
  const res = await fetch(
    `${BASE_URL}/api/payslip/by-emp/${encodeURIComponent(normalized)}/${month}/${year}`
  );
  return toJsonOrThrow(res);
}
 
export function buildPayslipDownloadUrl(empId, month, year) {
  const normalized = String(empId || "").trim();
  return `${BASE_URL}/api/payslip/download/by-emp/${encodeURIComponent(normalized)}/${month}/${year}`;
}