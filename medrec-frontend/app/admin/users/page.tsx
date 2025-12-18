"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

type User = {
  id: number;
  email: string;
  role: string;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  async function updateRole(userId: number, role: string) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, role } : u
      )
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout title="Manajemen User">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Email</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="border p-2">
                    {user.email}
                  </td>
                  <td className="border p-2">
                    {user.role}
                  </td>
                  <td className="border p-2">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        updateRole(
                          user.id,
                          e.target.value
                        )
                      }
                      className="border p-1"
                    >
                      <option value="admin">admin</option>
                      <option value="registration">
                        registration
                      </option>
                      <option value="nurse">nurse</option>
                      <option value="doctor">doctor</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
