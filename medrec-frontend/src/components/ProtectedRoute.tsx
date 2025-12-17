"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes((session.user as any).role)) {
      router.replace("/unauthorized");
    }
  }, [session, status, allowedRoles, router]);

  if (status === "loading") return null;

  return <>{children}</>;
}
