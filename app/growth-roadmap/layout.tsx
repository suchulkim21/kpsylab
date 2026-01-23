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
  title: "성장 로드맵",
  description: "Advanced Psychological Audit System",
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
