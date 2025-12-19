"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { setApiToken } from "@/lib/api";

function ApiTokenSync() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const exchanging = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!session?.user?.email) return;

    const token = localStorage.getItem("apiToken");

    // ✅ kalau token sudah ada → JANGAN ganggu
    if (token) return;

    if (exchanging.current) return;
    exchanging.current = true;

    console.log("🔁 TOKEN EXCHANGE @", pathname);

    fetch("/api/auth/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Exchange failed");
        return res.json();
      })
      .then((data) => {
  console.log("✅ API TOKEN =", data.token);
  setApiToken(data.token);

})
      .catch((err) => {
        console.error("❌ EXCHANGE ERROR", err);
      })
      .finally(() => {
        exchanging.current = false;
      });
  }, [status, session?.user?.email, pathname]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ApiTokenSync />
      {children}
    </SessionProvider>
  );
}
