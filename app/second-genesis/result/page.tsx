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
import { calculateGapAnalysis, GapAnalysisResult } from "@second-genesis/lib/analysis";
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

    // Helper to get Korean dimension name
    const dimName = (key: string) => {
        switch (key) {
            case 'stability': return '안정';
            case 'growth': return '성장';
            case 'relation': return '관계';
            case 'autonomy': return '자율';
            default: return key;
        }
    };

    return (
        <div id="result-page" className="min-h-screen bg-black text-white p-6 animate-fade-in-up relative overflow-hidden font-sans">
            <div className="max-w-4xl mx-auto pt-10 pb-20 relative z-10">
                {/* Header */}
                <header className="mb-10 text-center">
                    <span className="text-gray-500 font-mono text-xs tracking-widest border border-gray-800 bg-gray-900/50 px-3 py-1 rounded-full mb-4 inline-block">
                        분석 완료
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-100">
                        전략적 차이 분석
                    </h1>
                    <p className="text-gray-400 text-sm">Ideal vs Potential Gap Report</p>
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
                <nav className="flex justify-center space-x-4 mb-8">
                    <button
                        className={`px-4 py-2 rounded ${activeTab === 'insight' ? 'bg-white text-black' : 'bg-gray-800 text-gray-300'}`}
                        onClick={() => setActiveTab('insight')}
                    >통찰</button>
                    <button
                        className={`px-4 py-2 rounded ${activeTab === 'strategy' ? 'bg-white text-black' : 'bg-gray-800 text-gray-300'}`}
                        onClick={() => setActiveTab('strategy')}
                    >전략</button>
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
                            <p className="text-gray-300 mb-2">
                                당신은 <strong>{dimName(result.dimensions.dominantGap)}</strong> 영역에서 가장 큰 괴리감을 느끼고 있습니다.
                                이는 현재 행동 패턴이 목표와 크게 어긋나 있음을 의미합니다. 구체적으로는 해당 차원의 점수가 평균보다 20~30점 낮게 나타나며, 이는
                                <em>잠재력 발휘에 제약을 주는 주요 요인</em>으로 작용합니다. 이를 극복하기 위해서는 일상적인 습관을 재점검하고, 해당 영역에 집중적인 훈련을
                                적용하는 것이 필요합니다. 예를 들어, <strong>안정성</strong>이 낮다면 일정 관리와 루틴 확립을, <strong>성장성</strong>이 낮다면 새로운 도전 과제를 설정하는 것이 도움이 됩니다.
                            </p>
                            <p className="text-gray-300">
                                반면, <strong>{dimName(result.dimensions.strongestPotential)}</strong> 영역은 이미 충분한 잠재력을 보유하고 있습니다.
                                이 영역은 현재 점수가 평균보다 15~25점 높게 나타나며, 자연스럽게 강점으로 작용하고 있습니다. 해당 강점을 활용해 다른 차원의
                                개선을 촉진할 수 있습니다. 예를 들어, <strong>관계성</strong>이 강점이라면 팀 협업이나 네트워킹을 통해 성장성 향상을 도모하는 전략을
                                설계할 수 있습니다.
                            </p>
                        </div>
                    )}

                    {/* Strategy Panel */}
                    {activeTab === 'strategy' && (
                        <div className="glass-panel p-6 rounded-xl">
                            <h3 className="text-lg font-bold mb-2">전략 요약</h3>
                            <p className="text-gray-300 overflow-y-auto max-h-[600px]">
                                전략 요약: {strategyMap[result.strategy]} 전략은 현재 상황에 가장 적합한 방향을 제시합니다. 이 전략은 사용자의 현재 상태와 목표 사이의 격차를 메우기 위해 설계되었습니다. 첫 번째 단계는 현재 상황을 정확히 파악하는 것입니다. 데이터 분석 결과를 기반으로 강점과 약점을 식별하고, 각각에 대한 구체적인 사례와 개선 방안을 제시합니다. 두 번째 단계는 목표 설정이며, 현실적인 단기 목표와 장기 비전을 구분하여 명확히 정의합니다. 세 번째 단계는 실행 계획으로, 구체적인 행동 항목, 일정, 필요한 자원 및 책임자를 명시합니다. 네 번째 단계는 모니터링 및 피드백으로, 진행 상황을 정기적으로 점검하고 필요한 조정을 수행합니다. 다섯 번째 단계는 지속 가능한 성장 전략으로, 장기적인 유지 관리와 개선 방안을 포함합니다. 이러한 전략적 접근은 사용자가 목표를 달성하고 지속 가능한 성장과 변화를 이끌어내는 데 도움을 줍니다. 각 단계마다 상세한 가이드와 실천 팁을 제공하므로, 사용자는 자신에게 맞는 전략을 선택하고 실행할 수 있습니다. 또한, 전략 실행 과정에서 발생할 수 있는 위험 요소와 대응 방안을 사전에 제시하여 성공 확률을 높입니다.
                            </p>
                        </div>
                    )}

                    {/* Action Panel */}
                    {activeTab === 'action' && (
                        <div className="glass-panel p-6 rounded-xl">
                            <h3 className="text-lg font-bold mb-2">실행 권고</h3>
                            <ul className="list-disc list-inside space-y-2 text-gray-300">
                                {['타협 불가한 원칙을 재정의하십시오.', '지금 즉시 한계를 시험하십시오.', '연결을 끊고 본질에 집중하십시오.'].map((action, i) => (
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
                                <Radar name="Ideal" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
                                <Radar name="Potential" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-12 flex justify-center gap-4">
                    <button onClick={exportToPdf} className="px-6 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors">
                        PDF 다운로드 (예정)
                    </button>
                    <Link href="/second-genesis/">
                        <button className="px-6 py-2 text-gray-500 hover:text-white underline underline-offset-2 transition-colors">
                            분석 다시 시작하기
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
