"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SCENARIOS_15 } from "@growth-roadmap/data/module2/scenarios";
import { MODULE2_SCENARIO_TOTAL, MODULE2_SCENARIO_PER_PHASE } from "@growth-roadmap/lib/constants";
import { ScenarioOption } from "@growth-roadmap/types/module2";

type ScenarioTesterProps = { resultPath?: string };

/** 질의 1·3과 동일: 시나리오 15문항 한 번에 진행, 중간 단계 없음 */
export default function ScenarioTester({ resultPath }: ScenarioTesterProps) {
    const router = useRouter();
    const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
    const [selections, setSelections] = useState<ScenarioOption[]>([]);

    const scenariosPool = SCENARIOS_15;
    const currentScenario = scenariosPool[currentScenarioIdx];
    const progress = Math.round(((currentScenarioIdx + 1) / MODULE2_SCENARIO_TOTAL) * 100);

    const handleOptionSelect = (option: ScenarioOption) => {
        const newSelections = [...selections, option];

        if (currentScenarioIdx < MODULE2_SCENARIO_TOTAL - 1) {
            setSelections(newSelections);
            setCurrentScenarioIdx((prev) => prev + 1);
        } else {
            // 분석에 필요한 문항 수만큼 완료 → 저장 후 결과 페이지로
            const phase1Selections = newSelections.slice(0, MODULE2_SCENARIO_PER_PHASE);
            const phase2Selections = newSelections.slice(MODULE2_SCENARIO_PER_PHASE, MODULE2_SCENARIO_PER_PHASE * 2);
            const phase3Selections = newSelections.slice(MODULE2_SCENARIO_PER_PHASE * 2, MODULE2_SCENARIO_TOTAL);
            const phaseSelections = { phase1: phase1Selections, phase2: phase2Selections, phase3: phase3Selections };

            import("@growth-roadmap/lib/module2/consistencyCheck").then(({ checkAnswerConsistency }) => {
                const consistencyResult = checkAnswerConsistency(newSelections, phaseSelections);
                const totalScores = { proactivity: 0, adaptability: 0, socialDistance: 0 };
                newSelections.forEach((opt) => {
                    if (opt.weight.proactivity) totalScores.proactivity += opt.weight.proactivity;
                    if (opt.weight.adaptability) totalScores.adaptability += opt.weight.adaptability;
                    if (opt.weight.socialDistance) totalScores.socialDistance += opt.weight.socialDistance;
                });
                const resultData = {
                    timestamp: new Date().toISOString(),
                    analysis: totalScores,
                    scores: totalScores,
                    rawSelections: newSelections,
                    consistency: consistencyResult,
                    phaseSelections,
                };
                localStorage.setItem("sg_module2_result", JSON.stringify(resultData));
                fetch("/api/analytics/service-usage", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ serviceName: "mind-architect-m2", actionType: "complete" }),
                }).catch(() => {});
                router.push(resultPath ?? "/growth-roadmap/module2/result");
            });
        }
    };

    if (!currentScenario) {
        return <div className="text-gray-400 font-mono p-4">로딩 중...</div>;
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-4 z-10 relative animate-fade-in-up">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-xl font-bold text-gray-100">시나리오 분석</h2>
                    <p className="text-xs text-gray-400 font-mono mt-1">대인 관계 및 행동</p>
                </div>
                <div className="text-right">
                    <span className="text-sm text-purple-400 font-mono block">
                        시나리오 {currentScenarioIdx + 1} / {MODULE2_SCENARIO_TOTAL}
                    </span>
                    <div className="text-2xl font-bold font-mono text-gray-400 mt-1">{progress}%</div>
                </div>
            </div>
            <div className="h-2 rounded-full bg-gray-800 overflow-hidden mb-10">
                <div
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="glass-panel p-8 md:p-10 rounded-xl mb-8 min-h-[180px]">
                <p className="text-lg md:text-xl text-white mb-8 leading-relaxed font-medium">
                    {currentScenario.situation}
                </p>
                <div className="grid gap-4">
                    {currentScenario.options?.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => handleOptionSelect(opt)}
                            className="w-full p-5 text-left rounded-xl border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 hover:border-purple-500/40 transition-all cursor-pointer"
                        >
                            <span className="text-base">{opt.text}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
