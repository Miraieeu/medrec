"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import QueueTable from "@/components/QueueTable";

type Queue = {
  id: number;
  number: number;
  status: "WAITING" | "CALLED" | "DONE";
  patient: {
    name: string;
    medicalRecordNumber: string;
  };
};

type QueueTodayResponse = {
  success: boolean;
  data: Queue[];
};

export default function NurseQueuePage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function load() {
    const res = (await apiFetch("/api/queues/today")) as QueueTodayResponse;
    setQueues(res.data);
  }

  async function callQueue(queueId: number) {
    try {
      setLoadingId(queueId);
      await apiFetch(`/api/queues/${queueId}/call`, {
        method: "PATCH",
      });
      await load();
    } finally {
      setLoadingId(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["nurse"]}>
      <DashboardLayout title="Antrian Pasien (Perawat)">
        {/* TABEL ANTRIAN */}
        <QueueTable queues={queues} role="nurse" />

        {/* ACTION BUTTONS */}
        <div className="mt-4 space-y-2">
          {queues
            .filter((q) => q.status === "WAITING")
            .map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between border p-3 rounded"
              >
                <div>
                  <div className="font-medium">
                    {q.patient.medicalRecordNumber} — {q.patient.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    No Antrian: {q.number}
                  </div>
                </div>

                <button
                  onClick={() => callQueue(q.id)}
                  disabled={loadingId === q.id}
                  className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
                >
                  {loadingId === q.id ? "Memanggil..." : "CALL"}
                </button>
              </div>
            ))}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
