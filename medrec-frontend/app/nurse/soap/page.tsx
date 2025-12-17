import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function NurseSoapPage() {
  return (
    <ProtectedRoute allowedRoles={["nurse"]}>
      <DashboardLayout title="SOAP Keperawatan">
        <p>Form SOAP keperawatan.</p>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
