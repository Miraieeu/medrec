"use client";

import { useRouter } from "next/navigation";
import { clearApiToken } from "@/lib/api";

export default function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    clearApiToken();
    router.replace("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
    >
      Logout
    </button>
  );
}
