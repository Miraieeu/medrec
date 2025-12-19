"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function NurseSoapPage() {
  const params = useParams();
  const router = useRouter();

  // ⬇️ INI PENTING: id = medicalRecordId
  const recordId = Number(params.id);
  if (isNaN(recordId)) {
    return <div>Invalid Medical Record ID</div>;
  }

  const [loading, setLoading] = useState(false);

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
      // ⬇️ PASTI medicalRecordId
      await apiFetch(`/api/records/${recordId}/nursing`, {
        method: "PATCH",
        body: JSON.stringify({
          subjective: complaint,
          objective,
          assessment,
          nursingPlan: plan,
        }),
      });

      alert("SOAP keperawatan berhasil disimpan");

      // ✅ REDIRECT BENAR
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
      <DashboardLayout title="SOAP Keperawatan">
        <div className="max-w-3xl space-y-6">

          {/* SUBJECTIVE */}
          <section>
            <h2 className="font-semibold mb-2">Subjective</h2>
            <textarea
              className="w-full border p-2"
              rows={3}
              placeholder="Keluhan utama pasien..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />
          </section>

          {/* OBJECTIVE */}
          <section>
            <h2 className="font-semibold mb-2">Objective</h2>

            <div className="grid grid-cols-2 gap-3">
              <input className="border p-2" placeholder="Suhu (°C)" value={temp} onChange={(e) => setTemp(e.target.value)} />
              <input className="border p-2" placeholder="Tekanan Darah (120/80)" value={bp} onChange={(e) => setBp(e.target.value)} />
              <input className="border p-2" placeholder="Nadi (/menit)" value={pulse} onChange={(e) => setPulse(e.target.value)} />
              <input className="border p-2" placeholder="Respirasi (/menit)" value={resp} onChange={(e) => setResp(e.target.value)} />
              <input className="border p-2" placeholder="SpO₂ (%)" value={spo2} onChange={(e) => setSpo2(e.target.value)} />
              <input className="border p-2" placeholder="BB (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} />
              <input className="border p-2" placeholder="TB (cm)" value={height} onChange={(e) => setHeight(e.target.value)} />

              <select
                className="border p-2 col-span-2"
                value={consciousness}
                onChange={(e) => setConsciousness(e.target.value)}
              >
                <option>Compos Mentis</option>
                <option>Apatis</option>
                <option>Somnolen</option>
                <option>Sopor</option>
                <option>Koma</option>
              </select>
            </div>

            <textarea
              className="w-full border p-2 mt-3"
              rows={2}
              placeholder="Observasi tambahan..."
              value={observation}
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
              onChange={(e) => setPlan(e.target.value)}
            />
          </section>

          <button
            onClick={submit}
            disabled={loading}
            className="bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan SOAP"}
          </button>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
