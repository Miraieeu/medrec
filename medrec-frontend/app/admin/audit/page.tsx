import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AuditLogPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout title="Audit Log">
        <p>Log aktivitas sistem.</p>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
