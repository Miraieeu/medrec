"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/auth";
import { decodeJWT } from "@/utils/jwt";
import { setApiToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { accessToken } = await login(email, password);

      // 🔑 simpan token sebelum redirect
      setApiToken(accessToken);

      const payload = decodeJWT(accessToken);

      if (!payload?.role) {
        throw new Error("Invalid authentication token");
      }

      switch (payload.role) {
        case "admin":
          router.replace("/admin");
          break;
        case "registration":
          router.replace("/registration/queue");
          break;
        case "nurse":
          router.replace("/nurse/queue");
          break;
        case "doctor":
          router.replace("/doctor/queue");
          break;
        default:
          router.replace("/unauthorized");
      }
    } catch (err: any) {
      setError(
        err?.message === "UNAUTHORIZED"
          ? "Email atau password salah"
          : err?.message || "Login gagal"
      );
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg">
        {/* HEADER */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-800">
            MedRec System
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Medical Record Management
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="user@medrec.local"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="••••••••"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} MedRec System
        </p>
      </div>
    </div>
  );
}
