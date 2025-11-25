import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import { ReduxProvider } from './providers'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "時空中的繪旅人繁中服活動時間軸",
  description: "依照時空中的繪旅人繁中服活動時間軸，提供活動資訊和狀態追蹤。",
  keywords: ["繪旅人", "繁中服", "活動", "時間軸"],
  openGraph: {
    title: "時空中的繪旅人繁中服活動時間軸",
    description: "依照時空中的繪旅人繁中服活動時間軸，提供活動資訊和狀態追蹤。",
    images: "/og-image.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>{children}</ReduxProvider>
        <Analytics />
      </body>
    </html>
  );
}
