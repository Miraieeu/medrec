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

  // ======================
  // SOAP STATE
  // ======================
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [pharmacologyPlan, setPharmacologyPlan] = useState("");
  const [nonPharmacologyPlan, setNonPharmacologyPlan] = useState("");
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
  // SIMPAN (DRAFT)
  // ======================
  async function saveDraft() {
    if (!assessment || !objective) {
      alert("Objective & Assessment wajib diisi");
      return;
    }

    setLoading(true);
    try {
      await apiFetch(`/api/doctor/records/${recordId}/finalize`, {
        method: "PATCH",
        body: JSON.stringify({
          objective,
          assessment,
          pharmacologyPlan,
          nonPharmacologyPlan,
        }
      ),
      });

      alert("SOAP berhasil difinalisasi");
      router.push("/doctor/queue");
    } catch (e: any) {
      alert(e.message || "Gagal menyimpan SOAP");
    } finally {
      setLoading(false);
    }
  }

  // ======================
  // FINALISASI
  // ======================
  async function finalize() {
    if (!confirm("Finalisasi SOAP? Data tidak bisa diubah lagi")) return;

    setFinalizing(true);
    try {
      await apiFetch(`/api/doctor/records/${recordId}/finalize`, {
        method: "PATCH",
        body: JSON.stringify({
          objective,
          assessment,
          pharmacologyPlan,
          nonPharmacologyPlan,
        }),
      });

      alert("SOAP FINAL");
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
        <h2 className="text-lg font-semibold">
          SOAP Dokter
        </h2>

        {loading && <p>Memuat...</p>}

        {/* SUBJECTIVE (READ ONLY) */}
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
          <h3 className="font-semibold mb-1">
            Rencana Farmakologi
          </h3>
          <textarea
            className="w-full border p-2"
            rows={2}
            value={pharmacologyPlan}
            disabled={readOnly}
            onChange={(e) =>
              setPharmacologyPlan(e.target.value)
            }
          />
        </section>

        <section>
          <h3 className="font-semibold mb-1">
            Rencana Non-Farmakologi
          </h3>
          <textarea
            className="w-full border p-2"
            rows={2}
            value={nonPharmacologyPlan}
            disabled={readOnly}
            onChange={(e) =>
              setNonPharmacologyPlan(e.target.value)
            }
          />
        </section>

        {/* ACTION */}
        <div className="flex gap-3">
          {!readOnly && (
            <button
              onClick={finalize}
              disabled={finalizing}
              className="bg-green-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {finalizing ? "Finalisasi..." : "Finalisasi SOAP"}
            </button>
          )}

          <button
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
    </ProtectedRoute>
  );
}
