"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import QueueTable from "@/components/QueueTable";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DoctorQueuePage() {
  const [queues, setQueues] = useState<any[]>([]);

  async function load() {
    const res = await apiFetch("/queues/today");
    setQueues(res.data.filter((q: any) => q.status === "CALLED"));
  }

  async function doneQueue(id: number) {
    await apiFetch(`/queues/${id}/done`, { method: "PATCH" });
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <DashboardLayout title="Antrian Aktif">
        <QueueTable
          queues={queues}
          role="doctor"
          onDone={doneQueue}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
