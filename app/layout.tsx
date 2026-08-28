import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BAZNAS NTB",
  description:
    "Platform Zakat dan Donasi Resmi BAZNAS NTB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}