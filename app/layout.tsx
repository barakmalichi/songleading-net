import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Songleading.net",
  title: "Songleading Tools and Training",
  description: "Plan lineups, prepare lyric slides, and lead stronger musical gatherings with resources from Barak Malichi.",
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Songleading.net",
    statusBarStyle: "black-translucent"
  },
  icons: {
    icon: "/lineup/icon.svg",
    apple: "/lineup/icon.svg"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#070b12"
};

const themeScript = `
try {
  var storedTheme = window.localStorage.getItem("songleading-theme");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if ((storedTheme && storedTheme === "dark") || (!storedTheme && prefersDark)) {
    document.documentElement.dataset.siteTheme = "dark";
  }
} catch (error) {}
`;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
