import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout title="Dashboard Admin">
        <p>Ringkasan sistem.</p>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
