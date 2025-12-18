let apiToken: string | null = null;

/**
 * Dipanggil 1x setelah login / exchange token
 */
export function setApiToken(token: string) {
  apiToken = token;
  console.log("API TOKEN SET =", apiToken);
}

/**
 * Wrapper fetch ke backend Express
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
  // selalu ambil token terbaru
  const tokenRes = await fetch("/api/auth/exchange");

  if (!tokenRes.ok) {
    throw new Error("Not authenticated");
  }

  const { token } = await tokenRes.json();

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

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
