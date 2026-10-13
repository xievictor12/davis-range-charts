import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rangebench",
  description: "The uploaded range charts, sized for a landscape iPad, with the keys you play lit on the sheet.",
};

export const viewport: Viewport = {
  themeColor: "#221e18",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${display.variable} dark h-full antialiased`}
    >
      <body className="h-dvh overflow-hidden">{children}</body>
    </html>
  );
}
