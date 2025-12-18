"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import QueueTable from "@/components/QueueTable";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

type Queue = {
  id: number;
  number: number;
  status: "WAITING" | "CALLED" | "DONE";
  patient: {
    name: string;
  };
};

type QueueTodayResponse = {
  success: boolean;
  data: Queue[];
};

export default function RegistrationQueuePage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [patientId, setPatientId] = useState("");

  async function load() {
    const res = await apiFetch<QueueTodayResponse>("/api/queues/today");
    setQueues(res.data);
  }

  async function createQueue() {
    await apiFetch("/api/queues", {
      method: "POST",
      body: JSON.stringify({ patientId: Number(patientId) }),
    });
    setPatientId("");
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["registration"]}>
      <DashboardLayout title="Antrian Pasien">
        <div className="mb-4 flex gap-2">
          <input
            className="border p-2"
            placeholder="Patient ID"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          />
          <button
            onClick={createQueue}
            className="bg-blue-600 px-4 py-2 text-white"
          >
            Tambah
          </button>
        </div>

        <QueueTable queues={queues} role="registration" />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
