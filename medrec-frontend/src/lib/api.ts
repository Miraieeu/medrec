export async function apiFetch<T = any>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const data = await res.json();
      throw new Error(data.error || JSON.stringify(data));
    } else {
      const text = await res.text();
      throw new Error(text || "Server error");
    }
  }

  return res.json() as Promise<T>;
}
