import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function PatientRegistrationPage() {
  return (
    <ProtectedRoute allowedRoles={["registration"]}>
      <DashboardLayout title="Pendaftaran Pasien">
        <p>Form pendaftaran pasien.</p>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
