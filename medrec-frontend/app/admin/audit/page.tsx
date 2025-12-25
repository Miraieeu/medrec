"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiFetch } from "@/lib/api";

type AuthLog = {
  id: number;
  action: string;
  createdAt: string;
  email: string;
  user?: {
    email: string;
    role: string;
  };
};

type AuditLog = {
  id: number;
  action: string;
  entity: string;
  entityId: number;
  createdAt: string;
  auditHash: string;
  blockchainTxHash?: string | null;
  blockchainCommittedAt?: string | null;
  user: {
    email: string;
    role: string;
  };
};


export default function AuditPage() {
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const authRes = await apiFetch("/api/admin/authLogs");
        const auditRes = await apiFetch("/api/admin/auditLogs");

        setAuthLogs(authRes.data ?? authRes);
        setAuditLogs(auditRes.data ?? auditRes);
      } catch (err) {
        console.error("❌ Failed to load logs:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>

          <p>Loading logs...</p>

      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>

        {/* AUTH LOG */}
        <section className="mb-10">
          <h3 className="mb-3 text-lg font-semibold">
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
                    {log.user?.email ?? log.email}
                  </td>
                  <td className="border p-2">
                    {log.user?.role ?? "-"}
                  </td>
                  <td className="border p-2">
                    {log.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* AUDIT LOG */}
        <section>
          <h3 className="mb-3 text-lg font-semibold">
            Audit Log (Aktivitas Klinik)
          </h3>

          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Waktu</th>
    <th className="border p-2">User</th>
    <th className="border p-2">Aksi</th>
    <th className="border p-2">Entity</th>
    <th className="border p-2">Audit Hash</th>
    <th className="border p-2">Blockchain</th>
              </tr>
            </thead>
            <tbody>
  {auditLogs.map((log) => (
    <tr key={log.id}>
      {/* WAKTU */}
      <td className="border p-2">
        {new Date(log.createdAt).toLocaleString()}
      </td>

      {/* USER */}
      <td className="border p-2">
        {log.user.email}
        <div className="text-xs text-gray-500">
          {log.user.role}
        </div>
      </td>

      {/* AKSI */}
      <td className="border p-2">
        {log.action}
      </td>

      {/* ENTITY */}
      <td className="border p-2">
        {log.entity} #{log.entityId}
      </td>

      {/* AUDIT HASH */}
      <td className="border p-2 font-mono text-xs">
        {log.auditHash
          ? `${log.auditHash.slice(0, 12)}...`
          : "-"}
      </td>

      {/* BLOCKCHAIN STATUS */}
      <td className="border p-2 text-center">
        {log.blockchainTxHash ? (
          <span className="text-green-600 font-semibold">
            ✅ Committed
          </span>
        ) : (
          <span className="text-yellow-600 font-semibold">
            ⏳ Pending
          </span>
        )}
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </section>

    </ProtectedRoute>
  );
}
