import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function RegistrationQueuePage() {
  return (
    <ProtectedRoute allowedRoles={["registration"]}>
      <DashboardLayout title="Antrian Pasien">
        <p>Daftar antrian pasien.</p>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
