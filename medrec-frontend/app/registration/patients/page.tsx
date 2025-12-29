"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// =======================
// HELPER
// =======================
function formatDateToDMY(date: string) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

function isFutureDate(dmy: string) {
  const [d, m, y] = dmy.split("/").map(Number);
  if (!d || !m || !y) return true;

  const inputDate = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return inputDate > today;
}

// =======================
// PAGE
// =======================
export default function RegistrationPatientPage() {
  const [form, setForm] = useState({
    name: "",
    nik: "",
    dob: "",
    address: "",
  });

  const [nikError, setNikError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // =======================
  // VALIDASI NIK
  // =======================
  async function handleNikChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    setForm({ ...form, nik: digits });

    if (digits.length !== 16) {
      setNikError("NIK harus 16 digit");
      return;
    }

    try {
      await apiFetch(
        `/api/registration/patients/by-nik?nik=${digits}`
      );
      setNikError("NIK sudah terdaftar");
    } catch {
      setNikError(null); // belum terdaftar
    }
  }

  // =======================
  // SUBMIT
  // =======================
  async function submit() {
    if (!form.name || !form.nik || !form.dob || !form.address) {
      alert("Semua field wajib diisi");
      return;
    }

    if (nikError) {
      alert(nikError);
      return;
    }

    if (isFutureDate(form.dob)) {
      alert("Tanggal lahir tidak boleh di masa depan");
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/api/registration/patients", {
        method: "POST",
        body: JSON.stringify(form),
      });

      alert("Pasien berhasil didaftarkan");
      setForm({ name: "", nik: "", dob: "", address: "" });
    } catch (e: any) {
      alert(e.message || "Gagal mendaftarkan pasien");
    } finally {
      setLoading(false);
    }
  }

  // =======================
  // RENDER
  // =======================
  return (
    <ProtectedRoute allowedRoles={["registration"]}>
      <DashboardLayout title="Pendaftaran Pasien Baru">
        <div className="max-w-xl space-y-4">
          {/* NAMA */}
          <input
            className="w-full rounded border p-2"
            placeholder="Nama Lengkap"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          {/* NIK */}
          <input
            className="w-full rounded border p-2"
            placeholder="NIK (16 digit)"
            value={form.nik}
            onChange={(e) => handleNikChange(e.target.value)}
          />
          {nikError && (
            <p className="text-sm text-red-600">{nikError}</p>
          )}

          {/* TANGGAL LAHIR */}
          <div className="relative">
            <input
              type="text"
              className="w-full rounded border p-2 pr-12"
              placeholder="DD/MM/YYYY"
              value={form.dob}
              onChange={(e) => {
                let v = e.target.value.replace(/[^\d/]/g, "");
                if (v.length === 2 || v.length === 5) {
                  if (!v.endsWith("/")) v += "/";
                }
                if (v.length <= 10) {
                  setForm({ ...form, dob: v });
                }
              }}
            />

            <input
              type="date"
              max={new Date().toISOString().split("T")[0]}
              className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 cursor-pointer opacity-0"
              onChange={(e) => {
                const formatted = formatDateToDMY(e.target.value);
                if (formatted) {
                  setForm({ ...form, dob: formatted });
                }
              }}
            />

            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
              📅
            </div>
          </div>

          {/* ALAMAT */}
          <textarea
            className="w-full rounded border p-2"
            placeholder="Alamat"
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
          />

          {/* SUBMIT */}
          <button
            onClick={submit}
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Daftarkan Pasien"}
          </button>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
