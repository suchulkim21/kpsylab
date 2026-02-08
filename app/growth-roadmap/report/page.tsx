"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adaptFinalReport } from "@/lib/adapters/report-adapter";
import UnifiedReportCard from "@/components/report/UnifiedReportCard";
import type { UnifiedReportData } from "@/types/report";
import { analyzeInterference } from "@growth-roadmap/lib/module1/analysisEngine";
import { determineTypeCode } from "@growth-roadmap/lib/content/module2";

export default function FinalReportPage() {
  const router = useRouter();
  const [reportData, setReportData] = useState<UnifiedReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const m3Raw = localStorage.getItem("sg_module3_result");
    if (!m3Raw) {
      setError("최종 리포트를 구성할 결과가 준비되어 있지 않습니다. 3단계(이상향·잠재력)를 먼저 완료해 주세요.");
      return;
    }

    try {
      const m3Parsed = JSON.parse(m3Raw);
      const base = { stability: 0, growth: 0, relation: 0, autonomy: 0 };
      const ideal = { ...base, ...(m3Parsed.ideal ?? {}) };
      const potential = { ...base, ...(m3Parsed.potential ?? {}) };

      let m1: { dominantType?: string; shadowData?: string[] } | null = null;
      const m1Raw = localStorage.getItem("sg_module1_result");
      if (m1Raw) {
        try {
          const parsed = JSON.parse(m1Raw);
          const data = Array.isArray(parsed) ? parsed : (parsed.shadowData || []);
          const ids = (Array.isArray(data) ? data : []).map((x: unknown) => (typeof x === "string" ? x : (x as { id?: string })?.id)).filter((id: unknown): id is string => typeof id === "string");
          if (ids.length > 0) {
            const analysis = analyzeInterference(ids);
            m1 = { dominantType: analysis.dominantType, shadowData: ids };
          } else if (parsed.dominantType) {
            m1 = { dominantType: parsed.dominantType, shadowData: parsed.shadowData ?? [] };
          }
        } catch {
          // ignore
        }
      }

      let m2: { typeCode?: string; scores?: { proactivity: number; adaptability: number; socialDistance: number }; analysis?: Record<string, number> } | null = null;
      const m2Raw = localStorage.getItem("sg_module2_result");
      if (m2Raw) {
        try {
          const parsed = JSON.parse(m2Raw);
          const s = parsed.analysis ?? parsed.scores ?? {};
          const norm = (v: number) => Math.max(0, Math.min(100, Math.round(((Number(v) + 40) / 140) * 100)));
          const p = norm(s.proactivity ?? 0);
          const a = norm(s.adaptability ?? 0);
          const sd = norm(s.socialDistance ?? 0);
          const typeCode = parsed.typeCode ?? determineTypeCode({ p, a, sd });
          m2 = { typeCode, scores: { proactivity: p, adaptability: a, socialDistance: sd }, analysis: s };
        } catch {
          // ignore
        }
      }

      const adapted = adaptFinalReport(m1, m2, {
        ideal,
        potential,
        strategy: m3Parsed.strategy,
        dominantGap: m3Parsed.dominantGap,
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
        <p className="text-gray-400 text-sm">3단계 완료 후 &quot;최종 아키텍처 확인&quot; 버튼으로 다시 접속하시면 종합 분석 리포트를 볼 수 있습니다.</p>
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
    <div className="min-h-screen bg-black text-white py-10 px-4 relative overflow-hidden">
      <div className="mind-architect-bg-gradient" />
      <div className="mind-architect-bg-line" />
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <UnifiedReportCard data={reportData} />
        <div className="report-actions">
          <Link href="/growth-roadmap" className="report-btn-primary">
            마인드 아키텍터 대시보드로
          </Link>
          <Link href="/growth-roadmap/module1" className="report-btn-secondary">
            질의 1 재검사
          </Link>
          <Link href="/growth-roadmap/module2" className="report-btn-secondary">
            질의 2 재검사
          </Link>
          <Link href="/growth-roadmap/assessment" className="report-btn-secondary">
            질의 3 재검사
          </Link>
        </div>
      </div>
    </div>
  );
}
