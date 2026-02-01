"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { calculateGapAnalysis, GapAnalysisResult } from "@growth-roadmap/lib/analysis";
import { generateModule3Content } from "@growth-roadmap/lib/content/module3";

export default function AssessmentResultPage() {
    const router = useRouter();
    const [result, setResult] = useState<GapAnalysisResult | null>(null);
    const [contentText, setContentText] = useState<string>("");

    useEffect(() => {
        const stored = localStorage.getItem('sg_module3_result');
        if (!stored) {
            router.push('/growth-roadmap/assessment');
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
        'Alignment': '최적화',
        'Expansion': '잠재력 확장',
        'Correction': '방향 보정',
        'Pivot': '도약 전환'
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
                    <div className="report-card relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>

                        <h3 className="report-section-label mb-6 text-left">벡터 분석</h3>

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
                <div className="order-1 lg:order-2 flex flex-col gap-8 text-left">

                    {/* Header */}
                    <div>
                        <span className="report-section-label block mb-2">
                            신뢰도: {result.alignmentScore}%
                        </span>
                        <h1 className="report-section-title">
                            <span style={{ color: accentColor }}>{strategyMap[result.strategy]}</span>
                            <span className="block mt-1">전략 제안</span>
                        </h1>
                    </div>

                    {/* Deep Analysis Content */}
                    <div className="prose prose-invert max-w-none text-left">
                        {contentText.split("\n\n").map((paragraph: string, idx: number) => {
                            if (paragraph.startsWith("**") && paragraph.length < 100) {
                                const clean = paragraph.replace(/\*\*/g, "");
                                return (
                                    <div key={idx} className="report-heading mt-8 mb-4" style={{ borderLeftColor: accentColor }}>
                                        {clean}
                                    </div>
                                );
                            }
                            return (
                                <p key={idx} className="report-body mb-6">
                                    {paragraph.split("**").map((part, i) =>
                                        i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part
                                    )}
                                </p>
                            );
                        })}
                    </div>

                    <div className="pt-8 border-t border-gray-800 report-actions justify-center">
                        <Link href="/growth-roadmap/assessment" className="report-btn-secondary">
                            재검사
                        </Link>
                        <Link href="/growth-roadmap/report" className="report-btn-primary flex items-center gap-2">
                            최종 아키텍처 확인 <span className="text-xs">→</span>
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
