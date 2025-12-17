// medrec-frontend/app/unauthorized/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow space-y-4">
        <h1 className="text-2xl font-bold text-red-600">
          Akses Ditolak
        </h1>

        <p className="text-gray-600">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>

        <button
          onClick={() => router.push("/login")}
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          Kembali ke Login
        </button>
      </div>
    </main>
  );
}
