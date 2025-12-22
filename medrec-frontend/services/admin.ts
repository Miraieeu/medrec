import { apiFetch } from "@/lib/api";

export function getAuditLogs() {
  return apiFetch("/AuditLogs");
}
export function getAuthLogs() {
  return apiFetch("/authLogs");
}
export function getUsers() {
  return apiFetch("/admin/users");
}
