"use client";

import { ReactNode } from "react";
import { useAuth } from "@/lib/useAuth";
import Sidebar from "@/components/Sidebar";

type Props = {
  title: string;
  children: ReactNode;
};

export default function DashboardLayout({ title, children }: Props) {
  const { ready, authenticated, role } = useAuth();

  if (!ready || !authenticated || !role) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex flex-1 flex-col">
        {/* HEADER */}
        <header className="flex items-center justify-between border-b bg-white px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">
            {title}
          </h1>

          <span className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-600">
            Role: {role}
          </span>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
