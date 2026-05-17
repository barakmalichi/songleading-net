import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Songleading",
  description: "Build show lineups, stage exports, and lyric slides in one workspace."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
