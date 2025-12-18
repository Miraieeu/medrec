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

    const role = (session.user as any).role;
    if (!allowedRoles.includes(role)) {
      router.replace("/unauthorized");
    }
  }, [session, status, allowedRoles, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-gray-500">Checking session...</span>
      </div>
    );
  }

  return <>{children}</>;
}
