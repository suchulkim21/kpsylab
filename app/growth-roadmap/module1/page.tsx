/* eslint-disable */
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { questionsMin12 as phase1Pool } from '@growth-roadmap/lib/module1/questions';
import { MODULE1_QUESTION_COUNT } from '@growth-roadmap/lib/constants';
import { analyzeInterference } from '@growth-roadmap/lib/module1/analysisEngine';
import { applyRetestAndPropagate } from '@/lib/services/consistencyAuditor';

function Module1PageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const flowUnified = searchParams.get('flow') === 'unified';

    // Flow State
    const [viewState, setViewState] = useState<'intro' | 'test'>('intro');
    const [hasResult, setHasResult] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // Test State
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        setQuestions(phase1Pool);
        const stored = localStorage.getItem('sg_module1_result');
        if (stored) {
            setHasResult(true);
        }
        setIsReady(true);
    }, []);

    const startTest = () => {
        setHistory([]);
        setCurrentIndex(0);
        setSelectedOptionId(null);
        setViewState('test');
    };

    const handleOptionClick = (option: any) => {
        if (selectedOptionId) return; // Prevent double click

        setSelectedOptionId(option.id);

        const newHistory = [...history, { id: option.id, choice: option.id }];
        setHistory(newHistory);

        // CAT: Early Termination Logic
        if (newHistory.length >= 10) {
            const currentAnalysis = analyzeInterference(newHistory.map(h => h.id));
            const maxScore = Math.max(...Object.values(currentAnalysis.vector).map(Number));

            if (maxScore > 0.50) {
                finishAnalysis(newHistory);
                return;
            }
        }

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOptionId(null);
        } else {
            finishAnalysis(newHistory);
        }
    };

    const finishAnalysis = async (finalHistory: any[]) => {
        const shadowData = finalHistory.map(h => h.id);
        const resultAnalysis = analyzeInterference(shadowData);
        const vectorNum = Object.fromEntries(
            Object.entries(resultAnalysis.vector).map(([k, v]) => [k, parseFloat(String(v)) || 0])
        );

        const isRetest = hasResult;
        let previousResult: { type: string; vector: Record<string, number> } | undefined;
        if (isRetest) {
            const stored = localStorage.getItem('sg_module1_result');
            if (stored) {
                try {
                    const prev = JSON.parse(stored);
                    const prevVec = prev.vector ?? {};
                    previousResult = {
                        type: prev.dominantType ?? 'A',
                        vector: typeof prevVec === 'object' ? Object.fromEntries(
                            Object.entries(prevVec).map(([k, v]) => [k, parseFloat(String(v)) || 0])
                        ) : {},
                    };
                } catch {}
            }
        }

        applyRetestAndPropagate({
            targetModule: 'Module_1',
            isRetest,
            previousResult,
            newResult: { type: resultAnalysis.dominantType, vector: vectorNum },
        });

        const resultData = {
            timestamp: new Date().toISOString(),
            shadowData: shadowData,
            vector: resultAnalysis.vector,
            dominantType: resultAnalysis.dominantType
        };
        localStorage.setItem('sg_module1_result', JSON.stringify(resultData));
        fetch('/api/analytics/service-usage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serviceName: 'mind-architect-m1', actionType: 'complete' }),
        }).catch(() => {});
        router.push((flowUnified ? '/growth-roadmap/module1/result?flow=unified' : '/growth-roadmap/module1/result') + '?t=' + Date.now());
    };

    if (!isReady || questions.length === 0) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono animate-pulse">시스템 초기화 중...</div>;

    // INTRO VIEW
    if (viewState === 'intro') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
                <div className="mind-architect-bg-gradient" />
                <div className="mind-architect-bg-line" />
                <div className="max-w-2xl w-full text-center z-10 relative animate-fade-in-up">
                    <div className="mb-10">
                        <div className="mind-architect-badge text-red-400 border-red-500/40 bg-red-950/30 mb-4">
                            MODULE 01
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-gray-100">무의식 방해 요인 분석</h1>
                        <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
                            경로를 가로막는 무의식적 패턴과 인지 편향을 탐색합니다.<br />
                            응답 패턴에 따라 분석이 조기에 종료될 수 있습니다.
                        </p>
                        <p className="text-gray-400 text-xs italic max-w-lg mx-auto mt-4">
                            이 결과는 당신의 정답이 아닌, 참고할 수 있는 정교한 한 장의 지도입니다.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button onClick={startTest} className="mind-architect-btn-primary">
                            {hasResult ? "재분석 수행" : "분석 시작"}
                        </button>
                        {hasResult && (
                            <Link href="/growth-roadmap/module1/result" className="mind-architect-btn-secondary">
                                이전 결과 열람
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // TEST VIEW
    const currentQ = questions[currentIndex];
    const progress = Math.min(((currentIndex) / questions.length) * 100, 95);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4 relative font-sans">
            <div className="mind-architect-bg-gradient" />
            <div className="mind-architect-bg-line" />
            {/* Header / HUD - 질의 통일: 질문 N/24, 진행률 */}
            <div className="w-full max-w-2xl mb-12 flex justify-between items-end border-b border-gray-800 pb-4 z-10 relative">
                <div>
                    <h1 className="text-xl font-bold text-gray-200">인지 패턴 정밀 분석</h1>
                    <p className="text-xs text-gray-400 font-mono mt-1">무의식 방해 요인</p>
                </div>
                <div className="text-right">
                    <span className="text-sm text-purple-400 font-mono block">질문 {currentIndex + 1} / {MODULE1_QUESTION_COUNT}</span>
                    <div className="text-2xl font-bold font-mono text-gray-400">{Math.round(progress)}%</div>
                </div>
            </div>

            {/* Question Card */}
            <div className="w-full max-w-2xl z-10 relative mb-8">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentQ.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="glass-panel p-8 md:p-10 rounded-xl min-h-[180px] flex items-center justify-center text-center"
                    >
                        <h2 className="text-xl md:text-2xl font-medium leading-relaxed break-keep text-gray-100">
                            {currentQ.text}
                        </h2>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Options List */}
            <div className="w-full max-w-2xl grid gap-3 z-10">
                <AnimatePresence mode='wait'>
                    {currentQ.options.map((option: any) => {
                        const isSelected = selectedOptionId === option.id;
                        return (
                        <motion.button
                            key={option.id}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{
                                opacity: 1,
                                x: 0,
                                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                                borderColor: isSelected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.05)'
                            }}
                            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                            onClick={() => handleOptionClick(option)}
                            className="group w-full p-5 text-left rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-none duration-0 active:scale-95 touch-manipulation"
                        >
                                <span className={`text-base transition-colors ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                    {option.text}
                                </span>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function Module1Page() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-black text-white flex items-center justify-center">
                    <p>페이지를 불러오는 중입니다...</p>
                </div>
            }
        >
            <Module1PageInner />
        </Suspense>
    );
}

