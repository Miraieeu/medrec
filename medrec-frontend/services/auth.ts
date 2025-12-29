const API_URL = "http://localhost:4000";
export function saveToken(token: string) {
  localStorage.setItem("accessToken", token);
}

export function getToken(): string | null {
  return localStorage.getItem("accessToken");
}

export function logout() {
  localStorage.removeItem("accessToken");
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  // 🔑 SIMPAN JWT
  localStorage.setItem("accessToken", data.accessToken);

  return data;
}
