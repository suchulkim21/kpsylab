"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { analyzeInterference } from "@growth-roadmap/lib/module1/analysisEngine";
import { generateSynthesizedItems } from "@growth-roadmap/lib/content/module1";
import { MODULE1_TEMPLATES } from "@/lib/constants/report-templates";
import { renderWithBold } from "@growth-roadmap/lib/utils/reportRender";
import { getGlobalProfile } from "@/lib/store/userGlobalVector";
import { getEvolutionBannerText } from "@/lib/services/consistencyAuditor";
import { projectM1ToLatent } from "@/lib/store/masterVector";
import { generateVisualInsight } from "@/lib/services/visualInsightEngine";
import PsychologicalTrajectoryVisual from "@/components/report/PsychologicalTrajectoryVisual";

const TYPE_LABEL: Record<string, string> = {
  A: "성취 지향",
  B: "내면 결핍",
  C: "감정 회피",
  D: "현실 도피",
};

function Module1ResultInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flowUnified = searchParams.get("flow") === "unified";
  const [dominantType, setDominantType] = useState<string | null>(null);
  const [vector, setVector] = useState<Record<string, string> | null>(null);
  const [evolutionBanner, setEvolutionBanner] = useState<string | null>(null);
  const [visualInsight, setVisualInsight] = useState<ReturnType<typeof generateVisualInsight> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisTimestamp, setAnalysisTimestamp] = useState<string | null>(null);
  const [responseCount, setResponseCount] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("sg_module1_result");
    if (!stored) {
      setError("저장된 분석 결과가 없습니다.");
      router.push("/growth-roadmap/module1");
      return;
    }
    try {
      const raw = JSON.parse(stored);
      const dataArray = Array.isArray(raw) ? raw : (raw.shadowData || []);
      const ids = (Array.isArray(dataArray) ? dataArray : []).map((x: unknown) => (typeof x === "string" ? x : (x as { id?: string })?.id)).filter((id: unknown): id is string => typeof id === "string");
      // shadowData가 있으면 항상 재계산하여 저장된 값 오류/구버전 형식에 영향받지 않도록 함
      let type: string;
      let vec: Record<string, string>;
      if (ids.length > 0) {
        const analysis = analyzeInterference(ids);
        type = analysis.dominantType;
        vec = analysis.vector as Record<string, string>;
      } else {
        type = raw.dominantType ?? "A";
        vec = (raw.vector ?? {}) as Record<string, string>;
      }
      setDominantType(type);
      setVector(vec);
      setAnalysisTimestamp(raw.timestamp ?? null);
      setResponseCount(ids.length > 0 ? ids.length : null);

      const profile = getGlobalProfile();
      setEvolutionBanner(getEvolutionBannerText(profile));
      if (profile.anomaly && profile.module_history?.length) {
        const lastM1 = profile.module_history.filter((e: { moduleId?: string }) => e.moduleId === "Module_1").pop();
        const prevVec = lastM1?.result?.vector;
        if (prevVec && typeof prevVec === "object" && !Array.isArray(prevVec)) {
          const vPrev = projectM1ToLatent(prevVec as Record<string, number | string>);
          const vCurr = projectM1ToLatent((vec ?? {}) as Record<string, number | string>);
          setVisualInsight(generateVisualInsight({ vectors: { prev: vPrev, curr: vCurr } }));
        }
      }
    } catch (e) {
      console.error("Module1 result parsing failed", e);
      setError("결과를 해석하는 동안 오류가 발생했습니다.");
      router.push("/growth-roadmap/module1");
    }
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center px-4">
        <p className="text-red-400 text-lg font-semibold mb-3">{error}</p>
        <Link href="/growth-roadmap/module1" className="report-btn-secondary">
          재검사
        </Link>
      </div>
    );
  }

  if (!dominantType) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>분석 결과를 불러오는 중입니다...</p>
      </div>
    );
  }

  const typeKey = dominantType.toUpperCase() as keyof typeof TYPE_LABEL;
  const template = MODULE1_TEMPLATES[typeKey] ?? MODULE1_TEMPLATES.A;
  const typeLabel = TYPE_LABEL[typeKey] ?? template.title;
  const reportItems = generateSynthesizedItems(dominantType);
  const topScore = vector ? Object.entries(vector).sort(([, a], [, b]) => parseFloat(String(b)) - parseFloat(String(a)))[0] : null;
  const scorePercent = topScore ? Math.round(parseFloat(String(topScore[1])) * 100) : null;

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 relative overflow-hidden">
      <div className="mind-architect-bg-gradient" />
      <div className="mind-architect-bg-line" />
      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        {evolutionBanner && (
          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 text-amber-200 text-sm">
            {evolutionBanner}
          </div>
        )}
        {visualInsight && (
          <div>
            <PsychologicalTrajectoryVisual data={visualInsight} preferSvg={true} />
          </div>
        )}

        <header className="text-center">
          <span className="text-gray-400 font-mono text-xs tracking-widest border border-gray-800 bg-gray-900/50 px-3 py-1 rounded-full mb-4 inline-block">
            1단계 완료
          </span>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-100">
            질의 1 분석 리포트
          </h1>
          <p className="text-gray-400 text-sm">
            무의식 병목과 심층 구조 요약입니다. 질의 2·3과 통합된 종합 조언은 최종 리포트에서 확인하세요.
          </p>
          {(analysisTimestamp != null || responseCount != null) && (
            <p className="text-gray-400 text-xs mt-2">
              {analysisTimestamp != null && (
                <>분석 일시: {new Date(analysisTimestamp).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</>
              )}
              {responseCount != null && (
                <>{analysisTimestamp != null && " · "}응답 {responseCount}문항 기준</>
              )}
            </p>
          )}
        </header>

        {/* 요약 카드 */}
        <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-gray-400 text-sm">주요 방해 요인</span>
            <span className="font-bold text-purple-300">{typeLabel}</span>
          </div>
          <p className="text-gray-300 text-sm">
            {template.title}
          </p>
          {scorePercent != null && (
            <p className="text-gray-300 text-xs">
              해당 축 비중 약 {scorePercent}%
            </p>
          )}
        </div>

        {/* 심층 분석 리포트 */}
        {reportItems.map((item, idx) => {
          const icons = ["🔍", "🧠", "⚡", "⚠️", "💡", "🚧"];
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

        {/* 실행 가이드 */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
          <h3 className="text-base font-semibold text-white mb-3">실행 가이드</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
            {(template.actionPlan ?? []).map((action, i) => (
              <li key={i}>{action}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/growth-roadmap/module1" className="report-btn-secondary text-center">
            재검사
          </Link>
          <Link
            href={flowUnified ? "/growth-roadmap/run" : "/growth-roadmap/module2"}
            className="report-btn-primary text-center"
          >
            {flowUnified ? "다음: 2단계로" : "다음 단계로 이동"} →
          </Link>
        </div>
        <p className="text-center text-gray-400 text-xs">
          최종 리포트에서 질의 1·2·3 종합과 이상향 달성 조언을 확인할 수 있습니다.
        </p>
      </div>
    </div>
  );
}

export default function Module1ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <p>페이지를 불러오는 중입니다...</p>
        </div>
      }
    >
      <Module1ResultInner />
    </Suspense>
  );
}
