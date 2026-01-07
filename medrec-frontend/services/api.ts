import { getToken, logout } from "@/services/auth";

type ApiFetchOptions = RequestInit & {
  skipAuthRedirect?: boolean;
};

export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {}
) {
  const token = getToken();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // 🔐 HANDLE AUTH ERROR DI SINI
  if (res.status === 401) {
    logout();

    // jangan spam console
    if (!options.skipAuthRedirect) {
      window.location.href = "/login";
    }

    return null; // ⛔ STOP DI SINI, JANGAN THROW
  }

  const data = await res.json();

  if (!res.ok) {
    // error non-auth → masih boleh dilempar
    throw new Error(data?.error || "API Error");
  }

  return data;
}
