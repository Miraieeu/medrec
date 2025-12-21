"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import QueueTable from "@/components/QueueTable";
import { apiFetch } from "@/lib/api";

type Queue = {
  id: number;
  number: number;
  status: "WAITING" | "CALLED" | "DONE";
  patient: {
    name: string;
    medicalRecordNumber: string;
  };
};

export default function NurseQueuePage() {
  const router = useRouter();
  const [queues, setQueues] = useState<Queue[]>([]);

  async function load() {
    const res = await apiFetch("/api/nurse/queues/today");
    setQueues(res.data);
  }

  async function callQueue(queueId: number) {
    await apiFetch(`/api/nurse/queues/${queueId}/call`, {
      method: "PATCH",
    });
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["nurse"]}>
      <DashboardLayout title="Antrian Pasien (Nurse)">
        <QueueTable
          queues={queues}
          onCall={callQueue}
          onSoap={(queueId) =>
            router.push(`/nurse/records/${queueId}`)
          }
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
