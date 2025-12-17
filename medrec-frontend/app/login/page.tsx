"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (res?.ok) {
  const sessionRes = await fetch("/api/auth/session");
  const session = await sessionRes.json();

  router.push(`/${session.user.role}`);
}
 else {
      setError("Email atau password salah");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded bg-white p-6 shadow"
      >
        <h1 className="text-xl font-bold">Login MedRec</h1>

        {error && <p className="text-red-600">{error}</p>}

        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full border p-2"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full border p-2"
        />

        <button className="w-full bg-blue-600 py-2 text-white">
          Login
        </button>
      </form>
    </main>
  );
}
