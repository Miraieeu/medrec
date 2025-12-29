"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiFetch } from "@/lib/api";

export default function DoctorQueuePage() {
  const router = useRouter();
  const [queues, setQueues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ======================
  // LOAD ANTRIAN HARI INI
  // ======================
  async function loadQueues() {
    setLoading(true);
    try {
      const res = await apiFetch("/api/doctor/queues/today");

      // dokter hanya lihat CALLED
      setQueues(
        res.data.filter((q: any) => q.status === "CALLED")
      );
    } catch (e: any) {
      alert(e.message || "Gagal memuat antrian");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQueues();
  }, []);

  // ======================
  // FINALISASI SOAP
  // ======================
  async function finalize(queueId: number, recordId: number) {
    if (!confirm("Finalisasi SOAP & selesaikan antrian?")) return;

    try {
      // 1️⃣ FINALIZE MEDICAL RECORD
      await apiFetch(`/api/doctor/records/${recordId}/finalize`, {
        method: "PATCH",
      });

      // 2️⃣ SET QUEUE DONE
      await apiFetch(`/api/doctor/queues/${queueId}/done`, {
        method: "PATCH",
      });

      alert("SOAP difinalisasi & antrian selesai");
      loadQueues();
    } catch (e: any) {
      alert(e.message || "Gagal finalisasi");
    }
  }

  // ======================
  // RENDER
  // ======================
  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Antrian Pasien (Dokter)
        </h2>

        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">No</th>
              <th className="border p-2">No RM</th>
              <th className="border p-2">Nama</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {queues.map((q) => {
              // record DRAFT otomatis dari backend
              const record = q.patient.records?.[0];

              return (
                <tr key={q.id} className="border-t">
                  <td className="border p-2 text-center">
                    {q.number}
                  </td>

                  <td className="border p-2">
                    {q.patient.medicalRecordNumber}
                  </td>

                  <td className="border p-2">
                    {q.patient.name}
                  </td>

                  <td className="border p-2 text-center">
                    <span className="rounded bg-yellow-100 px-2 py-1">
                      {q.status}
                    </span>
                  </td>

                  <td className="border p-2 text-center space-x-3">
                    {/* EDIT SOAP */}
                    <button
                      disabled={!record || record.status !== "DRAFT"}
                      onClick={() =>
                        router.push(
                          `/doctor/records/${record.id}`
                        )
                      }
                      className="text-blue-600 disabled:text-gray-400"
                    >
                      Edit SOAP
                    </button>

                    {/* FINALISASI */}
                    <button
                      disabled={!record || record.status !== "DRAFT"}
                      onClick={() =>
                        finalize(q.id, record.id)
                      }
                      className="text-green-600 disabled:text-gray-400"
                    >
                      Finalisasi
                    </button>
                  </td>
                </tr>
              );
            })}

            {queues.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={5}
                  className="border p-4 text-center text-gray-500"
                >
                  Tidak ada antrian dipanggil
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {loading && (
          <p className="text-sm text-gray-500">
            Memuat antrian...
          </p>
        )}
      </div>
    </ProtectedRoute>
  );
}
