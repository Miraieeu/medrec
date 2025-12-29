"use client";

import { ReactNode } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";

export default function NurseLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["nurse"]}>
      <DashboardLayout title="Dashboard Nurse">
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
