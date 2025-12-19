export type Role =
  | "admin"
  | "registration"
  | "nurse"
  | "doctor";

export type MenuItem = {
  label: string;
  path: string;
};

export const menuConfig: Record<Role, MenuItem[]> = {
  admin: [
    { label: "Dashboard", path: "/admin" },
    { label: "Manajemen User", path: "/admin/users" },
    { label: "Audit Log", path: "/admin/audit" },
  ],
  registration: [
    { label: "Dashboard", path: "/registration" },
    { label: "Cari Pasien", path: "/registration/search-patient" },
    { label: "Pendaftaran Pasien", path: "/registration/patient" },
    { label: "Antrian", path: "/registration/queue" },
  ],
  nurse: [
    { label: "Dashboard", path: "/nurse" },
    { label: "Antrian Pasien", path: "/nurse/queue" },
    { label: "SOAP Keperawatan", path: "/nurse/soap" },
  ],
  doctor: [
    { label: "Dashboard", path: "/doctor" },
    { label: "Daftar Pasien", path: "/doctor/patients" },
    { label: "SOAP Dokter", path: "/doctor/soap" },
  ],
};
