import { useEffect, useState } from "react";
import { TOKEN_KEY } from "@/lib/constants";
export function useApiToken() {
  // State untuk menyimpan token
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Cek apakah kita sedang di browser (bukan di server saat build)
    if (typeof window !== "undefined") {
      // Ambil token dari LocalStorage sesuai KEY yang kita tentukan
      const storedToken = localStorage.getItem(TOKEN_KEY);
      setToken(storedToken);
    }
  }, []);

  return token;
}