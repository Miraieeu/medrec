"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useParams, useRouter } from "next/navigation";

type Record = {
  id: number;
  visitDate: string;
  status: "DRAFT" | "FINAL";
  doctor?: {
    name?: string | null;
  } | null;
};

export default function PatientRecordsPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const router = useRouter();
  const [records, setRecords] = useState<Record[]>([]);

  useEffect(() => {
    if (!patientId) return;

    apiFetch(`/api/records/patient/${patientId}`)
      .then((res) => setRecords(res.data))
      .catch(console.error);
  }, [patientId]);

  return (
    <ProtectedRoute allowedRoles={["nurse", "doctor"]}>
      <DashboardLayout title="Riwayat Rekam Medis">
        <table className="w-full border-collapse border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">Tanggal</th>
              <th className="border px-3 py-2">Dokter</th>
              <th className="border px-3 py-2">Status</th>
              <th className="border px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 && (
              <tr>
                <td colSpan={4} className="border p-4 text-center text-gray-500">
                  Belum ada rekam medis
                </td>
              </tr>
            )}

            {records.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="border px-3 py-2">
                  {new Date(r.visitDate).toLocaleDateString("id-ID")}
                </td>
                <td className="border px-3 py-2">
                  {r.doctor?.name || "-"}
                </td>
                <td className="border px-3 py-2 text-center font-semibold">
                  {r.status}
                </td>
                <td className="border px-3 py-2 text-center">
                  <button
                    onClick={() => router.push(`/records/${r.id}`)}
                    className="text-blue-600 hover:underline"
                  >
                    Lihat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
