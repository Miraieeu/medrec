"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";

type Queue = {
  id: number;
  number: number;
  status: "WAITING" | "CALLED" | "DONE";
  patient: {
    name: string;
    medicalRecordNumber: string;
  };
};

export default function RegistrationQueuePage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadQueues() {
    const res = await apiFetch("/api/registration/queues/today");
    setQueues(res.data);
  }

  async function callQueue(id: number) {
    if (!confirm("Panggil pasien ini?")) return;

    setLoading(true);
    try {
      await apiFetch(`/api/registration/queues/${id}/call`, {
        method: "PATCH",
      });
      await loadQueues(); // refresh
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQueues();
  }, []);

  const waitingQueues = queues.filter(
    (q) => q.status === "WAITING"
  );

  return (
    <ProtectedRoute allowedRoles={["registration"]}>
      <DashboardLayout title="Antrian Pasien">
        {/* ===================== */}
        {/* BELUM DIPANGGIL */}
        {/* ===================== */}
        <div className="rounded border bg-white p-4">
          <h3 className="mb-4 text-lg font-semibold">
            Antrian Belum Dipanggil
          </h3>

          {waitingQueues.length === 0 ? (
            <p className="text-gray-500">
              Tidak ada pasien menunggu
            </p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">No</th>
                  <th className="border p-2">Nama</th>
                  <th className="border p-2">No RM</th>
                  <th className="border p-2">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {waitingQueues.map((q) => (
                  <tr key={q.id}>
                    <td className="border p-2 text-center">
                      {q.number}
                    </td>
                    <td className="border p-2">
                      {q.patient.name}
                    </td>
                    <td className="border p-2">
                      {q.patient.medicalRecordNumber}
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        disabled={loading}
                        onClick={() => callQueue(q.id)}
                        className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        Panggil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
