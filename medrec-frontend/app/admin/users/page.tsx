"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type User = {
  id: number;
  email: string;
  role: string;
  createdAt: string;
};

type NewUser = {
  name: string;
  email: string;
  password: string;
  role: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    name: "",
    email: "",
    password: "",
    role: "doctor",
  });

  /* ======================
   * LOAD USERS
   * ====================== */
  async function loadUsers() {
    const res = await apiFetch("/api/admin/users");
    setUsers(res.data);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  /* ======================
   * CREATE USER
   * ====================== */
  async function createUser() {
    if (!newUser.email || !newUser.password || !newUser.role) {
      alert("Data belum lengkap");
      return;
    }

    await apiFetch("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(newUser),
    });

    setShowCreate(false);
    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "doctor",
    });

    loadUsers();
  }

  /* ======================
   * RESET PASSWORD
   * ====================== */
  async function resetPassword(id: number) {
    await apiFetch(`/api/admin/users/${id}/password`, {
      method: "PATCH",
      body: JSON.stringify({ password: "dummy" }),
    });
    alert("Password reset ke 'dummy'");
  }

  /* ======================
   * DELETE USER
   * ====================== */
  async function deleteUser(id: number) {
    if (!confirm("Delete user?")) return;

    await apiFetch(`/api/admin/users/${id}`, {
      method: "DELETE",
    });

    loadUsers();
  }

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">User Management</h2>

        <button
          onClick={() => setShowCreate(true)}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Tambah User
        </button>
      </div>

      {/* TABLE */}
      <table className="w-full border border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2 text-left">Email</th>
            <th className="border px-3 py-2 text-center">Role</th>
            <th className="border px-3 py-2 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="px-3 py-2">{u.email}</td>

              <td className="px-3 py-2 text-center">
                <span className="inline-block rounded bg-gray-100 px-3 py-1 text-sm font-medium">
                  {u.role}
                </span>
              </td>

              <td className="px-3 py-2 text-center space-x-3">
                <button
                  onClick={() => resetPassword(u.id)}
                  className="text-blue-600 hover:underline"
                >
                  Reset Password
                </button>

                <button
                  onClick={() => deleteUser(u.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* CREATE USER MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Tambah User Baru</h3>

            <div className="space-y-3">
              <input
                placeholder="Nama Pegawai"
                className="w-full rounded border px-3 py-2"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
              />

              <input
                placeholder="Email"
                type="email"
                className="w-full rounded border px-3 py-2"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />

              <input
                placeholder="Password"
                type="password"
                className="w-full rounded border px-3 py-2"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
              />

              <select
                className="w-full rounded border px-3 py-2"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
              >
                <option value="registration">Registration</option>
                <option value="nurse">Nurse</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded px-4 py-2 text-gray-600 hover:bg-gray-100"
              >
                Batal
              </button>

              <button
                onClick={createUser}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
