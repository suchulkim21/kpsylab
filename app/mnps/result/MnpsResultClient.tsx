"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adaptMNPS } from "@/lib/adapters/report-adapter";
import UnifiedReportCard from "@/components/report/UnifiedReportCard";
import type { UnifiedReportData } from "@/types/report";

async function fetchResult(assessmentId?: string | null) {
  if (assessmentId) {
    try {
      const response = await fetch(`/api/mnps/results?assessmentId=${assessmentId}`);
      const data = await response.json();
      if (data.success && data.result) {
        const r = data.result;
        const traitScores =
          r.traitScores && typeof r.traitScores === "object"
            ? r.traitScores
            : Array.isArray(r.radarChartData) && r.radarChartData.length >= 4
            ? {
                machiavellianism: Number(r.radarChartData[0]?.value) || 0,
                narcissism: Number(r.radarChartData[1]?.value) || 0,
                psychopathy: Number(r.radarChartData[2]?.value) || 0,
                sadism: Number(r.radarChartData[3]?.value) || 0,
              }
            : {};
        return {
          archetype: r.archetype,
          result: {
            traitScores,
            dTotal: r.dTotal ?? 0,
          },
        };
      }
    } catch (error) {
      console.error("MNPS 서버 결과 요청 실패:", error);
    }
    return null;
  }

  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem("darkNatureResult");
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        archetype: parsed.archetype,
        result: {
          traitScores: parsed.result?.traitScores ?? {},
          dTotal: parsed.result?.dTotal ?? 0,
        },
      };
    }
  }

  return null;
}

export default function MnpsResultClient() {
  const [reportData, setReportData] = useState<UnifiedReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const params = new URLSearchParams(window.location.search);
      const assessmentId = params.get("assessmentId");
      const data = await fetchResult(assessmentId);
      if (!data) {
        setError("결과를 불러올 수 없습니다.");
        setLoading(false);
        return;
      }
      setReportData(
        adaptMNPS({
          archetype: data.archetype,
          dTotal: data.result.dTotal,
          traitScores: data.result.traitScores,
        })
      );
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">결과를 불러오는 중입니다...</p>
      </main>
    );
  }

  if (error || !reportData) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4 px-6 text-center">
        <p className="text-red-400">{error ?? "결과를 찾을 수 없습니다."}</p>
        <Link href="/mnps/test" className="report-btn-secondary">
          테스트 다시 시작
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <UnifiedReportCard data={reportData} />
        <div className="report-actions">
          <Link href="/mnps/test" className="report-btn-secondary">
            재검사
          </Link>
          <Link href="/growth-roadmap" className="report-btn-primary">
            마인드 아키텍터 이동
          </Link>
        </div>
      </div>
    </main>
  );
}
