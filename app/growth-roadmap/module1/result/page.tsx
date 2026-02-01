"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { analyzeInterference } from "@growth-roadmap/lib/module1/analysisEngine";
import { adaptModule1 } from "@/lib/adapters/report-adapter";
import UnifiedReportCard from "@/components/report/UnifiedReportCard";
import { getGlobalProfile } from "@/lib/store/userGlobalVector";
import { getEvolutionBannerText } from "@/lib/services/consistencyAuditor";
import { determineTypeCode } from "@growth-roadmap/lib/content/module2";
import { projectM1ToLatent } from "@/lib/store/masterVector";
import { generateVisualInsight } from "@/lib/services/visualInsightEngine";
import PsychologicalTrajectoryVisual from "@/components/report/PsychologicalTrajectoryVisual";
import type { UnifiedReportData } from "@/types/report";

export default function Module1ResultPage() {
    const router = useRouter();
    const [reportData, setReportData] = useState<UnifiedReportData | null>(null);
    const [evolutionBanner, setEvolutionBanner] = useState<string | null>(null);
    const [visualInsight, setVisualInsight] = useState<ReturnType<typeof generateVisualInsight> | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("sg_module1_result");
        if (stored) {
            try {
                const raw = JSON.parse(stored);
                // Legacy: shadowData만 있으면 analyzeInterference로 계산
                let dominantType = raw.dominantType;
                let vector = raw.vector;
                const dataArray = Array.isArray(raw) ? raw : (raw.shadowData || []);
                if (Array.isArray(dataArray) && dataArray.length > 0 && (!vector || !dominantType)) {
                    const analysis = analyzeInterference(dataArray.map((x: any) => typeof x === "string" ? x : x?.id).filter(Boolean));
                    vector = vector ?? analysis.vector;
                    dominantType = dominantType ?? analysis.dominantType;
                }
                const profile = getGlobalProfile();
                let m2Data: { typeCode: string; scores: { p: number; a: number; sd: number } } | undefined;
                if (profile.m2?.typeCode && profile.m2?.scores) {
                  m2Data = { typeCode: profile.m2.typeCode, scores: profile.m2.scores };
                } else {
                  const m2Raw = typeof window !== "undefined" ? localStorage.getItem("sg_module2_result") : null;
                  if (m2Raw) {
                    try {
                      const m2Parsed = JSON.parse(m2Raw);
                      const s = m2Parsed.analysis ?? m2Parsed.scores ?? {};
                      const norm = (v: number) => Math.max(0, Math.min(100, Math.round(((v + 40) / 140) * 100)));
                      const p = norm(s.proactivity ?? 0), a = norm(s.adaptability ?? 0), sd = norm(s.socialDistance ?? 0);
                      m2Data = { typeCode: determineTypeCode({ p, a, sd }), scores: { p, a, sd } };
                    } catch {}
                  }
                }
                const ctx = profile.m1
                  ? {
                      masterVector: profile.master_vector,
                      m2Data,
                      consistencyScore: profile.consistency_score,
                      anomaly: profile.anomaly,
                      dynamicsNarrative: profile.anomalyNarrative,
                      m1: profile.m1,
                      m2: profile.m2 ? { typeCode: profile.m2.typeCode, timestamp: profile.m2.timestamp as string } : undefined,
                      m3: profile.m3 ? { timestamp: profile.m3.timestamp as string } : undefined,
                      moduleHistory: profile.module_history,
                    }
                  : undefined;
                const adapted = adaptModule1({ dominantType, vector }, ctx);
                setReportData(adapted);
                setEvolutionBanner(getEvolutionBannerText(profile));
                if (profile.anomaly && profile.module_history?.length) {
                  const lastM1 = profile.module_history.filter((e: any) => e.moduleId === "Module_1").pop();
                  const prevVec = lastM1?.result?.vector;
                  if (prevVec) {
                    const vPrev = projectM1ToLatent(prevVec);
                    const vCurr = projectM1ToLatent(vector ?? {});
                    setVisualInsight(generateVisualInsight({ vectors: { prev: vPrev, curr: vCurr } }));
                  }
                }
            } catch (e) {
                console.error("Result parsing failed", e);
                router.push("/growth-roadmap/module1");
            }
        } else {
            router.push("/growth-roadmap/module1");
        }
    }, [router]);

    if (!reportData)
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">
                분석 결과 처리 중...
            </div>
        );

    return (
        <div className="min-h-screen bg-black text-white p-6 animate-fade-in-up relative overflow-hidden font-sans">
            <div className="max-w-4xl mx-auto pt-10 pb-20 relative z-10">
                {evolutionBanner && (
                    <div className="mb-6 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 text-amber-200 text-sm">
                        {evolutionBanner}
                    </div>
                )}
                {visualInsight && (
                    <div className="mb-6">
                        <PsychologicalTrajectoryVisual data={visualInsight} preferSvg={true} />
                    </div>
                )}
                <UnifiedReportCard data={reportData} />

                <div className="report-actions">
                    <Link href="/growth-roadmap/module1" className="report-btn-secondary">
                        재검사
                    </Link>
                    <Link href="/growth-roadmap/module2" className="report-btn-primary flex items-center gap-2">
                        다음 단계로 이동 <span className="text-xs">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
