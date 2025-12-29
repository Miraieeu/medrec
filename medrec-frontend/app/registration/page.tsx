

import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function RegistrationDashboard() {
  return (
    <ProtectedRoute allowedRoles={["registration"]}>
      <DashboardLayout title="Dashboard Pendaftaran">
        <p>Halaman dashboard pendaftaran.</p>
      </DashboardLayout>
    </ProtectedRoute>
  );
}


