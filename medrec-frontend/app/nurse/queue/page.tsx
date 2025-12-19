"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import QueueTable from "@/components/QueueTable";

export default function NurseQueuePage() {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ⛔ JANGAN FETCH SEBELUM TOKEN ADA
    if (!hasApiToken()) {
      console.log("⏳ API token belum siap, tunggu...");
      return;
    }

    let cancelled = false;

    async function loadQueues() {
      try {
        const res = await apiFetch("/api/queues/today");
        if (!cancelled) {
          setQueues(res.data);
        }
      } catch (err) {
        console.error("❌ loadQueues error", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadQueues();

    return () => {
      cancelled = true;
    };
  }, []); // ⬅️ PENTING: tetap kosong

  return (
    <ProtectedRoute allowedRoles={["nurse"]}>
      <DashboardLayout title="Antrian Pasien">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <QueueTable queues={queues} role="nurse" />
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function hasApiToken() {
  return typeof window !== "undefined" && !!localStorage.getItem("apiToken");
}
