import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function NurseQueuePage() {
  return (
    <ProtectedRoute allowedRoles={["nurse"]}>
      <DashboardLayout title="Antrian Perawat">
        <p>Antrian pasien untuk pemeriksaan.</p>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
