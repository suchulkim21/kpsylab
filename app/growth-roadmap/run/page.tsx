"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Activity, Brain, BarChart3, Sparkles } from "lucide-react";

type Step = 1 | 2 | 3 | "report";

export default function RunPage() {
    const [step, setStep] = useState<Step>(1);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const m1 = localStorage.getItem("sg_module1_result");
        const m2 = localStorage.getItem("sg_module2_result");
        const m3 = localStorage.getItem("sg_module3_result");

        let m1Done = false;
        let m2Done = false;
        let m3Done = false;

        if (m1) {
            try {
                const p = JSON.parse(m1);
                if (p?.shadowData?.length || p?.dominantType) m1Done = true;
            } catch {}
        }
        if (m2) {
            try {
                const p = JSON.parse(m2);
                if (p?.analysis || p?.scores) m2Done = true;
            } catch {}
        }
        if (m3) {
            try {
                const p = JSON.parse(m3);
                if (p?.ideal && p?.potential) m3Done = true;
            } catch {}
        }

        if (m1Done && m2Done && m3Done) setStep("report");
        else if (m1Done && m2Done) setStep(3);
        else if (m1Done) setStep(2);
        else setStep(1);
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p className="text-gray-400 font-mono">로딩 중...</p>
            </div>
        );
    }

    const progressPercent = step === "report" ? 100 : step === 3 ? 66 : step === 2 ? 33 : 0;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="mind-architect-bg-gradient" />
            <div className="mind-architect-bg-line" />
            <div className="z-10 text-center max-w-xl w-full relative">
                <div className="mb-6">
                    <span className="mind-architect-badge text-purple-400 border-purple-500/40 bg-purple-950/40">
                        통합 진행
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-gray-100">
                    마인드 아키텍터
                </h1>
                <p className="text-gray-400 text-base mb-8 max-w-lg mx-auto">
                    한 번에 1→2→3단계를 이어서 진행하고, 최종 통합 리포트를 확인하세요.
                </p>

                <div className="mb-8 max-w-md mx-auto">
                    <div className="flex justify-between items-center mb-2 text-sm">
                        <span className="text-gray-400 font-mono">진행률</span>
                        <span className="font-bold text-purple-400">{progressPercent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {step === 1 && (
                    <Link
                        href="/growth-roadmap/module1?flow=unified"
                        className="mind-architect-btn-primary w-full max-w-sm mx-auto"
                    >
                        <Activity className="w-5 h-5" />
                        1단계: 무의식 방해 요인 분석 시작
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                )}
                {step === 2 && (
                    <Link
                        href="/growth-roadmap/module2?flow=unified"
                        className="mind-architect-btn-primary w-full max-w-sm mx-auto"
                    >
                        <Brain className="w-5 h-5" />
                        2단계: 대인 관계 및 행동 분석 시작
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                )}
                {step === 3 && (
                    <Link
                        href="/growth-roadmap/assessment?flow=unified"
                        className="mind-architect-btn-primary w-full max-w-sm mx-auto"
                    >
                        <BarChart3 className="w-5 h-5" />
                        3단계: 이상향과 잠재력 분석 시작
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                )}
                {step === "report" && (
                    <Link
                        href="/growth-roadmap/report"
                        className="mind-architect-btn-primary w-full max-w-sm mx-auto"
                    >
                        <Sparkles className="w-5 h-5" />
                        통합 리포트 보기
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                )}

                <p className="mt-6 text-gray-400 text-sm">
                    <Link href="/growth-roadmap" className="underline underline-offset-2 hover:text-gray-400">
                        대시보드로 돌아가기
                    </Link>
                </p>
            </div>
        </div>
    );
}
