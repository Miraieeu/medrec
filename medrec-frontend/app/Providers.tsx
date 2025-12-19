"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { setApiToken } from "@/lib/api";

function ApiTokenBridge() {
  const { data: session, status } = useSession();
  const exchangedRef = useRef(false); // ⬅️ cegah double exchange

  useEffect(() => {
    // ❌ belum login → jangan apa-apa
    if (status !== "authenticated") return;

    // ❌ sudah pernah exchange → stop
    if (exchangedRef.current) return;

    // ❌ email wajib ada
    if (!session?.user?.email) {
      console.warn("⚠️ SESSION TANPA EMAIL");
      return;
    }

    exchangedRef.current = true;

    console.log("🔁 EXCHANGE API TOKEN for", session.user.email);

    fetch("/api/auth/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ API TOKEN SET");
        setApiToken(data.token);
      })
      .catch((err) => {
        console.error("❌ TOKEN EXCHANGE FAILED", err);
        exchangedRef.current = false; // allow retry
      });
  }, [status, session]);

  return null;
}

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ApiTokenBridge />
      {children}
    </SessionProvider>
  );
}
