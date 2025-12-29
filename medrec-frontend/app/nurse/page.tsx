import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function NurseDashboard() {
  return (
    <ProtectedRoute allowedRoles={["nurse"]}>
      <DashboardLayout title="Dashboard Perawat">
        <p>Ringkasan tugas perawat.</p>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
