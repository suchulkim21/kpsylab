import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./growth-roadmap.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "마인드 아키텍터",
  description: "통합 심리 분석 아키텍처 - 경로 탐색 및 데이터 큐레이션",
};

export default function GrowthRoadmapLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}>
      {children}
    </div>
  );
}
