"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import type { UserRole } from "@/types/role";

export default function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: ReactNode;
}) {
  const router = useRouter();
  const { ready, authenticated, role } = useAuth();

  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      router.replace("/login");
      return;
    }

    if (!role || !allowedRoles.includes(role)) {
      router.replace("/unauthorized");
    }
  }, [ready, authenticated, role]);

  if (!ready) return null;
  if (!authenticated) return null;
  if (!role || !allowedRoles.includes(role)) return null;

  return <>{children}</>;
}
