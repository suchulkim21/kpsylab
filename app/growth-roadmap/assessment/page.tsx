"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnalysisVector } from "@growth-roadmap/lib/analysis";
import { fullIdealQuestions, fullPotentialQuestions, Question, Option } from "@growth-roadmap/data/module3/questions";

type Phase = 'ideal' | 'potential';

export default function AssessmentPage() {
    const router = useRouter();

    // Flow State
    const [viewState, setViewState] = useState<'intro' | 'test'>('intro');
    const [hasResult, setHasResult] = useState(false);

    // Test State
    const [phase, setPhase] = useState<Phase>('ideal');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [scores, setScores] = useState<{ ideal: AnalysisVector, potential: AnalysisVector }>({
        ideal: { stability: 0, growth: 0, relation: 0, autonomy: 0 },
        potential: { stability: 0, growth: 0, relation: 0, autonomy: 0 }
    });
    const [isTransitioning, setIsTransitioning] = useState(false);

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

                <div className="max-w-2xl w-full text-center z-10 animate-fade-in-up">
                    <div className="mb-10">
                        <div className="text-purple-500 font-mono text-sm tracking-widest border border-purple-900/50 bg-purple-900/10 px-3 py-1 rounded-full mb-4 inline-block">
                            MODULE 03
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">이상향과 잠재력</h1>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-lg mx-auto">
                            당신이 추구하는 이상적 자아와 실제 잠재력 사이의 정합성을 측정합니다.<br />
                            격차 분석을 통해 최적의 성장 전략을 도출하세요.
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
                            <Link href="/growth-roadmap/assessment/result">
                                <button className="px-10 py-4 border border-gray-600 text-gray-300 font-bold rounded-full hover:bg-gray-800 transition-colors text-lg">
                                    이전 결과 보기
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
                {/* Background Ambience */}
                <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"></div>
            </div>
        );
    }

    // TEST LOGIC
    const activeQuestions = phase === 'ideal' ? fullIdealQuestions : fullPotentialQuestions;
    const currentQuestion = activeQuestions[currentIndex];

    // Progress Calculation
    const totalQ = fullIdealQuestions.length + fullPotentialQuestions.length;
    const currentTotal = phase === 'ideal' ? currentIndex : fullIdealQuestions.length + currentIndex;
    const progress = (currentTotal / totalQ) * 100;

    const handleOptionSelect = (option: Option) => {
        // Record Score
        if (option.value) {
            const newScores = { ...scores };
            const targetScore = newScores[phase];

            Object.entries(option.value).forEach(([key, val]) => {
                if (val) targetScore[key as keyof AnalysisVector] += val;
            });
            setScores(newScores);
        }

        // Move Next
        if (currentIndex < activeQuestions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            handlePhaseComplete();
        }
    };

    const handlePhaseComplete = () => {
        if (phase === 'ideal') {
            setIsTransitioning(true);
            setTimeout(() => {
                setPhase('potential');
                setCurrentIndex(0);
                setIsTransitioning(false);
            }, 1000);
        } else {
            // Finish - Save to LocalStorage and push to result
            localStorage.setItem('sg_module3_result', JSON.stringify(scores));
            router.push('/growth-roadmap/assessment/result');
        }
    };

    if (isTransitioning) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="text-center animate-pulse">
                    <h2 className="text-3xl font-bold mb-4 text-glow-purple">단계 완료</h2>
                    <p className="font-mono text-gray-500">잠재력 분석 엔진 가동 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4 relative">

            {/* Header / HUD */}
            <div className="w-full max-w-2xl mb-12 flex justify-between items-end border-b border-gray-800 pb-4 z-10">
                <div>
                    <div className={`text-xs font-mono mb-1 ${phase === 'ideal' ? 'text-purple-400' : 'text-blue-400'}`}>
                        {phase === 'ideal' ? '1단계 // 이상향 좌표 설정' : '2단계 // 잠재력 엔진 검증'}
                    </div>
                    <h1 className="text-2xl font-bold">{phase === 'ideal' ? '이상향 정의' : '잠재력 검증'}</h1>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold font-mono">{Math.round(progress)}%</div>
                    <div className="text-xs text-gray-600">진행률</div>
                </div>
            </div>

            {/* Question Card */}
            <div className="w-full max-w-2xl animate-fade-in-up z-10">
                <div className="glass-panel p-8 md:p-12 rounded-lg mb-8 min-h-[200px] flex items-center justify-center">
                    <h2 className="text-2xl md:text-3xl font-medium text-center leading-relaxed break-keep">
                        {currentQuestion.text}
                    </h2>
                </div>

                {/* Options */}
                <div className="grid gap-4">
                    {currentQuestion.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleOptionSelect(opt)}
                            className="group w-full p-6 text-left glass-panel hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-white/20 rounded-lg flex items-center justify-between"
                        >
                            <span className="text-lg text-gray-300 group-hover:text-white transition-colors">{opt.text}</span>
                            <span className={`text-xs font-mono px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity ${phase === 'ideal' ? 'text-purple-400' : 'text-blue-400'}`}>
                                선택
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black"></div>
        </div>
    );
}
