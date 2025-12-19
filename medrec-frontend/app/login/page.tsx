"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // ⛔ jangan auto redirect
    });

    if (res?.error) {
      setLoading(false);
      setError("Email atau password salah");
      return;
    }

    /**
     * ⚠️ PENTING
     * NextAuth butuh sedikit waktu untuk menulis session cookie
     * Jadi kita tunggu sebentar lalu ambil session
     */
    setTimeout(async () => {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      const role = session?.user?.role;


      console.log("🔎 SESSION AFTER LOGIN =", session);

      console.log("LOGIN SUCCESS → ROLE =", role);

      switch (role) {
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
    }, 300);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded bg-white p-6 shadow"
      >
        <h1 className="mb-6 text-center text-xl font-semibold">
          Login MedRec
        </h1>

        {error && (
          <div className="mb-4 rounded bg-red-100 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}