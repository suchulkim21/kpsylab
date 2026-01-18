'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { questions as phase1Pool } from '@second-genesis/lib/module1/questions';
import { analyzeInterference } from '@second-genesis/lib/module1/analysisEngine';

export default function Module1Page() {
    const router = useRouter();

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
        setViewState('test');
    };

    const handleOptionClick = (option: any) => {
        if (selectedOptionId) return; // Prevent double click

        setSelectedOptionId(option.id);

        const newHistory = [...history, { id: option.id, choice: option.id }];
        setHistory(newHistory);

        setTimeout(() => {
            // CAT: Early Termination Logic
            // Check after minimum 10 questions
            if (newHistory.length >= 10) {
                const currentAnalysis = analyzeInterference(newHistory.map(h => h.id));
                const maxScore = Math.max(...Object.values(currentAnalysis.vector).map(Number));

                // If dominant trait is > 50%, terminate early (Confidence Threshold)
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
        }, 500);
    };

    const finishAnalysis = async (finalHistory: any[]) => {
        const shadowData = finalHistory.map(h => h.id);
        const resultAnalysis = analyzeInterference(shadowData);

        const resultData = {
            timestamp: new Date().toISOString(),
            shadowData: shadowData,
            vector: resultAnalysis.vector, // Save Vector
            dominantType: resultAnalysis.dominantType
        };
        localStorage.setItem('sg_module1_result', JSON.stringify(resultData));
        router.push('/second-genesis/module1/result');
    };

    if (!isReady || questions.length === 0) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono animate-pulse">시스템 초기화 중...</div>;

    // INTRO VIEW
    if (viewState === 'intro') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">

                <div className="max-w-2xl w-full text-center z-10 animate-fade-in-up">
                    <div className="mb-12">
                        <div className="text-gray-500 font-mono text-xs tracking-widest border border-gray-800 bg-gray-900/50 px-3 py-1 rounded mb-6 inline-block">
                            MODULE 01
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-gray-100">무의식 방해 요인 분석</h1>
                        <p className="text-gray-400 text-base leading-relaxed max-w-lg mx-auto">
                            성장을 가로막는 무의식적 패턴과 인지 편향을 진단합니다.<br />
                            응답 패턴에 따라 분석이 조기에 종료될 수 있습니다.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={startTest}
                            className="px-8 py-3 bg-white text-black font-semibold rounded hover:bg-gray-200 transition-colors text-base"
                        >
                            {hasResult ? '재분석 수행' : '분석 시작'}
                        </button>

                        {hasResult && (
                            <Link href="/second-genesis/module1/result">
                                <button className="px-8 py-3 border border-gray-700 text-gray-400 font-medium rounded hover:bg-gray-800 transition-colors text-base">
                                    이전 결과 열람
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // TEST VIEW
    const currentQ = questions[currentIndex];
    const progress = Math.min(((currentIndex) / questions.length) * 100, 95); // Don't show 100% until done

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4 relative font-sans">

            {/* Header / HUD */}
            <div className="w-full max-w-2xl mb-12 flex justify-between items-end border-b border-gray-800 pb-4 z-10">
                <div>
                    <h1 className="text-xl font-bold text-gray-200">인지 패턴 정밀 분석</h1>
                </div>
                <div className="text-right">
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
                        className="p-8 md:p-10 rounded bg-gray-900/30 border border-gray-800 min-h-[160px] flex items-center justify-center text-center"
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
                                className="group w-full p-5 text-left rounded border transition-all duration-150"
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

