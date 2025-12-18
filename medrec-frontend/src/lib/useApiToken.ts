import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function useApiToken() {
  const { data: session, status } = useSession();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function exchange() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/exchange`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session!.user.email,
          }),
        }
      );

      const data = await res.json();
      setToken(data.token);
    }

    exchange();
  }, [status]);

  return token;
}
