"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Brain, AlertCircle, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Module2Engine } from "@growth-roadmap/lib/module2/analysisEngine";
import { ResultItem, getKoreanTypeName, determineTypeCode } from "@growth-roadmap/lib/content/module2";
import { ConsistencyResult, getImpactExplanation } from "@growth-roadmap/lib/module2/consistencyCheck";

// Grouping Helper
const groupByCategory = (items: ResultItem[]) => {
    const groups: Record<string, ResultItem[]> = {};
    items.forEach(item => {
        if (!groups[item.category]) groups[item.category] = [];
        groups[item.category].push(item);
    });
    return groups;
};

export default function Module2ResultPage() {
    const router = useRouter();
    const [typeName, setTypeName] = useState<string>("");
    const [groupedContent, setGroupedContent] = useState<Record<string, ResultItem[]> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [consistency, setConsistency] = useState<ConsistencyResult | null>(null);
    const [showAdditionalQuestions, setShowAdditionalQuestions] = useState(false);
    const [additionalQuestionsAnswered, setAdditionalQuestionsAnswered] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('sg_module2_result');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Determine where the scores are located
                let scores: any = null;
                if (parsed.analysis) {
                    scores = parsed.analysis;
                } else if (parsed.scores) {
                    scores = parsed.scores;
                } else if (parsed.proactivity !== undefined) {
                    scores = {
                        proactivity: parsed.proactivity,
                        adaptability: parsed.adaptability,
                        socialDistance: parsed.socialDistance,
                    };
                } else {
                    // Fallback: assume whole object is scores
                    scores = parsed;
                }
                const engine = new Module2Engine({ scores });
                const results = engine.generateResults();
                const typeCode = determineTypeCode(scores);
                const name = getKoreanTypeName(typeCode);
                setTypeName(name);
                setGroupedContent(groupByCategory(results));
                
                // 일관성 정보가 있으면 표시
                if (parsed.consistency) {
                    setConsistency(parsed.consistency);
                }
                
                // 추가 질문 완료 여부 확인
                if (parsed.additionalQuestionsAnswered) {
                    setAdditionalQuestionsAnswered(true);
                }
            } catch (e) {
                console.error('Parse error', e);
                setError('데이터를 불러오는 중 오류가 발생했습니다.');
            }
        } else {
            setError('분석 결과가 존재하지 않습니다.');
        }
    }, []);

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 text-center">
                <div className="text-red-500 text-xl font-bold mb-4">DATA ERROR</div>
                <p className="text-gray-400 mb-8">{error}</p>
                <Link href="/growth-roadmap/module2">
                    <button className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors">
                        재검사
                    </button>
                </Link>
            </div>
        );
    }

    if (!groupedContent) return <div className="min-h-screen bg-black text-white flex items-center justify-center">분석 중...</div>;

    // Define Category Order for Display
    const categoryOrder = ["심층 진단", "인지 프로세스", "행동 패턴", "사회적 역동", "임상 솔루션"];

    return (
        <div className="min-h-screen bg-black text-white p-6 animate-fade-in-up relative overflow-hidden font-sans">

            <div className="max-w-4xl mx-auto pt-10 pb-20 relative z-10 text-left">
                <header className="mb-10">
                    <span className="report-section-label text-blue-400 block mb-2">
                        심층 분석 보고서
                    </span>
                    <h1 className="report-section-title">
                        행동 패턴 정밀 진단
                    </h1>
                    <p className="report-section-summary">대인 관계 및 의사결정 메커니즘 해독</p>
                </header>

                {/* TYPE HEADER - report-card 스타일 통일 */}
                <div className="report-card mb-12 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-3">
                        <Brain className="text-blue-500" size={18} />
                        <span className="report-section-label text-blue-400">진단된 유형</span>
                    </div>
                    <h2 className="report-section-title text-3xl md:text-4xl">
                        {typeName}
                    </h2>
                </div>

                {/* 신뢰도 표시 */}
                {consistency && (
                    <div className={`mb-8 report-card border ${
                        consistency.consistencyLevel === 'high' 
                            ? 'bg-green-900/20 border-green-700/30' 
                            : consistency.consistencyLevel === 'medium'
                            ? 'bg-yellow-900/20 border-yellow-700/30'
                            : 'bg-red-900/20 border-red-700/30'
                    }`}>
                        <div className="flex items-start gap-4">
                            {consistency.consistencyLevel === 'high' ? (
                                <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={24} />
                            ) : consistency.consistencyLevel === 'medium' ? (
                                <AlertCircle className="text-yellow-400 flex-shrink-0 mt-1" size={24} />
                            ) : (
                                <XCircle className="text-red-400 flex-shrink-0 mt-1" size={24} />
                            )}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <h3 className="text-xl font-bold text-white">답변 신뢰도</h3>
                                    <span className={`text-2xl font-extrabold ${
                                        consistency.consistencyLevel === 'high' 
                                            ? 'text-green-400' 
                                            : consistency.consistencyLevel === 'medium'
                                            ? 'text-yellow-400'
                                            : 'text-red-400'
                                    }`}>
                                        {consistency.reliabilityScore}%
                                    </span>
                                    {additionalQuestionsAnswered && (
                                        <span className="ml-2 px-3 py-1 bg-green-900/30 text-green-400 text-xs font-bold rounded-full flex items-center gap-1">
                                            <CheckCircle size={14} />
                                            보완 완료
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-300 mb-3 leading-relaxed">
                                    {getImpactExplanation(consistency.reliabilityScore)}
                                </p>
                                
                                {consistency.issues.length > 0 && (
                                    <div className="mt-4 p-4 bg-black/30 rounded-lg">
                                        <p className="text-sm text-gray-400 mb-2 font-semibold">발견된 문제:</p>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                                            {consistency.issues.map((issue, idx) => (
                                                <li key={idx}>{issue}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {consistency.consistencyLevel !== 'high' && (
                                    <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                                        <div className="flex items-start gap-3">
                                            <HelpCircle className="text-blue-400 flex-shrink-0 mt-1" size={20} />
                                            <div className="flex-1">
                                                <p className="text-blue-300 font-semibold mb-2">
                                                    {consistency.recommendation}
                                                </p>
                                                {!showAdditionalQuestions && (
                                                    <button
                                                        onClick={() => setShowAdditionalQuestions(true)}
                                                        className="mt-3 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-colors text-sm"
                                                    >
                                                        추가 질문에 답변하기
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 추가 질문 제안 */}
                {showAdditionalQuestions && consistency && consistency.consistencyLevel !== 'high' && (
                    <div className="mb-8 p-6 rounded-2xl border border-blue-700/30 bg-blue-900/10">
                        <p className="text-white mb-4 leading-relaxed">
                            일관성 없는 답변에 대해서 테스트 정확도를 위해 추가 질문에 답변하시겠습니까?
                        </p>
                        <p className="text-gray-400 text-sm mb-4">
                            추가 질문에 답변하시면 분석 결과의 정확도가 향상됩니다. 사람이니 실수할 수도 있으니, 
                            더 정확한 분석을 원하시면 아래 버튼을 클릭해주세요.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    // 추가 질문 페이지로 이동 (추후 구현)
                                    router.push('/growth-roadmap/module2/additional-questions');
                                }}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-colors"
                            >
                                추가 질문 진행하기
                            </button>
                            <button
                                onClick={() => setShowAdditionalQuestions(false)}
                                className="px-6 py-3 border border-gray-600 text-gray-400 hover:bg-gray-800 font-bold rounded-full transition-colors"
                            >
                                나중에 하기
                            </button>
                        </div>
                    </div>
                )}

                {/* CONTENT CARDS */}
                <div className="space-y-12">
                    {categoryOrder.map((catKey) => {
                        const items = groupedContent[catKey];
                        if (!items) return null;

                        return (
                            <section key={catKey} className="border-t border-gray-800 pt-8">
                                <h3 className="report-heading mb-6 border-blue-500" style={{ borderLeftColor: 'rgb(59 130 246)' }}>
                                    {catKey}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="report-card hover:bg-gray-800/50 transition-colors relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors"></div>
                                            <div className="text-gray-500 text-xs font-mono mb-2 uppercase tracking-wider relative z-10">{item.title}</div>
                                            <div className="text-gray-200 leading-relaxed font-medium relative z-10">
                                                {item.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>

                <div className="report-actions">
                    <Link href="/growth-roadmap/module2" className="report-btn-secondary">
                        재검사
                    </Link>
                    <Link href="/growth-roadmap/assessment" className="report-btn-primary flex items-center gap-2">
                        다음 단계로 이동 <span className="text-xs">→</span>
                    </Link>
                </div>
            </div>

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-900/10 to-transparent opacity-50"></div>
            </div>
        </div>
    );
}
