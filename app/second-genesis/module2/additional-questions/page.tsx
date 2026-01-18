"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ADDITIONAL_QUESTIONS } from "@second-genesis/data/module2/additionalQuestions";
import { Scenario, ScenarioOption } from "@second-genesis/types/module2";
import { Home, CheckCircle, AlertCircle } from "lucide-react";

export default function AdditionalQuestionsPage() {
    const router = useRouter();
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selections, setSelections] = useState<ScenarioOption[]>([]);
    const [isCompleted, setIsCompleted] = useState(false);

    const currentQuestion = ADDITIONAL_QUESTIONS[currentQuestionIdx];

    useEffect(() => {
        // 기존 결과가 없으면 메인 페이지로 리다이렉트
        const stored = localStorage.getItem('sg_module2_result');
        if (!stored) {
            router.push('/second-genesis/module2');
            return;
        }
    }, [router]);

    const handleOptionSelect = (option: ScenarioOption) => {
        const newSelections = [...selections, option];
        setSelections(newSelections);

        if (currentQuestionIdx < ADDITIONAL_QUESTIONS.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
        } else {
            // 모든 질문 완료
            handleComplete(newSelections);
        }
    };

    const handleComplete = async (finalSelections: ScenarioOption[]) => {
        try {
            // 기존 결과 가져오기
            const stored = localStorage.getItem('sg_module2_result');
            if (!stored) {
                router.push('/second-genesis/module2');
                return;
            }

            const existingResult = JSON.parse(stored);
            
            // 기존 선택과 추가 질문 선택 합치기
            const existingSelections = existingResult.rawSelections || [];
            const allSelections = [...existingSelections, ...finalSelections];
            
            // 점수 재계산
            const totalScores = { proactivity: 0, adaptability: 0, socialDistance: 0 };
            allSelections.forEach((opt: ScenarioOption) => {
                if (opt.weight?.proactivity) totalScores.proactivity += opt.weight.proactivity;
                if (opt.weight?.adaptability) totalScores.adaptability += opt.weight.adaptability;
                if (opt.weight?.socialDistance) totalScores.socialDistance += opt.weight.socialDistance;
            });

            // 일관성 재검사
            const { checkAnswerConsistency } = await import('@second-genesis/lib/module2/consistencyCheck');
            const phaseSelections = existingResult.phaseSelections || {
                phase1: existingSelections.slice(0, 9),
                phase2: existingSelections.slice(9, 18),
                phase3: existingSelections.slice(18, 27)
            };
            
            const consistencyResult = checkAnswerConsistency(allSelections, phaseSelections);

            // 결과 업데이트
            const updatedResult = {
                ...existingResult,
                timestamp: new Date().toISOString(),
                analysis: totalScores,
                scores: totalScores,
                rawSelections: allSelections,
                consistency: consistencyResult,
                additionalQuestionsAnswered: true,
                additionalSelections: finalSelections
            };

            localStorage.setItem('sg_module2_result', JSON.stringify(updatedResult));
            setIsCompleted(true);

            // 2초 후 결과 페이지로 이동
            setTimeout(() => {
                router.push('/second-genesis/module2/result');
            }, 2000);
        } catch (error) {
            console.error('Error completing additional questions:', error);
            alert('오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    if (isCompleted) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
                <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
                    <h2 className="text-2xl font-bold mb-2">추가 질문 완료!</h2>
                    <p className="text-gray-400 mb-4">분석 결과를 업데이트하고 있습니다...</p>
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div>로딩 중...</div>
            </div>
        );
    }

    const progress = Math.round(((currentQuestionIdx + 1) / ADDITIONAL_QUESTIONS.length) * 100);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative">
            {/* Home Button */}
            <div className="absolute top-4 left-4 z-20">
                <Link href="/second-genesis/module2/result" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <Home size={24} />
                    <span className="sr-only">결과로 돌아가기</span>
                </Link>
            </div>

            {/* Header */}
            <div className="w-full max-w-3xl mb-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <AlertCircle className="w-6 h-6 text-yellow-400" />
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                        추가 질문
                    </h1>
                </div>
                <p className="text-gray-400 text-sm md:text-base mb-6">
                    분석 정확도를 높이기 위한 보완 질문입니다. 솔직하게 답변해주세요.
                </p>
                
                {/* Progress */}
                <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>질문 {currentQuestionIdx + 1} / {ADDITIONAL_QUESTIONS.length}</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Question Card */}
            <div className="w-full max-w-3xl bg-gray-900/70 border border-gray-800 rounded-2xl p-8 md:p-10 shadow-2xl">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-blue-900/30 text-blue-400 text-xs font-bold rounded-full">
                            질문 {currentQuestionIdx + 1}
                        </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                        {currentQuestion.situation}
                    </h2>
                </div>

                {/* Options */}
                <div className="space-y-4">
                    {currentQuestion.options?.map((opt, idx) => (
                        <button
                            key={opt.id}
                            onClick={() => handleOptionSelect(opt)}
                            className="w-full p-5 text-left bg-gray-800/50 border-2 border-gray-700 hover:border-blue-500 hover:bg-gray-800 rounded-xl transition-all duration-200 group"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full border-2 border-gray-600 group-hover:border-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold text-gray-400 group-hover:text-blue-400">
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                </div>
                                <span className="text-gray-200 text-base md:text-lg font-medium flex-grow">
                                    {opt.text}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Helper Text */}
                <div className="mt-8 pt-6 border-t border-gray-800">
                    <p className="text-gray-500 text-sm text-center">
                        💡 <span className="text-gray-400">솔직한 답변이 더 정확한 분석 결과를 제공합니다.</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

