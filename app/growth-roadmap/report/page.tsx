 "use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adaptModule3 } from "@/lib/adapters/report-adapter";
import UnifiedReportCard from "@/components/report/UnifiedReportCard";
import type { UnifiedReportData } from "@/types/report";

export default function FinalReportPage() {
  const router = useRouter();
  const [reportData, setReportData] = useState<UnifiedReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("sg_module3_result");
    if (!stored) {
      setError("최종 리포트를 구성할 결과가 준비되어 있지 않습니다.");
      router.push("/growth-roadmap");
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
      console.error("Final report parsing failed", err);
      setError("최종 보고서를 생성하는 동안 문제가 발생했습니다.");
    }
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 space-y-4 text-center">
        <p className="text-red-400 text-lg font-semibold">{error}</p>
        <Link href="/growth-roadmap" className="report-btn-secondary">
          마인드 아키텍터 대시보드로
        </Link>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>최종 리포트를 준비하고 있습니다...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <UnifiedReportCard data={reportData} />
        <div className="report-actions">
          <Link href="/growth-roadmap/assessment" className="report-btn-secondary">
            이상향 재측정
          </Link>
          <Link href="/growth-roadmap/module1" className="report-btn-primary">
            모듈 1 재검사
          </Link>
        </div>
      </div>
    </div>
  );
}
