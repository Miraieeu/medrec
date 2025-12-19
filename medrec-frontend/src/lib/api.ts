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
  if (!apiToken) {
    console.warn("⚠️ apiFetch dipanggil TANPA token", path);
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${path}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
        ...(options.headers || {}),
      },
    }
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
