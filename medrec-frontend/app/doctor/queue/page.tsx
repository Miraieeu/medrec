"use client";

import { useEffect, useState } from "react";
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

export default function DoctorQueuePage() {
  const [queues, setQueues] = useState<Queue[]>([]);

  async function load() {
    const res = await apiFetch("/api/doctor/queues/today");
    setQueues(res.data.filter((q: Queue) => q.status === "CALLED"));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <h2 className="mb-4 text-lg font-semibold">
        Antrian Pasien (Dokter)
      </h2>

      <QueueTable queues={queues} />
    </>
  );
}
