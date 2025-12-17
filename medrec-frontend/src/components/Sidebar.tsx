"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { menuConfig } from "@/lib/menuConfig";


export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const role = session?.user?.role;

  if (!role) return null;

  const menus = menuConfig[role];

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="px-4 py-6 font-bold text-lg border-b border-gray-700">
        Menu
      </div>

      <nav className="mt-4">
        <ul className="space-y-1">
          {menus.map((menu) => (
            <li key={menu.path}>
              <Link
                href={menu.path}
                className={`block px-4 py-2 text-sm hover:bg-gray-700 ${
                  pathname === menu.path ? "bg-gray-700" : ""
                }`}
              >
                {menu.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
