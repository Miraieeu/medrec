"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function RegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["registration"]}>
      {children}
    </ProtectedRoute>
  );
}
