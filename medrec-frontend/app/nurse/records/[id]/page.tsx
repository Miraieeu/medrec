"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function NurseSoapPage() {
  const params = useParams();
  const router = useRouter();

  const recordId = Number(params.id);
  if (isNaN(recordId)) {
    return <div>Invalid Medical Record ID</div>;
  }

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"DRAFT" | "FINAL">("DRAFT");

  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [nursingPlan, setNursingPlan] = useState("");

  const isFinal = status === "FINAL";

  // ======================
  // LOAD DRAFT DATA
  // ======================
  useEffect(() => {
    apiFetch(`/api/nurse/records/${recordId}`)
      .then((res) => {
        const r = res.data;
        setStatus(r.status);
        setSubjective(r.subjective || "");
        setObjective(r.objective || "");
        setNursingPlan(r.nursingPlan || "");
      })
      .catch(() => {
        alert("Gagal memuat rekam medis");
      });
  }, [recordId]);

  // ======================
  // SUBMIT
  // ======================
  async function submit() {
    if (!subjective || !objective) {
      alert("Subjective dan Objective wajib diisi");
      return;
    }

    setLoading(true);

    try {
      await apiFetch(`/api/nurse/records/${recordId}/nursing`, {
        method: "PATCH",
        body: JSON.stringify({
          subjective,
          objective,
          nursingPlan,
        }),
      });

      alert("SOAP keperawatan tersimpan");
      router.push("/nurse/queue");
    } catch (e: any) {
      alert(e.message || "Gagal menyimpan SOAP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute allowedRoles={["nurse"]}>
      <div className="max-w-3xl space-y-6">
        {isFinal && (
          <p className="text-sm text-green-600">
            Rekam medis sudah FINAL (read-only)
          </p>
        )}

        <section>
          <h2 className="font-semibold mb-2">Subjective</h2>
          <textarea
            className="w-full border p-2"
            rows={3}
            disabled={isFinal}
            value={subjective}
            onChange={(e) => setSubjective(e.target.value)}
          />
        </section>

        <section>
          <h2 className="font-semibold mb-2">Objective</h2>
          <textarea
            className="w-full border p-2"
            rows={4}
            disabled={isFinal}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
          />
        </section>

        <section>
          <h2 className="font-semibold mb-2">Nursing Plan</h2>
          <textarea
            className="w-full border p-2"
            rows={3}
            disabled={isFinal}
            value={nursingPlan}
            onChange={(e) => setNursingPlan(e.target.value)}
          />
        </section>

        {!isFinal && (
          <button
            onClick={submit}
            disabled={loading}
            className="bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan SOAP"}
          </button>
        )}
      </div>
    </ProtectedRoute>
  );
}
