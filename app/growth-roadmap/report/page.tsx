"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, RefreshCw, ShieldAlert, Activity, Brain, Fingerprint, ArrowRight, CheckCircle } from "lucide-react";
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    Legend, Tooltip
} from 'recharts';
import { generateFinalReportContent } from "@growth-roadmap/lib/content/finalReport";
import { getKoreanTypeName, determineTypeCode } from "@growth-roadmap/lib/content/module2";
import { FeedbackVariant } from "@growth-roadmap/lib/content/finalAnalysisEngine";
import { CompositeAnalysisEngine } from "@growth-roadmap/lib/CompositeAnalysisEngine";

export default function FinalReportPage() {
    const [reportText, setReportText] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [feedbackVariants, setFeedbackVariants] = useState<FeedbackVariant[]>([]);
    const [selectedVariantId, setSelectedVariantId] = useState<string>("v1");
    interface ScoreBundle {
        m1Raw: string;
        m2Raw: string;
        m3Raw: string;
        m3Parsed: any;
        domGap: string;
        m1Type?: string;
        typeCode?: string;
        p?: number;
        a?: number;
        sd?: number;
        m1Term?: string;
        m2Term?: string;
        gapTerm?: string;
    }

    const [scores, setScores] = useState<ScoreBundle | null>(null);

    // Calibration State
    const [calibrationNeeded, setCalibrationNeeded] = useState(false);
    const [calibrationGap, setCalibrationGap] = useState<string>("");
    const [calibrationAnswer, setCalibrationAnswer] = useState<string | null>(null); // 'A' or 'B'

    useEffect(() => {
        // Initial Data Check
        try {
            const m1Raw = localStorage.getItem('sg_module1_result');
            const m2Raw = localStorage.getItem('sg_module2_result');
            const m3Raw = localStorage.getItem('sg_module3_result');
            const storedCalibration = localStorage.getItem('sg_calibration_answer');

            if (!m1Raw || !m2Raw || !m3Raw) {
                setError("데이터가 불충분합니다");
                setLoading(false);
                return;
            }

            const m3Parsed = JSON.parse(m3Raw);

            // Determine Gap for Calibration
            let domGap = 'growth';
            if (m3Parsed.dominantGap) {
                domGap = m3Parsed.dominantGap;
            } else {
                // Fallback calculation
                let maxGap = -1;
                const dims = ['stability', 'growth', 'relation', 'autonomy'];
                dims.forEach((d: string) => {
                    const gap = Math.abs((m3Parsed.ideal?.[d] || 0) - (m3Parsed.potential?.[d] || 0));
                    if (gap > maxGap) { maxGap = gap; domGap = d; }
                });
            }

            setCalibrationGap(domGap);

            // Raw data bundle
            const scoreBundle = { m1Raw, m2Raw, m3Raw, m3Parsed, domGap };
            setScores(scoreBundle);

            // LOGIC: If stored answer exists, SKIP calibration
            if (storedCalibration) {
                // Run analysis immediately with the stored answer
                runAnalysisWithData(scoreBundle, storedCalibration, domGap);
            } else {
                // Show calibration screen
                setLoading(false);
                setCalibrationNeeded(true);
            }

        } catch (e) {
            console.error(e);
            setError("초기화 실패");
            setLoading(false);
        }
    }, []);

    const runAnalysisWithData = (data: ScoreBundle | null, answer: string, gapOverride: string) => {
        try {
            if (!data) { console.warn('runAnalysisWithData called with null data'); return; }
            const { m1Raw, m2Raw, m3Parsed } = data;

            // Process M1
            const m1Parsed = JSON.parse(m1Raw);
            const m1DataArray = Array.isArray(m1Parsed) ? m1Parsed : (m1Parsed.shadowData || []);
            const counts: any = { A: 0, B: 0, C: 0, D: 0 };
            m1DataArray.forEach((id: string) => { const t = id.split('_')[1]; if (counts[t] !== undefined) counts[t]++; });
            const sortedM1 = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1]);
            const m1Type = sortedM1[0][0];
            const m1SubType = sortedM1[1][0];

            // Process M2
            const m2Parsed = JSON.parse(m2Raw);
            const m2DataRoot = m2Parsed.analysis || m2Parsed.rawAnalysis || {};

            const p = normalize(m2DataRoot.proactivity ?? 0);
            const a = normalize(m2DataRoot.adaptability ?? 0);
            const sd = normalize(m2DataRoot.socialDistance ?? 0);

            // Type Calculation
            const typeCode = determineTypeCode({ p, a, sd });
            const m2TypeName = getKoreanTypeName(typeCode);

            // Strategy Calculation
            let m3Strategy = m3Parsed.strategy || "Correction";

            // Generate Text with Calibration Data
            const result = generateFinalReportContent({
                m1: { type: m1Type, subType: m1SubType, scoreMap: counts },
                m2: { typeCode: m2TypeName, scores: { p, a, sd } }, // Pass Name as "Code" placeholder
                m3: {
                    ideal: m3Parsed.ideal,
                    potential: m3Parsed.potential,
                    strategy: m3Strategy,
                    dominantGap: gapOverride,
                    calibration: answer
                }
            });

            // NEW: Composite Engine Integration
            const m1DataForEngine = { dominantType: m1Type };
            const m2DataForEngine = { typeCode: m2TypeName, scores: { p, a, sd } };
            const m3DataForEngine = {
                ideal: m3Parsed.ideal,
                potential: m3Parsed.potential,
                strategy: m3Strategy,
                dominantGap: gapOverride || data.domGap
            };

            const compositeEngine = new CompositeAnalysisEngine(m1DataForEngine, m2DataForEngine, m3DataForEngine);
            const compositeReport = compositeEngine.generateCompositeReport();

            // Combine with legacy variants or replace? 
            // For now, PREPEND the composite report as the main view
            const newVariants: FeedbackVariant[] = [
                { id: 'composite', title: '종합 정밀 진단', content: compositeReport },
                ...result.feedbackVariants
            ];

            setReportText(compositeReport);
            setFeedbackVariants(newVariants);
            setSelectedVariantId("composite");
            localStorage.setItem('sg_feedback_variant', "composite");

            // Chart Data
            if (m3Parsed.ideal && m3Parsed.potential) {
                setChartData([
                    { subject: '안정성', A: m3Parsed.ideal.stability, B: m3Parsed.potential.stability, fullMark: 100 },
                    { subject: '성장성', A: m3Parsed.ideal.growth, B: m3Parsed.potential.growth, fullMark: 100 },
                    { subject: '관계성', A: m3Parsed.ideal.relation, B: m3Parsed.potential.relation, fullMark: 100 },
                    { subject: '자율성', A: m3Parsed.ideal.autonomy, B: m3Parsed.potential.autonomy, fullMark: 100 },
                ]);
            }

            // Update scores state with processed data for display
            setScores(prev => ({
                ...(prev ?? {}),
                m1Type, typeCode: m2TypeName, p, a, sd,
                m1Term: result.diagnosis.m1Term,
                m2Term: result.diagnosis.m2Term,
                gapTerm: result.diagnosis.gapTerm
            } as ScoreBundle));
            setCalibrationNeeded(false);
            setLoading(false); // Make sure to turn off loading

        } catch (e) {
            console.error(e);
            setError("분석 보고서 생성 실패");
            setLoading(false);
        }
    };

    const normalize = (val: number) => Math.max(0, Math.min(100, Math.round(((val + 40) / 140) * 100)));

    const handleCalibration = (option: string) => {
        setCalibrationAnswer(option);
        // SAVE TO LOCAL STORAGE
        localStorage.setItem('sg_calibration_answer', option);

        setLoading(true); // temporary load
        setTimeout(() => {
            if (scores) {
                runAnalysisWithData(scores, option, calibrationGap);
            }
        }, 800);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-cyan-500 font-mono">
            <RefreshCw className="animate-spin mb-4" size={32} />
            <span className="text-sm tracking-widest uppercase animate-pulse">시스템 진단 실행 중...</span>
        </div>
    );

    if (error) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="z-10 bg-black/50 border border-red-900/50 p-12 rounded-lg backdrop-blur-md flex flex-col items-center max-w-lg w-full">
                    <ShieldAlert className="text-red-500 mb-6 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]" size={64} />
                    <h1 className="text-3xl font-bold mb-2 text-red-500 font-mono tracking-tighter">접근 거부됨</h1>
                    <p className="text-gray-500 mb-8 text-center text-sm font-mono uppercase tracking-wide">
                        {error}<br />진행을 위해 모든 모듈을 완료하십시오.
                    </p>
                    <Link href="/growth-roadmap" className="px-8 py-3 bg-red-900/20 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded transition-all font-mono text-xs uppercase tracking-widest">
                        대시보드로 복귀
                    </Link>
                </div>
            </div>
        );
    }

    // CALIBRATION UI
    if (calibrationNeeded) {
        let question = "";
        let optionA = "";
        let optionB = "";

        if (calibrationGap === 'relation') {
            question = "현재 대인 관계에서 가장 큰 스트레스 원인은 무엇입니까?";
            optionA = "A. 사람들과 어울리는 것이 피곤하고 기가 빨린다. (에너지 고갈)";
            optionB = "B. 혼자 남겨지거나 소외되는 것이 두렵고 불안하다. (고립 공포)";
        } else if (calibrationGap === 'growth') {
            question = "자신의 성장이나 일과 관련하여 어떤 상태에 가깝습니까?";
            optionA = "A. 해야 할 일은 많은데, 몸이 움직이지 않고 자꾸 미루게 된다. (무기력)";
            optionB = "B. 쉬지 않고 일하지만, 실질적인 성과는 없고 늘 시간에 쫓긴다. (강박적 과로)";
        } else if (calibrationGap === 'stability') {
            question = "예상치 못한 변화가 닥쳤을 때, 당신의 주된 반응은 무엇입니까?";
            optionA = "A. 스트레스를 받고 기존 방식을 고수하려 한다. (경직)";
            optionB = "B. 일단 상황에 맞춰주지만, 내 중심을 잃은 것 같아 불안하다. (타협)";
        } else { // autonomy
            question = "자신만의 길을 가는 과정에서 무엇이 가장 힘듭니까?";
            optionA = "A. 남들의 시선과 평가가 신경 쓰여 눈치를 보게 된다. (타인의존)";
            optionB = "B. 내 뜻대로 하고는 있지만, 아무도 나를 이해해주지 않아 외롭다. (고립감)";
        }

        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="z-10 max-w-2xl w-full bg-[#0a0a0a] border border-purple-500/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.1)]">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="text-purple-500 animate-pulse" size={20} />
                        <span className="text-purple-400 font-mono text-xs tracking-widest uppercase">핵심 로직 보정</span>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-8 leading-relaxed">
                        최종 분석을 위해<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">마지막 데이터 보정</span>이 필요합니다.
                    </h2>

                    <p className="text-gray-400 mb-8 text-lg">{question}</p>

                    <div className="space-y-4">
                        <button
                            onClick={() => handleCalibration('A')}
                            className="w-full p-6 text-left bg-white/5 border border-white/10 hover:bg-purple-500/10 hover:border-purple-500 transition-all rounded-xl group flex items-center justify-between"
                        >
                            <span className="text-gray-300 group-hover:text-white transition-colors">{optionA}</span>
                            <ArrowRight className="text-gray-600 group-hover:text-purple-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                        </button>
                        <button
                            onClick={() => handleCalibration('B')}
                            className="w-full p-6 text-left bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:border-blue-500 transition-all rounded-xl group flex items-center justify-between"
                        >
                            <span className="text-gray-300 group-hover:text-white transition-colors">{optionB}</span>
                            <ArrowRight className="text-gray-600 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#000000] text-gray-200 font-sans selection:bg-purple-500/30 relative">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(18,18,18,0)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0 opacity-20"></div>
            <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent z-10"></div>


            <div className="max-w-6xl mx-auto px-6 py-24 relative z-10">
                {/* Header Section */}
                <header className="mb-16 border-b border-gray-800/50 pb-8 text-left">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="report-section-label text-purple-400">
                            보안 등급: 1급
                        </span>
                        <span className="report-section-label text-blue-400">
                            분석 알고리즘 v3.1
                        </span>
                    </div>
                    <h1 className="report-section-title text-3xl md:text-5xl">
                        전술 감사 보고서
                    </h1>
                    <p className="report-section-summary mt-2">
                        심층 정밀 분석 // 대상 ID: {scores?.typeCode}-{scores?.m1Type}
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Visual Data (Sticky) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Radar Chart Card */}
                        <div className="report-card relative overflow-hidden group">
                            <div className="flex items-center gap-2 mb-6 text-left">
                                <Activity size={16} className="text-purple-400" />
                                <h3 className="report-section-label text-purple-400">벡터 격차 분석</h3>
                            </div>
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
                                        <PolarGrid stroke="#333" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#e5e7eb', fontSize: 13, fontFamily: 'monospace', fontWeight: 'bold' }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar name="이상" dataKey="A" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.1} />
                                        <Radar name="잠재" dataKey="B" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.2} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(0,0,0,0.9)',
                                                border: '1px solid #333',
                                                borderRadius: '4px',
                                                fontFamily: 'monospace',
                                                fontSize: '12px'
                                            }}
                                            itemStyle={{ color: '#ccc' }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Metric Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="report-card text-left group hover:border-red-500/30 transition-colors">
                                <Fingerprint size={24} className="text-gray-500 mb-3 group-hover:text-red-500 transition-colors" />
                                <span className="report-section-label block mb-2">핵심 무의식</span>
                                <span className="report-section-title text-lg min-h-[3rem] block">
                                    {scores?.m1Term}
                                </span>
                            </div>
                            <div className="report-card text-left group hover:border-blue-500/30 transition-colors">
                                <Brain size={24} className="text-gray-500 mb-3 group-hover:text-blue-500 transition-colors" />
                                <span className="report-section-label block mb-2">대인 전략 양상</span>
                                <span className="report-section-title text-lg min-h-[3rem] block">
                                    {scores?.m2Term}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Text Report */}
                    <div className="lg:col-span-8">
                        {/* Variant Tabs */}
                        {feedbackVariants.length > 0 && (
                            <div className="flex gap-2 mb-6">
                                {feedbackVariants.map(v => (
                                    <button
                                        key={v.id}
                                        className={`px-4 py-2 rounded ${selectedVariantId === v.id ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                                        onClick={() => {
                                            setSelectedVariantId(v.id);
                                            localStorage.setItem('sg_feedback_variant', v.id);
                                        }}
                                    >
                                        {v.title}
                                    </button>
                                ))}
                            </div>
                        )}
                        {/* Variant Content */}
                        <div className="prose prose-invert max-w-none">
                            {feedbackVariants.find(v => v.id === selectedVariantId)?.content?.split("\n\n").map((para, idx) => {
                                // 1. Handle Lists (lines starting with "- ")
                                if (para.trim().includes('\n- ') || para.trim().startsWith('- ')) {
                                    const items = para.split('\n').filter(line => line.trim().length > 0);
                                    // If the paragraph is JUST a list
                                    if (items.every(line => line.trim().startsWith('-') || line.trim().startsWith('**'))) {
                                        return (
                                            <ul key={idx} className="list-disc pl-5 space-y-2 mb-4 report-body">
                                                {items.map((item, i) => {
                                                    const cleanItem = item.replace(/^- /, '').trim();
                                                    // Parse Bold inside list item
                                                    const parts = cleanItem.split(/(\*\*.*?\*\*)/g);
                                                    return (
                                                        <li key={i}>
                                                            {parts.map((part, pIdx) =>
                                                                part.startsWith('**') && part.endsWith('**')
                                                                    ? <strong key={pIdx} className="text-purple-400 font-semibold">{part.slice(2, -2)}</strong>
                                                                    : part
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        );
                                    }
                                }

                                // 2. Handle Regular Paragraphs with Bold
                                const parts = para.split(/(\*\*.*?\*\*)/g);
                                return (
                                    <p key={idx} className="report-body mb-4 whitespace-pre-wrap">
                                        {parts.map((part, pIdx) =>
                                            part.startsWith('**') && part.endsWith('**')
                                                ? <strong key={pIdx} className="text-purple-400 font-semibold">{part.slice(2, -2)}</strong>
                                                : part
                                        )}
                                    </p>
                                );
                            })}
                        </div>
                        <footer className="mt-24 pt-12 border-t border-dashed border-gray-800/50 flex flex-col items-center text-center">
                            <div className="w-8 h-8 border border-gray-700 rotate-45 mb-6 flex items-center justify-center">
                                <div className="w-2 h-2 bg-gray-500"></div>
                            </div>
                            <p className="text-xs font-mono text-gray-600 uppercase tracking-[0.2em] mb-2">
                                시스템 로직: 최종 분석 엔진 // 상태: 검증됨
                            </p>
                            <p className="text-[10px] text-gray-700">
                                본 문서는 대상자의 전용 분석 결과입니다.<br />
                                무단 배포를 엄격히 금지합니다.
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}
