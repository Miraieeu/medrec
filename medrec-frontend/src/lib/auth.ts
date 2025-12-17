// medrec-frontend/src/lib/auth.ts
export type Role =
  | "admin"
  | "registration"
  | "nurse"
  | "doctor";

export type Session = {
  role: Role;
};

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;

  const role = sessionStorage.getItem("role") as Role | null;
  if (!role) return null;

  return { role };
}
