import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KPSY LAB - 심리 분석 서비스 통합 플랫폼",
  description: "MNPS, Second Genesis 등 심리 분석 서비스를 제공하는 통합 플랫폼",
  keywords: ["심리 분석", "심리 측정", "Dark Tetrad", "MNPS", "Second Genesis", "KPSY LAB"],
  authors: [{ name: "KPSY LAB" }],
  openGraph: {
    title: "KPSY LAB - 심리 분석 서비스 통합 플랫폼",
    description: "MNPS, Second Genesis 등 심리 분석 서비스를 제공하는 통합 플랫폼",
    url: "https://www.kpsylab.com",
    siteName: "KPSY LAB",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KPSY LAB - 심리 분석 서비스 통합 플랫폼",
    description: "MNPS, Second Genesis 등 심리 분석 서비스를 제공하는 통합 플랫폼",
  },
  metadataBase: new URL("https://www.kpsylab.com"),
  alternates: {
    canonical: "https://www.kpsylab.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AnalyticsTracker />
          <Navigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
