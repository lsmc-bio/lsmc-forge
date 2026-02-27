import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LSMC Forge",
  description:
    "Product prototypes — deal agent, BED performance viz, deal configurator, pipeline viz",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-lsmc-night font-sans text-lsmc-ice antialiased">
        {children}
      </body>
    </html>
  );
}
