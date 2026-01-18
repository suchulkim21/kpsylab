"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import ScenarioTester from "@second-genesis/components/module2/ScenarioTester";

export default function Module2Page() {
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

                <div className="max-w-2xl w-full text-center z-10 animate-fade-in-up">
                    <div className="mb-10">
                        <div className="text-blue-500 font-mono text-sm tracking-widest border border-blue-900/50 bg-blue-900/10 px-3 py-1 rounded-full mb-4 inline-block">
                            MODULE 02
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">대인 관계 및 행동</h1>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-lg mx-auto">
                            현실적인 시나리오 시뮬레이션을 통해 당신의 행동 패턴과 의사결정 스타일을 진단합니다.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={startTest}
                            className="px-10 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] text-lg"
                        >
                            {hasResult ? '다시 분석하기' : '분석 시작하기'}
                        </button>

                        {hasResult && (
                            <Link href="/second-genesis/module2/result">
                                <div className="px-10 py-4 border border-gray-600 text-gray-300 font-bold rounded-full hover:bg-gray-800 transition-colors text-lg cursor-pointer">
                                    이전 결과 보기
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
                {/* Background Ambience */}
                <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
            </div>
        );
    }

    // Render the actual test component
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
            {/* Home Button for Consistency, though ScenarioTester might implement its own layout, let's keep it clean.
                ScenarioTester has its own structure.
             */}
            <Link href="/" className="absolute top-4 left-4 p-2 text-gray-500 hover:text-white transition-colors z-50 hover:bg-white/10 rounded-full">
                <Home size={24} />
            </Link>
            <ScenarioTester />
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black -z-10"></div>
        </div>
    );
}
