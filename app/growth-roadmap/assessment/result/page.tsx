"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adaptModule3 } from "@/lib/adapters/report-adapter";
import UnifiedReportCard from "@/components/report/UnifiedReportCard";
import type { UnifiedReportData } from "@/types/report";

export default function AssessmentResultPage() {
  const router = useRouter();
  const [reportData, setReportData] = useState<UnifiedReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("sg_module3_result");
    if (!stored) {
      setError("모듈 3 결과를 찾을 수 없습니다.");
      router.push("/growth-roadmap/assessment");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      const adapted = adaptModule3({
        ideal: parsed.ideal,
        potential: parsed.potential,
        strategy: parsed.strategy,
        dominantGap: parsed.dominantGap,
      });
      setReportData(adapted);
    } catch (err) {
      console.error("Module3 parsing error", err);
      setError("분석 데이터를 불러오는 중 오류가 발생했습니다.");
    }
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center px-4">
        <p className="text-red-400 text-lg font-semibold mb-3">{error}</p>
        <Link href="/growth-roadmap/assessment" className="report-btn-secondary">
          다시 실행
        </Link>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>분석 결과를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <UnifiedReportCard data={reportData} />
        <div className="report-actions">
          <Link href="/growth-roadmap/assessment" className="report-btn-secondary">
            재검사
          </Link>
          <Link href="/growth-roadmap/report" className="report-btn-primary">
            최종 아키텍처 확인
          </Link>
        </div>
      </div>
    </div>
  );
}
