import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import WebVitalsTracker from "@/components/WebVitalsTracker";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastContainer } from "@/components/ErrorToast";
import { SkipLink } from "@/components/SkipLink";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KPSY LAB - 내면 데이터 구조적 재구성 플랫폼",
  description: "MNPS, 마인드 아키텍터 등 데이터 큐레이션 기반 통합 심리 분석 아키텍처",
  keywords: ["심리 분석", "데이터 큐레이션", "다크 테트라드", "MNPS", "마인드 아키텍터", "KPSY LAB"],
  authors: [{ name: "KPSY LAB" }],
  openGraph: {
    title: "KPSY LAB - 내면 데이터 구조적 재구성 플랫폼",
    description: "MNPS, 마인드 아키텍터 등 데이터 큐레이션 기반 통합 심리 분석 아키텍처",
    url: "https://www.kpsylab.com",
    siteName: "KPSY LAB",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KPSY LAB - 내면 데이터 구조적 재구성 플랫폼",
    description: "MNPS, 마인드 아키텍터 등 데이터 큐레이션 기반 통합 심리 분석 아키텍처",
  },
  metadataBase: new URL("https://www.kpsylab.com"),
  alternates: {
    canonical: "https://www.kpsylab.com",
  },
  other: {
    'naver-site-verification': '722a468f75232d932b84e1718430fa62220eaf69',
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
        <ErrorBoundary>
          <SkipLink />
          <KeyboardShortcuts />
          <AnalyticsTracker />
          <WebVitalsTracker />
          <Navigation />
          <ToastContainer />
          <main id="main-content">{children}</main>
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  );
}
