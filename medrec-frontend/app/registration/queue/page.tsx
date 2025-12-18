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
  const [mrDigits, setMrDigits] = useState(""); // ⬅️ hanya angka

  async function load() {
    const res = (await apiFetch("/api/queues/today")) as QueueTodayResponse;
    setQueues(res.data);
  }

  async function createQueue() {
    if (!mrDigits) {
      alert("Nomor MR wajib diisi");
      return;
    }

    // bentuk final MR number
    const mrNumber = `MR-${mrDigits.padStart(6, "0")}`;
    console.log("REQ BODY =", { mrNumber });
    await apiFetch("/api/queues", {
      method: "POST",
      body: JSON.stringify({ mrNumber }),
    });

    setMrDigits("");
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
  <ProtectedRoute allowedRoles={["registration"]}>
    <DashboardLayout title="Antrian Pasien">
      {/* INPUT MR NUMBER */}
      <div className="mb-6 flex items-center gap-2">
        <span className="rounded border bg-gray-100 px-3 py-2 text-gray-600">
          MR-
        </span>

        <input
          className="border p-2 w-40"
          placeholder="000123"
          value={mrDigits}
          onChange={(e) => {
            // hanya izinkan angka
            const digits = e.target.value.replace(/\D/g, "");
            setMrDigits(digits);
          }}
        />

        <button
          onClick={createQueue}
          className="bg-blue-600 px-4 py-2 text-white"
        >
          Tambah
        </button>
      </div>

      {/* QUEUE TABLE */}
      <QueueTable queues={queues} role="registration" />
    </DashboardLayout>
  </ProtectedRoute>
);}
