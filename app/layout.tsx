import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lyric Slide Studio",
  description: "Create clean lyric slides for worship, camp, teaching, and events."
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
