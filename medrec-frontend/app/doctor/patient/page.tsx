import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DoctorPatientsPage() {
  
  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <DashboardLayout title="Daftar Pasien">
        <p>Daftar pasien dokter.</p>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
