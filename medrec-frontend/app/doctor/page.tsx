import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DoctorDashboard() {
  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      
        <p>Ringkasan pasien dokter.</p>
     
    </ProtectedRoute>
  );
}
