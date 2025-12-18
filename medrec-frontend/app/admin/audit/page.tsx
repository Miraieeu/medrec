"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AuditPage() {
  const [authLogs, setAuthLogs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

useEffect(() => {
  fetch("/api/admin/auth-log")
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      return res.json();
    })
    .then(setAuthLogs)
    .catch(console.error);

  fetch("/api/admin/audit-log")
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      return res.json();
    })
    .then(setAuditLogs)
    .catch(console.error);
}, []);

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout title="Audit & Log">
        {/* AUTH LOG */}
        <section className="mb-8">
          <h3 className="mb-2 font-semibold">
            Auth Log (Login / Logout)
          </h3>

          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Waktu</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {authLogs.map((log) => (
                <tr key={log.id}>
                  <td className="border p-2">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="border p-2">
                    {log.user.email}
                  </td>
                  <td className="border p-2">
                    {log.user.role}
                  </td>
                  <td className="border p-2">
                    {log.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* DOMAIN AUDIT */}
        <section>
          <h3 className="mb-2 font-semibold">
            Audit Log (Aktivitas Klinik)
          </h3>

          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Waktu</th>
                <th className="border p-2">User</th>
                <th className="border p-2">Aksi</th>
                <th className="border p-2">Entity</th>
                <th className="border p-2">Entity ID</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="border p-2">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="border p-2">
                    {log.user.email}
                  </td>
                  <td className="border p-2">
                    {log.action}
                  </td>
                  <td className="border p-2">
                    {log.entity}
                  </td>
                  <td className="border p-2">
                    {log.entityId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
