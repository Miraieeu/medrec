"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiFetch } from "@/lib/api";

export default function DoctorSoapPage() {
  const { id } = useParams();
  const router = useRouter();

  const recordId = Number(id);
  if (isNaN(recordId)) {
    return <div>Invalid Medical Record ID</div>;
  }

  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ======================
  // SOAP STATE
  // ======================
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [pharmacologyPlan, setPharmacologyPlan] = useState("");
  const [nonPharmacologyPlan, setNonPharmacologyPlan] = useState("");
  const [nursingPlan, setNursingPlan] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "FINAL">("DRAFT");

  // ======================
  // LOAD RECORD
  // ======================
  async function loadRecord() {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/doctor/records/${recordId}`);
      const r = res.data;

      setSubjective(r.subjective || "");
      setObjective(r.objective || "");
      setAssessment(r.assessment || "");
      setNursingPlan(r.nursingPlan || "");
      setPharmacologyPlan(r.pharmacologyPlan || "");
      setNonPharmacologyPlan(r.nonPharmacologyPlan || "");
      setStatus(r.status);
    } catch (e: any) {
      alert(e.message || "Gagal memuat rekam medis");
      router.push("/doctor/queue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecord();
  }, []);

  const readOnly = status === "FINAL";

  // ======================
  // FINALISASI (TANPA CONFIRM)
  // ======================
  async function finalize() {
    setFinalizing(true);
    try {
      await apiFetch(`/api/doctor/records/${recordId}/finalize`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          objective,
          assessment,
          pharmacologyPlan,
          nonPharmacologyPlan,
        }),
      });

      router.push("/doctor/queue");
    } catch (e: any) {
      alert(e.message || "Gagal finalisasi");
    } finally {
      setFinalizing(false);
    }
  }

  // ======================
  // RENDER
  // ======================
  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="max-w-3xl space-y-6">
        <h2 className="text-lg font-semibold">SOAP Dokter</h2>

        {loading && <p>Memuat...</p>}

        {/* SUBJECTIVE */}
        <section>
          <h3 className="font-semibold mb-1">Subjective</h3>
          <textarea
            className="w-full border p-2 bg-gray-50"
            rows={3}
            value={subjective}
            disabled
          />
        </section>

        {/* OBJECTIVE */}
        <section>
          <h3 className="font-semibold mb-1">Objective</h3>
          <textarea
            className="w-full border p-2"
            rows={3}
            value={objective}
            disabled={readOnly}
            onChange={(e) => setObjective(e.target.value)}
          />
        </section>

        {/* NURSING PLAN */}
        <section>
          <h3 className="font-semibold mb-1">
            Rencana Non-Farmakologi (Keperawatan)
          </h3>
          <textarea
            className="w-full border p-2 bg-gray-100"
            rows={2}
            value={nursingPlan}
            disabled
          />
        </section>

        {/* ASSESSMENT */}
        <section>
          <h3 className="font-semibold mb-1">Assessment</h3>
          <textarea
            className="w-full border p-2"
            rows={3}
            value={assessment}
            disabled={readOnly}
            onChange={(e) => setAssessment(e.target.value)}
          />
        </section>

        {/* PLAN */}
        <section>
          <h3 className="font-semibold mb-1">Rencana Farmakologi</h3>
          <textarea
            className="w-full border p-2"
            rows={2}
            value={pharmacologyPlan}
            disabled={readOnly}
            onChange={(e) => setPharmacologyPlan(e.target.value)}
          />
        </section>

        <section>
          <h3 className="font-semibold mb-1">Rencana Non-Farmakologi</h3>
          <textarea
            className="w-full border p-2"
            rows={2}
            value={nonPharmacologyPlan}
            disabled={readOnly}
            onChange={(e) => setNonPharmacologyPlan(e.target.value)}
          />
        </section>

        {/* ACTION */}
        <div className="flex gap-3">
          {!readOnly && (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={finalizing}
              className="bg-green-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {finalizing ? "Finalisasi..." : "Finalisasi SOAP"}
            </button>
          )}

          <button
            type="button"
            onClick={() => router.push("/doctor/queue")}
            className="border px-4 py-2"
          >
            Kembali
          </button>
        </div>

        {readOnly && (
          <p className="text-sm text-gray-500">
            SOAP sudah FINAL dan tidak dapat diubah
          </p>
        )}
      </div>

      {/* ======================
          MODAL KONFIRMASI
         ====================== */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-semibold">
              Konfirmasi Finalisasi
            </h3>

            <p className="text-sm text-gray-700">
              Finalisasi SOAP? Data yang sudah difinalisasi tidak dapat
              diubah kembali.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="border px-4 py-2 rounded"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  finalize();
                }}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Ya, Finalisasi
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
