export type JWTPayload = {
  sub: number;
  role: string;
  email?: string;
  exp?: number;
};

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}
