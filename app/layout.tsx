import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VAIA Admin Dashboard",
  description: "Administrative control center for VAIA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
