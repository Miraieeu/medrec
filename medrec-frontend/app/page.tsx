"use client";


export default function HomePage() {
  const { data: session, status } = ;
  console.log(status, session);
 
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">
          MedRec System
        </h1>

        <p className="text-gray-600">
          Sistem Rekam Medis Internal Klinik
        </p>

        <p className="text-sm text-gray-500">
          Silakan login untuk melanjutkan
        </p>
      </div>
    </main>
  );
}
