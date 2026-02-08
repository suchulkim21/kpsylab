"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer
} from "recharts";
import { calculateGapAnalysis, GapAnalysisResult } from "@growth-roadmap/lib/analysis";
import { getDimName, getResultVariantIndex, getStrategyDetail, getStrategyActions } from "@growth-roadmap/lib/content/resultContent";
import GrowthAdvice from "./GrowthAdvice";

// Simple PDF export using browser APIs (placeholder implementation)
const exportToPdf = () => {
    const element = document.getElementById("result-page");
    if (!element) return;
    // Use html2canvas if available, otherwise just alert
    // This is a minimal placeholder – real implementation would import html2canvas & jsPDF.
    alert("PDF 다운로드 기능은 현재 구현되지 않았습니다. 추후 추가 예정입니다.");
};

export default function ResultPage() {
    const router = useRouter();
    const [result, setResult] = useState<GapAnalysisResult | null>(null);
    const [activeTab, setActiveTab] = useState("insight"); // insight | strategy | action

    useEffect(() => {
        const stored = localStorage.getItem('sg_module3_result');
        if (!stored) {
            router.push('/');
            return;
        }
        const { ideal, potential } = JSON.parse(stored);
        const analysis = calculateGapAnalysis(ideal, potential);
        setResult(analysis);
    }, [router]);

    if (!result) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">분석 결과 처리 중...</div>;

    const data = [
        { subject: '안정', A: result.ideal.stability, B: result.potential.stability },
        { subject: '성장', A: result.ideal.growth, B: result.potential.growth },
        { subject: '관계', A: result.ideal.relation, B: result.potential.relation },
        { subject: '자율', A: result.ideal.autonomy, B: result.potential.autonomy }
    ];

    const strategyMap = {
        Alignment: '일치',
        Expansion: '확장',
        Correction: '보정',
        Pivot: '전환'
    };

    const accentColor =
        result.strategy === 'Alignment' ? '#4ade80' : // Green
            result.strategy === 'Expansion' ? '#3b82f6' : // Blue
                result.strategy === 'Correction' ? '#f97316' : // Orange
                    '#ef4444'; // Red

    const dimName = getDimName;
    const variantIndex = getResultVariantIndex(result);

    return (
        <div id="result-page" className="min-h-screen bg-black text-white p-6 animate-fade-in-up relative overflow-hidden font-sans">
            <div className="max-w-4xl mx-auto pt-10 pb-20 relative z-10">
                {/* Header */}
                <header className="mb-10 text-center">
                    <span className="text-gray-400 font-mono text-xs tracking-widest border border-gray-800 bg-gray-900/50 px-3 py-1 rounded-full mb-4 inline-block">
                        분석 완료
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-100">
                        전략적 차이 분석
                    </h1>
                    <p className="text-gray-400 text-sm">이상향 대 잠재력 격차 분석</p>
                </header>

                {/* Strategy Header */}
                <div className="glass-panel p-8 rounded-2xl mb-8 border border-white/10 bg-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full mix-blend-screen filter blur-3xl"></div>
                    <div className="relative z-10 text-center">
                        <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-2">
                            {strategyMap[result.strategy]}
                        </h2>
                        <p className="text-gray-300 mt-2">
                            {result.strategy === 'Alignment' && '이상향과 잠재력이 일치합니다. 현재 궤도를 가속화하십시오.'}
                            {result.strategy === 'Expansion' && '잠재력이 충분하지만 목표가 낮습니다. 더 큰 이상을 품으십시오.'}
                            {result.strategy === 'Correction' && '잠재력과 이상향의 방향이 엇갈립니다. 현실적인 조정이 필요합니다.'}
                            {result.strategy === 'Pivot' && '심각한 불일치가 감지되었습니다. 전면적인 방향 수정이 필수입니다.'}
                        </p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <nav className="flex flex-wrap justify-center gap-2 mb-8">
                    <button
                        className={`px-4 py-2 rounded ${activeTab === 'insight' ? 'bg-white text-black' : 'bg-gray-800 text-gray-300'}`}
                        onClick={() => setActiveTab('insight')}
                    >통찰</button>
                    <button
                        className={`px-4 py-2 rounded ${activeTab === 'strategy' ? 'bg-white text-black' : 'bg-gray-800 text-gray-300'}`}
                        onClick={() => setActiveTab('strategy')}
                    >전략</button>
                    <button
                        className={`px-4 py-2 rounded ${activeTab === 'action' ? 'bg-white text-black' : 'bg-gray-800 text-gray-300'}`}
                        onClick={() => setActiveTab('action')}
                    >실행</button>
                    <button
                        className={`px-4 py-2 rounded ${activeTab === 'advice' ? 'bg-white text-black' : 'bg-gray-800 text-gray-300'}`}
                        onClick={() => setActiveTab('advice')}
                    >조언</button>
                </nav>

                {/* Content Panels */}
                <section className="space-y-8">
                    {/* Insight Panel */}
                    {activeTab === 'insight' && (
                        <div className="glass-panel p-6 rounded-xl border-l-4" style={{ borderLeftColor: accentColor }}>
                            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                <span>⚡</span> 핵심 통찰
                            </h3>
                            {result.strategy === 'Alignment' ? (
                                <>
                                    <p className="text-gray-300 mb-3">
                                        이상향과 잠재력의 정합도가 약 {result.alignmentScore}%로 <strong>높은 편</strong>입니다. 원하는 방향과 지금 할 수 있는 것이 잘 맞는 상태이므로, 큰 괴리를 메우기보다 <strong>현재 궤도의 유지와 소폭 가속</strong>에 초점을 두는 것이 좋습니다.
                                    </p>
                                    <p className="text-gray-300 mb-2">
                                        네 가지 차원 중 상대적으로 더 신경 쓸 만한 영역은 <strong>{dimName(result.dimensions.dominantGap)}</strong>이고, 현재 강점으로 활용할 수 있는 영역은 <strong>{dimName(result.dimensions.strongestPotential)}</strong>입니다. 강점을 유지하면서, 필요하다면 {dimName(result.dimensions.dominantGap)} 영역에 작은 습관 하나만 추가하는 식으로 균형을 유지하십시오.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-gray-300 mb-3">
                                        {result.causeExplanation}
                                    </p>
                                    <p className="text-gray-300 mb-2">
                                        <strong>{dimName(result.dimensions.dominantGap)}</strong> 영역의 괴리를 줄이기 위해 일상 습관 재점검과 해당 영역에 맞는 훈련이 우선입니다. <strong>{dimName(result.dimensions.strongestPotential)}</strong> 영역은 현재 강점이므로, 이 영역을 활용해 다른 차원의 개선을 끌어올리는 전략을 추천합니다.
                                    </p>
                                    <p className="text-gray-300 text-sm text-gray-400">
                                        이상향과 잠재력의 정합도는 약 {result.alignmentScore}%로, 현재 분석 기준 <strong>{result.strategy === 'Expansion' ? '확장' : result.strategy === 'Correction' ? '보정' : '전환'}</strong> 전략 구간에 해당합니다.
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {/* Strategy Panel */}
                    {activeTab === 'strategy' && (
                        <div className="glass-panel p-6 rounded-xl">
                            <h3 className="text-lg font-bold mb-2">전략 요약</h3>
                            <p className="text-gray-300 overflow-y-auto max-h-[600px] whitespace-pre-line">
                                {getStrategyDetail(result.strategy, variantIndex).replace(/\*\*(.*?)\*\*/g, '$1')}
                            </p>
                        </div>
                    )}

                    {/* Action Panel */}
                    {activeTab === 'action' && (
                        <div className="glass-panel p-6 rounded-xl">
                            <h3 className="text-lg font-bold mb-2">실행 권고</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-300">
                                {getStrategyActions(result.strategy, variantIndex).map((action, i) => (
                                    <li key={i}>{action}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {activeTab === 'advice' && (
                        <GrowthAdvice result={result} />
                    )}

                </section>

                {/* Radar Chart */}
                <div className="glass-panel p-6 rounded-2xl mt-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full mix-blend-screen filter blur-3xl"></div>
                    <h3 className="text-sm font-mono text-gray-400 mb-4 text-center">벡터 분석</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                                <PolarGrid stroke="#333" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
                                <Radar name="이상향" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
                                <Radar name="잠재력" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-12 flex justify-center gap-4">
                    <button onClick={exportToPdf} className="px-6 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors">
                        PDF 다운로드 (예정)
                    </button>
                    <Link href="/growth-roadmap/">
                        <button className="px-6 py-2 text-gray-500 hover:text-white underline underline-offset-2 transition-colors">
                            분석 다시 시작하기
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
