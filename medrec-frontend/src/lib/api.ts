let apiToken: string | null = null;

// =======================
// TOKEN ACCESS
// =======================
export function getApiToken(): string | null {
  if (apiToken) return apiToken;

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("apiToken");
    if (stored) {
      apiToken = stored; // 🔁 restore ke memory
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

// =======================
// WAIT TOKEN READY
// =======================
export function waitForApiToken(): Promise<void> {
  return new Promise((resolve, reject) => {
    let tries = 0;

    const interval = setInterval(() => {
      const token =
        apiToken ||
        (typeof window !== "undefined"
          ? localStorage.getItem("apiToken")
          : null);

      if (token) {
        apiToken = token; // 🔥 restore ke memory
        clearInterval(interval);
        resolve();
        return;
      }

      tries++;
      if (tries > 30) {
        clearInterval(interval);
        reject(new Error("API token not ready"));
      }
    }, 100);
  });
}


// =======================
// FETCH WITH TOKEN
// =======================
export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = getApiToken();
  console.log("📡 apiFetch");
  console.log("path =", path);
  console.log("token =", token);
  if (!token) {
    console.error("❌ apiFetch TANPA token", path);
    throw new Error("Unauthorized: API token missing");
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

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
