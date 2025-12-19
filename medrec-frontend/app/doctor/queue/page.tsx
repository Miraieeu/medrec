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

export default function DoctorQueuePage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function load() {
    const res = (await apiFetch("/api/queues/today")) as QueueTodayResponse;

    // Dokter hanya lihat CALLED
    setQueues(res.data.filter((q) => q.status === "CALLED"));
  }

  async function doneQueue(queueId: number) {
    try {
      setLoadingId(queueId);
      await apiFetch(`/api/queues/${queueId}/done`, {
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
    <ProtectedRoute allowedRoles={["doctor"]}>
      <DashboardLayout title="Antrian Pasien (Dokter)">
        {/* TABEL */}
        <QueueTable queues={queues} role="doctor" />

        {/* ACTION */}
        <div className="mt-4 space-y-2">
          {queues.map((q) => {
  const recordId = q.patient.records?.[0]?.id;

  return (
    <tr key={q.id}>
      <td>{q.number}</td>
      <td>{q.patient.name}</td>
      <td>{q.status}</td>

      <td>
        {recordId ? (
          <button
            onClick={() => router.push(`/nurse/records/${recordId}`)}
            className="text-blue-600 hover:underline"
          >
            SOAP
          </button>
        ) : (
          <span className="text-gray-400">Belum dipanggil</span>
        )}
      </td>
    </tr>
  );
})}

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
