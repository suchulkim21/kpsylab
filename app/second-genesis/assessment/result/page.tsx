"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { calculateGapAnalysis, GapAnalysisResult } from "@second-genesis/lib/analysis";
import { generateModule3Content } from "@second-genesis/lib/content/module3";

export default function AssessmentResultPage() {
    const router = useRouter();
    const [result, setResult] = useState<GapAnalysisResult | null>(null);
    const [contentText, setContentText] = useState<string>("");

    useEffect(() => {
        const stored = localStorage.getItem('sg_module3_result');
        if (!stored) {
            router.push('/second-genesis/assessment');
            return;
        }

        const { ideal, potential } = JSON.parse(stored);
        const analysis = calculateGapAnalysis(ideal, potential);
        setResult(analysis);

        // Content Generation
        const text = generateModule3Content({
            ideal,
            potential,
            strategy: analysis.strategy,
            dominantGap: analysis.dimensions.dominantGap
        });
        setContentText(text);

    }, [router]);

    if (!result) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono">분석 결과 산출 중...</div>;

    // Data for Chart
    const data = [
        { subject: '안정', A: result.ideal.stability, B: result.potential.stability, fullMark: 150 },
        { subject: '성장', A: result.ideal.growth, B: result.potential.growth, fullMark: 150 },
        { subject: '관계', A: result.ideal.relation, B: result.potential.relation, fullMark: 150 },
        { subject: '자율', A: result.ideal.autonomy, B: result.potential.autonomy, fullMark: 150 },
    ];

    // Strategy Maps
    const strategyMap: { [key: string]: string } = {
        'Alignment': '최적화 (Alignment)',
        'Expansion': '잠재력 확장 (Expansion)',
        'Correction': '방향 보정 (Correction)',
        'Pivot': '도약 전환 (Pivot)'
    };

    // Dynamic Colors based on Strategy
    const accentColor =
        result.strategy === 'Alignment' ? '#4ade80' : // Green
            result.strategy === 'Expansion' ? '#3b82f6' : // Blue
                result.strategy === 'Correction' ? '#f97316' : // Orange
                    '#ef4444'; // Red

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 animate-fade-in-up relative">

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start mt-8">

                {/* Visual Data Column */}
                <div className="lg:sticky lg:top-8 order-2 lg:order-1">
                    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>

                        <h3 className="text-sm font-mono text-gray-400 mb-8 tracking-widest text-center">벡터 분석</h3>

                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                                    <PolarGrid stroke="#333" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
                                    <Radar name="이상향" dataKey="A" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.1} />
                                    <Radar name="잠재력" dataKey="B" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.4} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="flex justify-center gap-8 mt-4 text-xs font-mono">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-purple-500 rounded-full opacity-50"></span>
                                <span className="text-purple-400">이상향 (의식)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                <span className="text-blue-400">잠재력 (무의식)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Strategy Report Column */}
                <div className="order-1 lg:order-2 flex flex-col gap-8">

                    {/* Header */}
                    <div>
                        <div className="inline-block px-3 py-1 border border-white/20 rounded-full text-xs font-mono mb-4 text-gray-400">
                            신뢰도: {result.alignmentScore}%
                        </div>
                        <h1 className="text-5xl font-bold mb-2 tracking-tight">
                            <span style={{ color: accentColor }}>{strategyMap[result.strategy]}</span>
                            <br /><span className="text-white">전략 제안</span>
                        </h1>
                    </div>

                    {/* Deep Analysis Content */}
                    <div className="prose prose-invert max-w-none text-gray-300 leading-8">
                        {contentText.split("\n\n").map((paragraph: string, idx: number) => {
                            if (paragraph.startsWith("**") && paragraph.length < 100) {
                                const clean = paragraph.replace(/\*\*/g, "");
                                return (
                                    <div key={idx} className="mt-8 mb-4 border-l-4 pl-4" style={{ borderLeftColor: accentColor }}>
                                        <h3 className="text-lg font-bold text-white m-0">{clean}</h3>
                                    </div>
                                );
                            }
                            return (
                                <p key={idx} className="mb-6 text-justify opacity-90">
                                    {paragraph.split("**").map((part, i) =>
                                        i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part
                                    )}
                                </p>
                            );
                        })}
                    </div>

                    <div className="pt-8 border-t border-gray-800 flex justify-between items-center">
                        <Link href="/second-genesis/assessment">
                            <div className="text-sm text-gray-500 hover:text-white transition-colors underline underline-offset-4 cursor-pointer">
                                재분석 수행
                            </div>
                        </Link>
                        <Link href="/second-genesis/report">
                            <div className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-purple-900/20 cursor-pointer">
                                최종 아키텍처 확인 <span className="text-xs">→</span>
                            </div>
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
