import "./globals.css";
import AuthSessionProvider from "@/components/SessionProvider";

export const metadata = {
  title: "MedRec System",
  description: "Internal Medical Record System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
