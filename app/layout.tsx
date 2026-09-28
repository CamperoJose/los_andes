import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Los Andes | Oportunidades profesionales",
  description: "Convocatorias, postulaciones y seguimiento de selección de Los Andes.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
