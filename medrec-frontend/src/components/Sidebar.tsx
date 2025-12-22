"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU_BY_ROLE } from "@/config/menu";
import { useAuth } from "@/lib/useAuth";
import LogoutButton from "@/components/LogoutButton";

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();

  if (!role) return null;

  const menu = MENU_BY_ROLE[role] ?? [];

  return (
    <aside className="flex w-64 flex-col border-r bg-white">
      {/* LOGO */}
      <div className="border-b px-6 py-4 text-lg font-bold text-blue-600">
        MedRec
      </div>

      {/* MENU */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {menu.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded px-4 py-2 text-sm font-medium transition
                ${
                  active
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="border-t p-4">
        <LogoutButton />
      </div>
    </aside>
  );
}
