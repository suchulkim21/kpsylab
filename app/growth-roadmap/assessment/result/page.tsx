"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { calculateGapAnalysis, GapAnalysisResult } from "@growth-roadmap/lib/analysis";
import { getDimName, getResultVariantIndex, getStrategyDetail, getStrategyActions, DIMENSION_TIPS, getDimensionTip } from "@growth-roadmap/lib/content/resultContent";
import { generateModule3Items } from "@growth-roadmap/lib/content/module3";

const STRATEGY_LABEL: Record<string, string> = {
  Alignment: "일치",
  Expansion: "확장",
  Correction: "보정",
  Pivot: "전환",
};

/** **bold** 구간을 <strong>으로 렌더링 */
function renderWithBold(text: string, keyPrefix: string) {
  const parts: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  const re = /\*\*(.*?)\*\*/g;
  let match;
  let i = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={`${keyPrefix}-b-${i}`} className="text-white font-semibold">{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
    i += 1;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : <>{parts}</>;
}

export default function AssessmentResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<GapAnalysisResult | null>(null);
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
      const analysis = calculateGapAnalysis(parsed.ideal ?? {}, parsed.potential ?? {});
      setResult(analysis);
    } catch (err) {
      console.error("Module3 parsing error", err);
      setError("결과를 불러오는 중 오류가 발생했습니다.");
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

  if (!result) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>분석 결과를 불러오는 중입니다...</p>
      </div>
    );
  }

  const strategyLabel = STRATEGY_LABEL[result.strategy] ?? result.strategy;
  const dimGap = getDimName(result.dimensions.dominantGap);
  const dimStrong = getDimName(result.dimensions.strongestPotential);
  const variantIndex = getResultVariantIndex(result);

  const m3Data = {
    ideal: result.ideal,
    potential: result.potential,
    strategy: result.strategy,
    dominantGap: result.dimensions.dominantGap,
    strongestPotential: result.dimensions.strongestPotential,
  };
  const reportItems = generateModule3Items(m3Data);
  const gapTips = DIMENSION_TIPS[result.dimensions.dominantGap];
  const strongTips = DIMENSION_TIPS[result.dimensions.strongestPotential];

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 relative overflow-hidden">
      <div className="mind-architect-bg-gradient" />
      <div className="mind-architect-bg-line" />
      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        <header className="text-center">
          <span className="text-gray-400 font-mono text-xs tracking-widest border border-gray-800 bg-gray-900/50 px-3 py-1 rounded-full mb-4 inline-block">
            3단계 완료
          </span>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-100">
            이상향·잠재력 분석 리포트
          </h1>
          <p className="text-gray-400 text-sm">
            아래는 요약과 심층 분석입니다. 질의 1·2와 통합된 종합 조언은 최종 리포트에서 확인하세요.
          </p>
        </header>

        {/* 요약 카드 */}
        <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-gray-400 text-sm">전략</span>
            <span className="font-bold text-purple-300">{strategyLabel}</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-gray-400 text-sm">이상향 대비 정렬</span>
            <span className="font-bold text-white">{result.alignmentScore}%</span>
          </div>
          <p className="text-gray-300 text-sm pt-2 border-t border-gray-800">
            격차가 큰 영역: <strong className="text-white">{dimGap}</strong>
            <br />
            현재 강점 영역: <strong className="text-white">{dimStrong}</strong>
          </p>
        </div>

        {/* 심층 분석 리포트: M3 블록 */}
        {reportItems.map((item, idx) => {
          const icons = ["🎯", "💎", "📐", "📊", "🗺️"];
          const icon = icons[idx] ?? "📋";
          return (
            <div key={item.id} className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                {item.title}
              </h2>
              <div className="text-gray-300 text-sm leading-relaxed space-y-3">
                {item.content.split("\n").filter((line) => line.trim()).map((line, i) => (
                  <p key={i}>{renderWithBold(line.trim(), `${item.id}-${i}`)}</p>
                ))}
              </div>
            </div>
          );
        })}

        {/* 전략 요약 */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
          <h3 className="text-base font-semibold text-white mb-3">전략 요약</h3>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
            {getStrategyDetail(result.strategy, variantIndex).split(/(\*\*.*?\*\*)/g).map((seg, i) =>
              /^\*\*.*\*\*$/.test(seg) ? (
                <strong key={i} className="text-white font-semibold">{seg.replace(/\*\*/g, "")}</strong>
              ) : (
                <span key={i}>{seg}</span>
              )
            )}
          </p>
        </div>

        {/* 실행 권고 */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
          <h3 className="text-base font-semibold text-white mb-3">실행 권고</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
            {getStrategyActions(result.strategy, variantIndex).map((action, i) => (
              <li key={i}>{action}</li>
            ))}
          </ul>
        </div>

        {/* 성장 조언: 괴리·강점 차원 */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 space-y-4">
          <h3 className="text-base font-semibold text-white">성장 조언</h3>
          <p className="text-gray-300 text-sm">{result.causeExplanation}</p>
          {gapTips && (
            <>
              <div>
                <h4 className="text-sm font-semibold text-purple-300 mb-1">성장 방안 — {dimGap} 영역</h4>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-0.5">
                  {gapTips.improve.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-purple-300 mb-1">피해야 할 행동</h4>
                <ul className="list-disc list-inside text-gray-300 text-sm space-y-0.5">
                  {gapTips.avoid.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
          {strongTips && (
            <div>
              <h4 className="text-sm font-semibold text-purple-300 mb-1">강점 활용 — {dimStrong} 영역</h4>
              <p className="text-gray-300 text-sm">
                {getDimensionTip(result.dimensions.strongestPotential, variantIndex, "leverage") ||
                  strongTips.leverage?.[0] ||
                  "해당 영역의 강점을 이상향 달성에 연결해 보십시오."}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/growth-roadmap/assessment" className="report-btn-secondary text-center">
            질의 3 재검사
          </Link>
          <Link href="/growth-roadmap/report" className="report-btn-primary text-center">
            최종 결과 분석 보기 →
          </Link>
        </div>
        <p className="text-center text-gray-400 text-xs">
          위는 질의 3 분석 결과입니다. 질의 1·2·3 종합과 이상향 달성 조언은 &quot;최종 결과 분석 보기&quot;에서 확인할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
