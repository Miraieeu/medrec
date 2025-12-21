let apiToken: string | null = null;

// =======================
// TOKEN ACCESS
// =======================
export function getApiToken(): string | null {
  if (apiToken) return apiToken;

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("apiToken");
    if (stored) {
      apiToken = stored;
      return stored;
    }
  }

  return null;
}

export function setApiToken(token: string) {
  apiToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("apiToken", token);
  }
}

export function clearApiToken() {
  apiToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("apiToken");
  }
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
