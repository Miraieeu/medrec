"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

type Patient = {
  id: number;
  name: string;
  nik: string;
  medicalRecordNumber: string;
  dob: string;
  address: string;
};

export default function SearchPatientPage() {
  const [nik, setNik] = useState("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔎 HANDLE INPUT NIK
  async function handleSearch(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    setNik(digits);
    setPatient(null);
    setError(null);

    if (digits.length !== 16) return;

    setLoading(true);

    try {
      const res = await apiFetch(
        `/api/patients/by-nik?nik=${digits}`
      );

      setPatient(res.data);
    } catch (e: any) {
      setError("Pasien tidak ditemukan");
    } finally {
      setLoading(false);
    }
  }

  // ➕ MASUKKAN KE ANTRIAN
  async function addToQueue() {
    if (!patient) return;

    await apiFetch("/api/queues", {
      method: "POST",
      body: JSON.stringify({
        mrNumber: patient.medicalRecordNumber,
      }),
    });

    alert("Pasien berhasil dimasukkan ke antrian");
    setNik("");
    setPatient(null);
  }

  return (
    <ProtectedRoute allowedRoles={["registration"]}>
      <DashboardLayout title="Cari Pasien (Berdasarkan NIK)">
        <div className="max-w-xl space-y-4">

          {/* INPUT NIK */}
          <input
            className="w-full border p-2"
            placeholder="Masukkan NIK (16 digit)"
            value={nik}
            onChange={(e) => handleSearch(e.target.value)}
          />

          {loading && (
            <p className="text-sm text-gray-500">
              Mencari pasien...
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* HASIL */}
          {patient && (
            <div className="rounded border p-4 space-y-2 bg-gray-50">
              <div>
                <strong>Nama:</strong> {patient.name}
              </div>
              <div>
                <strong>NIK:</strong> {patient.nik}
              </div>
              <div>
                <strong>No. Rekam Medis:</strong>{" "}
                {patient.medicalRecordNumber}
              </div>
              <div>
                <strong>Alamat:</strong> {patient.address}
              </div>

              <button
                onClick={addToQueue}
                className="mt-3 bg-blue-600 px-4 py-2 text-white"
              >
                Masukkan ke Antrian
              </button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
