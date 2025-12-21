import type { UserRole } from "@/types/role";

export type MenuItem = {
  label: string;
  href: string;
  roles: UserRole[];
};

export const MENU: MenuItem[] = [
  { label: "Antrian", href: "/registration/queue", roles: ["registration"] },
  { label: "Antrian Nurse", href: "/nurse/queue", roles: ["nurse"] },
  { label: "Antrian Dokter", href: "/doctor/queue", roles: ["doctor"] },
  { label: "Admin Panel", href: "/admin", roles: ["admin"] },
];

export const MENU_BY_ROLE: Record<UserRole, MenuItem[]> = {
  admin: MENU.filter((m) => m.roles.includes("admin")),
  registration: MENU.filter((m) => m.roles.includes("registration")),
  nurse: MENU.filter((m) => m.roles.includes("nurse")),
  doctor: MENU.filter((m) => m.roles.includes("doctor")),
};
