"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function ApiTokenBridge({
  onReady,
}: {
  onReady?: () => void;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const exchanging = useRef(false);

  useEffect(() => {
    if (status === "loading") return;

    // ❌ tidak login → balik ke login
    if (!session?.user?.email) {
      localStorage.removeItem("apiToken");
      router.replace("/login");
      return;
    }

    const token = localStorage.getItem("apiToken");

    // ✅ token masih ada → tidak perlu exchange
    if (token) {
      onReady?.();
      return;
    }

    // ⛔ cegah double exchange
    if (exchanging.current) return;
    exchanging.current = true;

    console.log("🔁 EXCHANGE API TOKEN @", pathname);

    fetch("/api/auth/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Exchange failed");
        return res.json();
      })
      .then((data) => {
        localStorage.setItem("apiToken", data.token);
        onReady?.();
      })
      .catch((err) => {
        console.error("❌ TOKEN EXCHANGE ERROR", err);
        localStorage.removeItem("apiToken");
        router.replace("/login");
      })
      .finally(() => {
        exchanging.current = false;
      });
  }, [status, session?.user?.email, pathname]);

  return null;
}
