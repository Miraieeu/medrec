"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { setApiToken } from "@/lib/api";

function ApiTokenBridge() {
 
  const { data: session, status } = useSession();

  useEffect(() => {
    console.group("🔐 SESSION DEBUG");
    console.log("status =", status);
    console.log("user =", session?.user);
    console.log("role =", (session?.user as any)?.role);
    console.groupEnd();
     if (status !== "authenticated") {
    setApiToken('null'); // 🔥 PENTING
    return;
  }

    console.log("✅ SESSION OK, EXCHANGE TOKEN");

     fetch("/api/auth/exchange")
    .then(res => res.json())
    .then(data => {
      setApiToken(data.token);
    console.log("✅ API TOKEN =", data.token);

      })
      .catch((err) => {
        console.error("❌ TOKEN EXCHANGE ERROR", err);
      });
  }, [status]);

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
