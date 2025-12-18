import AuthSessionProvider from "@/components/SessionProvider";
// app/layout.tsx (FINAL & BENAR)
import "./globals.css";
import Providers from "./Providers";

export const metadata = {
  title: "MedRec System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
