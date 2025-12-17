import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DoctorDashboard() {
  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <DashboardLayout title="Dashboard Dokter">
        <p>Ringkasan pasien dokter.</p>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
