import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SCARPIG Repuestos",
  description: "Sistema de gestión de solicitudes de repuestos automotrices",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className={`${geist.className} h-full bg-gray-50`}>{children}</body>
    </html>
  );
}
