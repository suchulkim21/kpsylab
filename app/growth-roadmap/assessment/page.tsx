"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnalysisVector } from "@growth-roadmap/lib/analysis";
import { idealMin8, potentialMin10, Question, Option } from "@growth-roadmap/data/module3/questions";
import { MODULE3_QUESTION_TOTAL, MODULE3_IDEAL_QUESTION_COUNT, MODULE3_POTENTIAL_QUESTION_COUNT } from "@growth-roadmap/lib/constants";

const initialVector: AnalysisVector = { stability: 0, growth: 0, relation: 0, autonomy: 0 };

function AssessmentPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const flowUnified = searchParams.get("flow") === "unified";

    const [viewState, setViewState] = useState<'intro' | 'test'>('intro');
    const [hasResult, setHasResult] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [scores, setScores] = useState<{ ideal: AnalysisVector; potential: AnalysisVector }>({
        ideal: { ...initialVector },
        potential: { ...initialVector }
    });

    useEffect(() => {
        const stored = localStorage.getItem('sg_module3_result');
        if (stored) {
            setHasResult(true);
        }
    }, []);

    const startTest = () => {
        setViewState('test');
    };

    // INTRO VIEW
    if (viewState === 'intro') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="mind-architect-bg-gradient" />
                <div className="mind-architect-bg-line" />
                <div className="max-w-2xl w-full text-center z-10 relative animate-fade-in-up">
                    <div className="mb-10">
                        <div className="mind-architect-badge text-purple-400 border-purple-500/40 bg-purple-950/30 mb-4">
                            MODULE 03
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-gray-100">이상향과 잠재력</h1>
                        <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
                            당신이 추구하는 이상적 자아와 실제 잠재력 사이의 정합성을 측정합니다.<br />
                            격차 분석을 통해 최적의 성장 전략을 도출하세요.
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
                            <Link href="/growth-roadmap/assessment/result" className="mind-architect-btn-secondary">
                                이전 결과 보기
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // 한 번에 진행: 이상 8 + 잠재 10 = 18문항 (잠재력 파악 강화)
    const idealPool = idealMin8;
    const potentialPool = potentialMin10;
    const allQuestions = [...idealPool, ...potentialPool];
    const currentQuestion = allQuestions[currentIndex];
    const progress = ((currentIndex + 1) / MODULE3_QUESTION_TOTAL) * 100;

    const handleOptionSelect = (option: Option) => {
        const isIdeal = currentIndex < MODULE3_IDEAL_QUESTION_COUNT;
        if (option.value) {
            const newScores = {
                ideal: { ...scores.ideal },
                potential: { ...scores.potential }
            };
            const target = isIdeal ? newScores.ideal : newScores.potential;
            Object.entries(option.value).forEach(([key, val]) => {
                if (val) (target as Record<string, number>)[key] = ((target as Record<string, number>)[key] || 0) + val;
            });
            setScores(newScores);
        }

        if (currentIndex < MODULE3_QUESTION_TOTAL - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            // 18문항 모두 완료 → 마지막 선택을 potential에 반영해 저장 (setState 비동기이므로 직접 계산)
            const finalScores = { ideal: { ...scores.ideal }, potential: { ...scores.potential } };
            if (option.value) {
                Object.entries(option.value).forEach(([key, val]) => {
                    if (val) (finalScores.potential as Record<string, number>)[key] = ((finalScores.potential as Record<string, number>)[key] || 0) + val;
                });
            }
            localStorage.setItem('sg_module3_result', JSON.stringify(finalScores));
            fetch('/api/analytics/service-usage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serviceName: 'mind-architect-m3', actionType: 'complete' }),
            }).catch(() => {});
            router.push('/growth-roadmap/assessment/result');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4 relative">
            <div className="mind-architect-bg-gradient" />
            <div className="mind-architect-bg-line" />
            {/* Header - 한 번에 진행: 질문 N / 18 */}
            <div className="w-full max-w-2xl mb-12 flex justify-between items-end border-b border-gray-800 pb-4 z-10 relative">
                <div>
                    <h1 className="text-2xl font-bold text-gray-100">이상향과 잠재력</h1>
                    <p className="text-xs text-gray-400 font-mono mt-1">타겟 컨피그레이션</p>
                </div>
                <div className="text-right">
                    <span className="text-sm text-purple-400 font-mono block">질문 {currentIndex + 1} / {MODULE3_QUESTION_TOTAL}</span>
                    <div className="text-2xl font-bold font-mono text-gray-400 mt-1">{Math.round(progress)}%</div>
                </div>
            </div>

            {/* Question Card - 질의 통일: 동일 카드 높이·스타일 */}
            <div className="w-full max-w-2xl animate-fade-in-up z-10 relative">
                <div className="glass-panel p-8 md:p-10 rounded-xl mb-8 min-h-[180px] flex items-center justify-center">
                    <h2 className="text-xl md:text-2xl font-medium text-center leading-relaxed break-keep text-gray-100">
                        {currentQuestion.text}
                    </h2>
                </div>

                {/* Options - 질의 통일: M1·M2와 동일 옵션 스타일 */}
                <div className="grid gap-4">
                    {currentQuestion.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleOptionSelect(opt)}
                            className="group w-full p-5 text-left rounded-xl border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 hover:border-purple-500/40 transition-all active:scale-95 touch-manipulation"
                        >
                            <span className="text-base transition-colors group-hover:text-white">{opt.text}</span>
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
}

export default function AssessmentPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-black text-white flex items-center justify-center">
                    <p>페이지를 불러오는 중입니다...</p>
                </div>
            }
        >
            <AssessmentPageInner />
        </Suspense>
    );
}
