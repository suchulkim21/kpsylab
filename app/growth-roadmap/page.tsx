"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Activity, Brain, BarChart3 } from "lucide-react";
import { analyzeInterference } from "@growth-roadmap/lib/module1/analysisEngine";
import { calculateGapAnalysis } from "@growth-roadmap/lib/analysis";

// Helper Interface
interface ModuleStatus {
    m1: string | null; // e.g., "타인 인정 추구 (A형)" or null
    m2: string | null; // e.g., "체제 혁신가" or null
    m3: string | null; // e.g., "신뢰도 85% (일치)" or null
}

export default function Home() {
    const [results, setResults] = useState<ModuleStatus>({
        m1: null,
        m2: null,
        m3: null
    });

    useEffect(() => {
        // Module 1 Logic
        const m1Raw = localStorage.getItem('sg_module1_result');
        let m1Result = null;
        if (m1Raw) {
            try {
                const parsed = JSON.parse(m1Raw);
                // Handle both object wrapper and raw array
                const data = Array.isArray(parsed) ? parsed : (parsed.shadowData || []);

                if (Array.isArray(data) && data.length > 0) {
                    const analysis = analyzeInterference(data);
                    const loopMap: any = { A: "성취 지향성", B: "내면 결핍", C: "감정 회피", D: "현실 도피" };
                    m1Result = loopMap[analysis.dominantType] || "분석 완료";
                } else if (m1Raw.length > 10) {
                    // Fallback if parsing fails but data exists
                    m1Result = "분석 완료";
                }
            } catch (e) { console.error("M1 Parse Error", e); m1Result = "분석 완료"; }
        }

        // Module 2 Logic
        const m2Raw = localStorage.getItem('sg_module2_result');
        let m2Result = null;
        if (m2Raw) {
            try {
                const parsed = JSON.parse(m2Raw);
                // New structure has socialArchetype
                if (parsed.report?.socialArchetype?.title) {
                    m2Result = parsed.report.socialArchetype.title.split('(')[0].trim();
                } else if (parsed.report?.title) {
                    // Fallback for non-legacy but older structure if any
                    m2Result = parsed.report.title.split('(')[0].trim();
                } else if (parsed.analysis || parsed.scores) {
                    // Newest structure has no report, so if analysis exists, it's done.
                    // Ideally we run the engine here, but to keep it simple and safe:
                    m2Result = "분석 완료";
                }
            } catch (e) { console.error("M2 Parse Error", e); }
        }

        // Module 3 Logic
        const m3Raw = localStorage.getItem('sg_module3_result');
        let m3Result = null;
        if (m3Raw) {
            try {
                const parsed = JSON.parse(m3Raw);
                if (parsed.ideal && parsed.potential) {
                    const analysis = calculateGapAnalysis(parsed.ideal, parsed.potential);
                    const stratMap: any = { 'Alignment': '일치', 'Expansion': '확장', 'Correction': '보정', 'Pivot': '전환' };
                    m3Result = `신뢰도 ${analysis.alignmentScore}% [${stratMap[analysis.strategy]}]`;
                }
            } catch (e) { console.error("M3 Parse Error", e); }
        }

        setResults({ m1: m1Result, m2: m2Result, m3: m3Result });
    }, []);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

            <div className="z-10 text-center max-w-5xl w-full">
                <div className="mb-12">
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
                        성장 로드맵
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 font-mono tracking-widest">
                        통합 심리 분석 아키텍처
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Module 1 */}
                    <Link href={results.m1 ? "/growth-roadmap/module1/result" : "/growth-roadmap/module1"} className="group relative">
                        <div className={`h-full border border-gray-800 bg-gray-900/50 p-8 rounded-2xl hover:border-red-500/50 transition-all duration-300 hover:bg-gray-900/80 flex flex-col items-center ${results.m1 ? 'border-red-900/50' : ''}`}>
                            <div className="mb-6 p-4 rounded-full bg-gray-800 group-hover:bg-red-900/20 transition-colors">
                                <Activity size={32} className={results.m1 ? "text-red-500" : "text-gray-400 group-hover:text-red-500"} />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">성장 저해 요인</h2>
                            <p className="text-sm text-gray-500 mb-4 font-mono">내면 방해 요인</p>
                            <span className={`text-sm px-3 py-1 rounded border font-bold ${results.m1 ? "border-red-500 text-red-400" : "border-gray-700 text-gray-500"}`}>
                                {results.m1 || "분석 시작"}
                            </span>
                        </div>
                    </Link>

                    {/* Module 2 */}
                    <Link href={results.m2 ? "/growth-roadmap/module2/result" : "/growth-roadmap/module2"} className="group relative">
                        <div className={`h-full border border-gray-800 bg-gray-900/50 p-8 rounded-2xl hover:border-blue-500/50 transition-all duration-300 hover:bg-gray-900/80 flex flex-col items-center ${results.m2 ? 'border-blue-900/50' : ''}`}>
                            <div className="mb-6 p-4 rounded-full bg-gray-800 group-hover:bg-blue-900/20 transition-colors">
                                <Brain size={32} className={results.m2 ? "text-blue-500" : "text-gray-400 group-hover:text-blue-500"} />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">현 상태 분석</h2>
                            <p className="text-sm text-gray-500 mb-4 font-mono">사회적 아키타입</p>
                            <span className={`text-sm px-3 py-1 rounded border font-bold ${results.m2 ? "border-blue-500 text-blue-400" : "border-gray-700 text-gray-500"}`}>
                                {results.m2 || "분석 시작"}
                            </span>
                        </div>
                    </Link>

                    {/* Module 3 */}
                    <Link href={results.m3 ? "/growth-roadmap/assessment/result" : "/growth-roadmap/assessment"} className="group relative">
                        <div className={`h-full border border-gray-800 bg-gray-900/50 p-8 rounded-2xl hover:border-purple-500/50 transition-all duration-300 hover:bg-gray-900/80 flex flex-col items-center ${results.m3 ? 'border-purple-900/50' : ''}`}>
                            <div className="mb-6 p-4 rounded-full bg-gray-800 group-hover:bg-purple-900/20 transition-colors">
                                <BarChart3 size={32} className={results.m3 ? "text-purple-500" : "text-gray-400 group-hover:text-purple-500"} />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">이상향 및 잠재력</h2>
                            <p className="text-sm text-gray-500 mb-4 font-mono">이상과 현실의 차이</p>
                            <span className={`text-sm px-3 py-1 rounded border font-bold ${results.m3 ? "border-purple-500 text-purple-400" : "border-gray-700 text-gray-500"}`}>
                                {results.m3 || "분석 시작"}
                            </span>
                        </div>
                    </Link>
                </div>
                {/* Additional Link Box */}
                <Link href="/growth-roadmap/guide" className="group relative">
                    <div className={`h-full border border-gray-800 bg-gray-900/50 p-8 rounded-2xl hover:border-green-500/50 transition-all duration-300 hover:bg-gray-900/80 flex flex-col items-center`}>
                        <div className="mb-6 p-4 rounded-full bg-gray-800 group-hover:bg-green-900/20 transition-colors">
                            <ArrowRight size={32} className="text-gray-400 group-hover:text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">가이드</h2>
                        <p className="text-sm text-gray-500 mb-4 font-mono">프로젝트 가이드</p>
                        <span className="text-sm px-3 py-1 rounded border font-bold border-gray-700 text-gray-500">바로 보기</span>
                    </div>
                </Link>

                <div className="mt-8">
                    {(results.m1 && results.m2 && results.m3) ? (
                        <Link href="/growth-roadmap/report" className="px-12 py-4 rounded-full font-bold text-lg tracking-widest transition-all duration-300 flex items-center gap-4 mx-auto bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] w-fit">
                            최종 아키텍처 확인 <ArrowRight />
                        </Link>
                    ) : (
                        <button
                            className="px-12 py-4 rounded-full font-bold text-lg tracking-widest transition-all duration-300 flex items-center gap-4 mx-auto bg-gray-900 text-gray-600 border border-gray-800 hover:bg-gray-800 cursor-not-allowed"
                            disabled
                        >
                            최종 아키텍처 확인 <ArrowRight />
                        </button>
                    )}
                    {!(results.m1 && results.m2 && results.m3) && (
                        <p className="mt-4 text-gray-600 text-sm">
                            * 모든 검사가 완료되어야 최종 리포트를 확인하실 수 있습니다.
                        </p>
                    )}
                </div>

                <footer className="mt-20 text-gray-700 text-xs font-mono">
                    System Version: 3.1.0 (INTEGRATED) | Project Growth Roadmap
                </footer>
            </div>
        </div>
    );
}
