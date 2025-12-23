let apiToken: string | null = null;

// =======================
// TOKEN ACCESS
// =======================
import { TOKEN_KEY } from "@/lib/constants";

// Fungsi untuk MENYIMPAN token (Dipanggil saat Login)
export function setApiToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

// Fungsi untuk MENGHAPUS token (Dipanggil saat Logout)
export function clearApiToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Fungsi helper kalau butuh ambil token biasa (bukan hook)
export function getApiToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

// =======================
// FETCH WRAPPER
// =======================
export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = getApiToken();

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${path}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    }
  );

  if (res.status === 401) {
    clearApiToken();
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || "API Error");
  }

  return res.json();
}
