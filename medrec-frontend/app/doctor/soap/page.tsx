import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DoctorSoapPage() {
  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <DashboardLayout title="SOAP Dokter">
        <p>Form SOAP dokter.</p>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
