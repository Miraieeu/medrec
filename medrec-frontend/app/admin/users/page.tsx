import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function UserManagementPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout title="Manajemen User">
        <p>Daftar dan pengaturan user.</p>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
