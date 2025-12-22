
import ProtectedRoute from "@/components/ProtectedRoute";

export default function NurseSoapPage() {
  return (
    <ProtectedRoute allowedRoles={["nurse"]}>

        <p>Form SOAP keperawatan.</p>

    </ProtectedRoute>
  );
}
