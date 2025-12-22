import type { UserRole } from "@/types/role";

export type MenuItem = {
  label: string;
  href: string;
};



export const MENU_BY_ROLE: Record<UserRole, MenuItem[]> = {
  admin: [
    
    {
      label: "Audit & Log Check",
      href: "/admin/audit",
    },
    {
      label: "User Configuration",
      href: "/admin/users",
    },
  ],

  registration: [
    {
      label: "Daftar Pasien",
      href: "/registration/patients",
    },{
      label: "Menambahkan Pasien ke Sistem",
      href: "/registration/search-patient",
    },
    {
      label: "Antrian Pasien",
      href: "/registration/queue",
    },
  ],

  nurse: [
    {
      label: "Antrian Pasien",
      href: "/nurse/queue",
    },
    {
      label: "Cek Rekam Medis",
      href: "/nurse/records/search",
    },
  ],

  doctor: [
    {
      label: "Antrian Pasien",
      href: "/doctor/queue",
    },
    {
      label: "Cek Rekam Medis",
      href: "/doctor/records/search",
    },
  ],
};