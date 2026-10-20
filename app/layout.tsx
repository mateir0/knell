import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { strings } from "@/lib/strings";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  display: "swap",
  variable: "--knell-archivo",
});

export const metadata: Metadata = {
  title: strings.meta.title,
  description: strings.meta.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="min-h-screen bg-canvas text-body antialiased">{children}</body>
    </html>
  );
}
