"use client";

import { ReactNode } from "react";
import { signOut, useSession } from "next-auth/react";
import Sidebar from "./Sidebar";

type Props = {
  title?: string;
  children: ReactNode;
};

export default function DashboardLayout({ title, children }: Props) {
  const { data: session } = useSession();
  const user = session?.user as
    | { email?: string; role?: string }
    | undefined;

  return (
    <div className="flex min-h-screen bg-white">
      {/* SIDEBAR */}
      <Sidebar />

      {/* CONTENT */}
      <main className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="flex items-center justify-between border-b px-6 py-4">
          <div>
            {title && (
              <h1 className="text-lg font-semibold">{title}</h1>
            )}
          </div>

          {/* USER INFO */}
          {user && (
            <div className="flex items-center gap-4 text-sm">
              <div className="text-right leading-tight">
                <div className="font-medium">
                  {user.email}
                </div>
                <div className="text-gray-500 capitalize">
                  {user.role}
                </div>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}
