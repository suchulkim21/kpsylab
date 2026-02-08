"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { determineTypeCode, getKoreanTypeName, getModule2Content, getModule2SystemSummary } from "@growth-roadmap/lib/content/module2";
import type { ResultItem } from "@growth-roadmap/lib/content/module2";
import { renderWithBold } from "@growth-roadmap/lib/utils/reportRender";
import { isDirty, clearDirty, updateM2Global } from "@/lib/store/userGlobalVector";

const normalizeSegment = (value: number) =>
  Math.max(0, Math.min(100, Math.round(((value + 40) / 140) * 100)));

function groupByCategory(items: ResultItem[]): { category: string; items: ResultItem[] }[] {
  const map = new Map<string, ResultItem[]>();
  const order = ["심층 분석", "인지 프로세스", "행동 패턴", "사회적 역동"];
  items.forEach((item) => {
    const list = map.get(item.category) ?? [];
    list.push(item);
    map.set(item.category, list);
  });
  return order.filter((c) => map.has(c)).map((category) => ({ category, items: map.get(category)! }));
}

function Module2ResultInner() {
  const searchParams = useSearchParams();
  const flowUnified = searchParams.get("flow") === "unified";
  const [typeCode, setTypeCode] = useState<string | null>(null);
  const [typeName, setTypeName] = useState<string | null>(null);
  const [scores, setScores] = useState<{ input: number; processing: number; output: number } | null>(null);
  const [reportItems, setReportItems] = useState<ResultItem[]>([]);
  const [systemSummary, setSystemSummary] = useState<string>("");
  const [solutionItems, setSolutionItems] = useState<ResultItem[]>([]);
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
      const raw =
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
        proactivity: normalizeSegment(raw.proactivity ?? 0),
        adaptability: normalizeSegment(raw.adaptability ?? 0),
        socialDistance: normalizeSegment(raw.socialDistance ?? 0),
      };

      const code = determineTypeCode({
        p: normalized.proactivity,
        a: normalized.adaptability,
        sd: normalized.socialDistance,
      });
      const name = getKoreanTypeName(code);
      const items = getModule2Content(code);
      const summary = getModule2SystemSummary(code);
      const solutions = items.filter((i) => i.category === "임상 솔루션");

      setTypeCode(code);
      setTypeName(name);
      setScores({
        input: normalized.proactivity,
        processing: normalized.adaptability,
        output: normalized.socialDistance,
      });
      setReportItems(items);
      setSystemSummary(summary);
      setSolutionItems(solutions);

      updateM2Global({
        typeCode: code,
        scores: { p: normalized.proactivity, a: normalized.adaptability, sd: normalized.socialDistance },
      });
      setShowRetestBanner(isDirty("m2"));
      if (isDirty("m2")) clearDirty("m2");
    } catch (err) {
      console.error("Module2 result parsing failed", err);
      setError("결과를 해석하는 동안 오류가 발생했습니다.");
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

  if (!typeCode || !typeName) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>분석 결과를 불러오는 중입니다...</p>
      </div>
    );
  }

  const grouped = groupByCategory(reportItems);

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 relative overflow-hidden">
      <div className="mind-architect-bg-gradient" />
      <div className="mind-architect-bg-line" />
      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        {showRetestBanner && (
          <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5 text-blue-200 text-sm">
            M1 재검사로 인해 관점이 갱신되었을 수 있습니다. 통합 리포트에서 최신 결과를 확인하세요.
          </div>
        )}

        <header className="text-center">
          <span className="text-gray-400 font-mono text-xs tracking-widest border border-gray-800 bg-gray-900/50 px-3 py-1 rounded-full mb-4 inline-block">
            2단계 완료
          </span>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-100">
            질의 2 분석 리포트
          </h1>
          <p className="text-gray-400 text-sm">
            대인·행동 패턴과 사회적 아키텍처 요약입니다. 질의 1·3과 통합된 종합 조언은 최종 리포트에서 확인하세요.
          </p>
        </header>

        {/* 요약 카드 */}
        <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-gray-400 text-sm">사회적 아키타입</span>
            <span className="font-bold text-purple-300">{typeName}</span>
          </div>
          {scores && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-800">
              <div>
                <span className="text-gray-400 text-xs block">입력</span>
                <span className="text-white font-medium">{scores.input}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs block">처리</span>
                <span className="text-white font-medium">{scores.processing}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs block">출력</span>
                <span className="text-white font-medium">{scores.output}</span>
              </div>
            </div>
          )}
        </div>

        {/* 시스템 요약 한 줄 */}
        {systemSummary && (
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
            <p className="text-gray-300 text-sm leading-relaxed">{systemSummary}</p>
          </div>
        )}

        {/* 심층 분석 리포트 (카테고리별 섹션) */}
        {grouped.map(({ category, items: catItems }, gi) => {
          const icons: Record<string, string> = { "심층 분석": "🔍", "인지 프로세스": "🧠", "행동 패턴": "⚡", "사회적 역동": "🤝" };
          const icon = icons[category] ?? "📋";
          return (
            <div key={category} className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 space-y-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                {category}
              </h2>
              <div className="space-y-5">
                {catItems.map((item, ci) => (
                  <div key={item.id}>
                    {ci > 0 && <hr className="border-gray-800 mb-5" />}
                    <h4 className="text-sm font-semibold text-purple-300 mb-2">{item.title}</h4>
                    <div className="text-gray-300 text-sm leading-relaxed space-y-2">
                      {item.content.split("\n").filter((l) => l.trim()).map((line, i) => (
                        <p key={i}>{renderWithBold(line.trim(), `${item.id}-${i}`)}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* 실행 권고 (임상 솔루션) */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
          <h3 className="text-base font-semibold text-white mb-3">실행 권고</h3>
          <ul className="space-y-2">
            {solutionItems.map((item) => (
              <li key={item.id} className="text-gray-300 text-sm">
                <span className="font-medium text-purple-300">{item.title}:</span> {item.content}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/growth-roadmap/module2" className="report-btn-secondary text-center">
            재검사
          </Link>
          <Link
            href={flowUnified ? "/growth-roadmap/run" : "/growth-roadmap/assessment"}
            className="report-btn-primary text-center"
          >
            {flowUnified ? "다음: 3단계로" : "다음 단계로 이동"} →
          </Link>
        </div>
        <p className="text-center text-gray-400 text-xs">
          최종 리포트에서 질의 1·2·3 종합과 이상향 달성 조언을 확인할 수 있습니다.
        </p>
      </div>
    </div>
  );
}

export default function Module2ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <p>페이지를 불러오는 중입니다...</p>
        </div>
      }
    >
      <Module2ResultInner />
    </Suspense>
  );
}
