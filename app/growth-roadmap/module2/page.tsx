"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Home } from "lucide-react";
import ScenarioTester from "@growth-roadmap/components/module2/ScenarioTester";

function Module2PageInner() {
    const searchParams = useSearchParams();
    const flowUnified = searchParams.get("flow") === "unified";
    const [viewState, setViewState] = useState<'intro' | 'test'>('intro');
    const [hasResult, setHasResult] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('sg_module2_result');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Validation: Check for 'analysis' OR 'rawAnalysis'
                if (parsed && (parsed.analysis || parsed.rawAnalysis)) {
                    setHasResult(true);
                } else {
                    console.warn("Found sg_module2_result but it lacks analysis/rawAnalysis data.");
                    setHasResult(false);
                }
            } catch (e) {
                console.error("Failed to parse stored result", e);
                setHasResult(false);
            }
        }
    }, []);

    const startTest = () => {
        setViewState('test');
    };

    if (viewState === 'intro') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="mind-architect-bg-gradient" />
                <div className="mind-architect-bg-line" />
                <div className="max-w-2xl w-full text-center z-10 relative animate-fade-in-up">
                    <div className="mb-10">
                        <div className="mind-architect-badge text-blue-400 border-blue-500/40 bg-blue-950/30 mb-4">
                            MODULE 02
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-gray-100">대인 관계 및 행동</h1>
                        <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
                            현실적인 시나리오 시뮬레이션을 통해 당신의 행동 패턴과 의사결정 스타일을 탐색합니다.
                        </p>
                        <p className="text-gray-400 text-xs italic max-w-lg mx-auto mt-4">
                            이 결과는 당신의 정답이 아닌, 참고할 수 있는 정교한 한 장의 지도입니다.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button onClick={startTest} className="mind-architect-btn-primary">
                            {hasResult ? "다시 분석하기" : "분석 시작하기"}
                        </button>
                        {hasResult && (
                            <Link href="/growth-roadmap/module2/result" className="mind-architect-btn-secondary">
                                이전 결과 보기
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Render the actual test component
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
            <div className="mind-architect-bg-gradient" />
            <div className="mind-architect-bg-line" />
            <Link href="/growth-roadmap" className="absolute top-4 left-4 p-2 text-gray-500 hover:text-white transition-colors z-50 hover:bg-white/10 rounded-full">
                <Home size={24} />
            </Link>
            <ScenarioTester resultPath={flowUnified ? "/growth-roadmap/module2/result?flow=unified" : undefined} />
        </div>
    );
}

export default function Module2Page() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-black text-white flex items-center justify-center">
                    <p>페이지를 불러오는 중입니다...</p>
                </div>
            }
        >
            <Module2PageInner />
        </Suspense>
    );
}
