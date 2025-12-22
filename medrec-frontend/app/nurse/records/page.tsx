"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

type RecordResult = {
  recordId: number;
  patient: {
    name: string;
    nik: string;
    medicalRecordNumber: string;
  };
  visitDate: string;
};

export default function NurseSearchRecordPage() {
  const [nik, setNik] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecordResult | null>(null);

  // =======================
  // AUTO SEARCH WHEN 16 DIGIT
  // =======================
  useEffect(() => {
    if (nik.length !== 16) {
      setResult(null);
      setError(null);
      return;
    }

    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nik]);

  async function search() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await apiFetch(
        `/api/nurse/records/by-nik?nik=${nik}`
      );
      setResult(res.data);
    } catch (e: any) {
      setError(e.message || "Data tidak ditemukan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute allowedRoles={["nurse"]}>
      <div className="max-w-xl space-y-4">
        <h2 className="text-lg font-semibold">
          Cari Rekam Medis Pasien
        </h2>

        {/* INPUT NIK */}
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Masukkan NIK (16 digit)"
          value={nik}
          onChange={(e) =>
            setNik(e.target.value.replace(/\D/g, "").slice(0, 16))
          }
        />

        {loading && (
          <p className="text-sm text-gray-500">
            Mencari data pasien...
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* HASIL */}
        {result && (
          <div className="rounded border bg-gray-50 p-4 space-y-2">
            <p>
              <b>Nama:</b> {result.patient.name}
            </p>
            <p>
              <b>NIK:</b> {result.patient.nik}
            </p>
            <p>
              <b>No RM:</b> {result.patient.medicalRecordNumber}
            </p>
            <p>
              <b>Tanggal Kunjungan:</b>{" "}
              {new Date(result.visitDate).toLocaleDateString()}
            </p>

            <Link
              href={`/nurse/records/${result.recordId}`}
              className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Isi SOAP Keperawatan
            </Link>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
