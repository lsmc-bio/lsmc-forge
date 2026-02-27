import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "LSMC Forge",
  description:
    "Product prototypes — deal agent, genome explorer, deal configurator, pipeline viz",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-lsmc-night font-sans text-lsmc-ice antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
