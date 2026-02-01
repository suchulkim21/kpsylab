"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adaptModule2 } from "@/lib/adapters/report-adapter";
import { isDirty, clearDirty, updateM2Global } from "@/lib/store/userGlobalVector";
import UnifiedReportCard from "@/components/report/UnifiedReportCard";
import type { UnifiedReportData } from "@/types/report";
import { Module2Engine } from "@growth-roadmap/lib/module2/analysisEngine";
import { determineTypeCode, getKoreanTypeName, ResultItem } from "@growth-roadmap/lib/content/module2";

const normalizeSegment = (value: number) =>
  Math.max(0, Math.min(100, Math.round(((value + 40) / 140) * 100)));

const buildDetailText = (items: ResultItem[]) =>
  items
    .slice(0, 4)
    .map((item) => `**${item.title}**\n${item.content}`)
    .join("\n\n");

const buildAdviceTodos = (items: ResultItem[]) =>
  items
    .filter((item) => item.category === "임상 솔루션")
    .slice(0, 3)
    .map((item) => `${item.title}: ${item.content}`);

export default function Module2ResultPage() {
  const [reportData, setReportData] = useState<UnifiedReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRetestBanner, setShowRetestBanner] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sg_module2_result");
    if (!stored) {
      setError("보관된 분석 결과가 없습니다.");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      const scores =
        parsed.analysis ??
        parsed.scores ??
        (parsed.proactivity !== undefined
          ? {
              proactivity: parsed.proactivity,
              adaptability: parsed.adaptability,
              socialDistance: parsed.socialDistance,
            }
          : parsed);

      const normalized = {
        proactivity: normalizeSegment(scores.proactivity ?? 0),
        adaptability: normalizeSegment(scores.adaptability ?? 0),
        socialDistance: normalizeSegment(scores.socialDistance ?? 0),
      };

      const engine = new Module2Engine({ scores });
      const results = engine.generateResults();
      // 이렇게 중괄호 { } 를 사용해 변수 이름을 맞춰줘야 합니다.
      const typeCode = determineTypeCode({
        p: normalized.proactivity,
        a: normalized.adaptability,
        sd: normalized.socialDistance,
      });
      const typeName = getKoreanTypeName(typeCode);

      updateM2Global({
        typeCode,
        scores: { p: normalized.proactivity, a: normalized.adaptability, sd: normalized.socialDistance },
      });

      setReportData(
        adaptModule2({
          title: typeName,
          description: buildDetailText(results),
          summary: `${typeName}의 대인 행동 프로필`,
          metrics: {
            input: normalized.proactivity,
            processing: normalized.adaptability,
            output: normalized.socialDistance,
          },
          advice: {
            title: "임상 솔루션",
            todos: buildAdviceTodos(results),
          },
        })
      );
      setShowRetestBanner(isDirty("m2"));
      if (isDirty("m2")) clearDirty("m2");
    } catch (err) {
      console.error("Module2 result parsing failed", err);
      setError("분석 데이터를 해석하는 동안 오류가 발생했습니다.");
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <p className="text-red-400 text-lg font-semibold">{error}</p>
        <Link href="/growth-roadmap/module2" className="report-btn-secondary">
          재검사
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
    <div className="min-h-screen bg-black text-white py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {showRetestBanner && (
          <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5 text-blue-200 text-sm">
            M1 재검사로 인해 관점이 갱신되었을 수 있습니다. 통합 리포트에서 최신 데이터를 확인하세요.
          </div>
        )}
        <UnifiedReportCard data={reportData} />
        <div className="report-actions">
          <Link href="/growth-roadmap/module2" className="report-btn-secondary">
            재검사
          </Link>
          <Link href="/growth-roadmap/assessment" className="report-btn-primary">
            다음 단계로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}
