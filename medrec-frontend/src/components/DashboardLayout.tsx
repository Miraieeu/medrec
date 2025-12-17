"use client";

import { ReactNode } from "react";
import LogoutButton from "@/components/LogoutButton";
import Sidebar from "@/components/Sidebar";
import { useSession } from "next-auth/react";

export default function DashboardLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between bg-white px-6 py-4 shadow">
          <div>
            <h1 className="text-lg font-bold">MedRec System</h1>
            <p className="text-sm text-gray-600">
              Role: {session?.user?.role}
            </p>
          </div>

          <LogoutButton />
        </header>

        {/* Content */}
        <main className="p-6">
          <h2 className="mb-4 text-xl font-semibold">{title}</h2>
          <div className="rounded bg-white p-4 shadow">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
