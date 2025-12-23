"use client";

import { useEffect, useState } from "react";
import { decodeJWT } from "@/utils/jwt";
import type { UserRole } from "@/types/role";

type AuthState = {
  ready: boolean;
  authenticated: boolean;
  role?: UserRole | null;
};

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    ready: false,
    authenticated: false,
    role : null,
  });

  useEffect(() => {
    const token = localStorage.getItem("apiToken");
    if (!token) {
      setState({ ready: true, authenticated: false, role: null });
      return;
    }

    const payload = decodeJWT(token);

    if (!payload?.role) {
      localStorage.removeItem("apiToken");
      setState({ ready: true, authenticated: false, role: null });
      return;
    }

    setState({
      ready: true,
      authenticated: true,
      role: payload.role as UserRole,
    });
  }, []);

  return state;
}
