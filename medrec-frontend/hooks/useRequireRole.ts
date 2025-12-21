"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, logout } from "@/services/auth";
import { decodeJWT } from "@/utils/jwt";

export function useRequireRole(allowedRoles: string[]) {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      logout();
      router.replace("/login");
      return;
    }

    const payload = decodeJWT(token);

    if (!payload || !allowedRoles.includes(payload.role)) {
      router.replace("/unauthorized");
      return;
    }

    // optional: cek exp
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      logout();
      router.replace("/login");
    }
  }, [allowedRoles, router]);
}
