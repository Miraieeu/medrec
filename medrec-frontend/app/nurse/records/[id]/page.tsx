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

  // ======================
  // SUBJECTIVE
  // ======================
  const [complaint, setComplaint] = useState("");

  // ======================
  // OBJECTIVE
  // ======================
  const [temp, setTemp] = useState("");
  const [bp, setBp] = useState("");
  const [pulse, setPulse] = useState("");
  const [resp, setResp] = useState("");
  const [spo2, setSpo2] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [consciousness, setConsciousness] = useState("Compos Mentis");
  const [observation, setObservation] = useState("");

  // ======================
  // ASSESSMENT & PLAN
  // ======================
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");

  const isFinal = status === "FINAL";

  // ======================
  // 🔑 LOAD DATA DRAFT
  // ======================
  useEffect(() => {
    apiFetch(`/api/nurse/records/${recordId}`)
      .then((res) => {
        const r = res.data;

        setStatus(r.status);

        // SUBJECTIVE
        setComplaint(r.subjective || "");

        // OBJECTIVE (kalau sebelumnya string)
        if (r.objective) {
          setObservation(r.objective);
        }

        setAssessment(r.assessment || "");
        setPlan(r.nursingPlan || "");
      })
      .catch((e) => {
        console.error(e);
        alert("Gagal memuat rekam medis");
      });
  }, [recordId]);

  // ======================
  // SUBMIT SOAP
  // ======================
  async function submit() {
    if (!complaint) {
      alert("Subjective wajib diisi");
      return;
    }

    setLoading(true);

    const objective = `
Suhu: ${temp} °C
Tekanan Darah: ${bp} mmHg
Nadi: ${pulse} x/menit
Respirasi: ${resp} x/menit
SpO2: ${spo2} %
BB/TB: ${weight} kg / ${height} cm
Kesadaran: ${consciousness}
Observasi: ${observation}
`.trim();

    try {
      await apiFetch(`/api/nurse/records/${recordId}/nursing`, {
        method: "PATCH",
        body: JSON.stringify({
          subjective: complaint,
          nursingPlan: plan,
        }),
      });

      alert("SOAP keperawatan berhasil disimpan");
      router.push("/nurse/queue");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal menyimpan SOAP");
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

        {/* SUBJECTIVE */}
        <section>
          <h2 className="font-semibold mb-2">Subjective</h2>
          <textarea
            className="w-full border p-2"
            rows={3}
            value={complaint}
            disabled={isFinal}
            onChange={(e) => setComplaint(e.target.value)}
          />
        </section>

        {/* OBJECTIVE */}
        <section>
          <h2 className="font-semibold mb-2">Objective</h2>

          <textarea
            className="w-full border p-2"
            rows={4}
            value={observation}
            disabled={isFinal}
            onChange={(e) => setObservation(e.target.value)}
          />
        </section>

        {/* ASSESSMENT */}
        <section>
          <h2 className="font-semibold mb-2">Assessment</h2>
          <textarea
            className="w-full border p-2"
            rows={2}
            value={assessment}
            disabled={isFinal}
            onChange={(e) => setAssessment(e.target.value)}
          />
        </section>

        {/* PLAN */}
        <section>
          <h2 className="font-semibold mb-2">Nursing Plan</h2>
          <textarea
            className="w-full border p-2"
            rows={2}
            value={plan}
            disabled={isFinal}
            onChange={(e) => setPlan(e.target.value)}
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
