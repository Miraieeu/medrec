"use client";

import { ReactNode } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";

export default function DoctorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <DashboardLayout title="Dashboard Dokter">
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
