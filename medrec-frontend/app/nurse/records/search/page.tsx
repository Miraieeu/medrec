"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";

type Patient = {
  id: number;
  name: string;
  medicalRecordNumber: string;
};

type MedicalRecord = {
  id: number;
  visitDate: string;
  status: string;
};

export default function NurseSearchRecordPage() {
  const router = useRouter();

  const [nik, setNik] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  // =======================
  // AUTO SEARCH WHEN NIK 16
  // =======================
  useEffect(() => {
    if (nik.length !== 16) {
      setPatient(null);
      setRecords([]);
      setError(null);
      return;
    }

    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nik]);

  async function search() {
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/nurse/records/by-nik/${nik}`);

      setPatient(res.data.patient);
      setRecords(res.data.records);
    } catch (e: any) {
      setPatient(null);
      setRecords([]);
      setError(e.message || "Pasien tidak ditemukan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute allowedRoles={["nurse"]}>
      <div className="max-w-3xl space-y-6">
        {/* ================= INPUT NIK ================= */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Cari Rekam Medis (NIK)
          </label>

          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Masukkan 16 digit NIK"
            value={nik}
            onChange={(e) =>
              setNik(e.target.value.replace(/\D/g, "").slice(0, 16))
            }
          />

          {loading && (
            <p className="mt-1 text-sm text-gray-500">
              Mencari data pasien...
            </p>
          )}

          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* ================= PATIENT INFO ================= */}
        {patient && (
          <div className="rounded border bg-gray-50 p-4">
            <p className="font-semibold">{patient.name}</p>
            <p className="text-sm text-gray-600">
              MR Number: {patient.medicalRecordNumber}
            </p>
          </div>
        )}

        {/* ================= RECORD TABLE ================= */}
        {records.length > 0 && (
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Tanggal Kunjungan</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="border p-2">
                    {new Date(r.visitDate).toLocaleDateString()}
                  </td>

                  <td className="border p-2">{r.status}</td>

                  <td className="border p-2 text-center">
                    <button
                      onClick={() =>
                        router.push(`/nurse/records/${r.id}`)
                      }
                      className="text-blue-600 hover:underline"
                    >
                      Lihat Rekam Medis
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ProtectedRoute>
  );
}
