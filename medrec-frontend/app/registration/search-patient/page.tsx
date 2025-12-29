"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function RegistrationQueuePage() {
  const [nik, setNik] = useState("");
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function searchByNik(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    setNik(digits);

    if (digits.length !== 16) {
      setPatient(null);
      return;
    }

    try {
      const res = await apiFetch(
        `/api/registration/patients/by-nik?nik=${digits}`
      );
      setPatient(res.data);
    } catch {
      setPatient(null);
    }
  }

  async function createQueue() {
    if (!patient) return;

    setLoading(true);
    try {
      await apiFetch("/api/registration/queues", {
        method: "POST",
        body: JSON.stringify({
          patientId: patient.id,
        }),
      });

      alert("Antrian berhasil dibuat");
      setNik("");
      setPatient(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute allowedRoles={["registration"]}>
      <DashboardLayout title="Antrian Pasien">
        <div className="max-w-md space-y-4">
          <input
            className="w-full rounded border p-2"
            placeholder="Masukkan NIK (16 digit)"
            value={nik}
            onChange={(e) => searchByNik(e.target.value)}
          />

          {patient && (
            <div className="rounded border bg-white p-4 space-y-2">
              <p><b>Nama:</b> {patient.name}</p>
              <p><b>NIK:</b> {patient.nik}</p>
              <p><b>No RM:</b> {patient.medicalRecordNumber}</p>

              <button
                onClick={createQueue}
                disabled={loading}
                className="w-full rounded bg-blue-600 px-4 py-2 text-white"
              >
                {loading ? "Menyimpan..." : "Buat Antrian"}
              </button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
