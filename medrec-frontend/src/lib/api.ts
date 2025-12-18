let apiToken: string | null = null;

export function setApiToken(token: string) {
  apiToken = token;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${path}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(apiToken
          ? { Authorization: `Bearer ${apiToken}` }
          : {}),
        ...(options.headers || {}),
      },
    }
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
