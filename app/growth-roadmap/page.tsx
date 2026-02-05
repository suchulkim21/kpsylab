"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Activity, Brain, BarChart3, Check, Lock, Sparkles, X } from "lucide-react";
import { analyzeInterference } from "@growth-roadmap/lib/module1/analysisEngine";
import { calculateGapAnalysis } from "@growth-roadmap/lib/analysis";

// Helper Interface
interface ModuleStatus {
    m1: string | null; // e.g., "성취 지향성" or null
    m1Type: string | null; // A, B, C, D for teaser
    m2: string | null; // e.g., "체제 혁신가" or null
    m3: string | null; // e.g., "신뢰도 85% (일치)" or null
}

/** 모듈1 완료 시 SNS 공유용 티저 문장 */
function getM1Teaser(type: string | null): string | null {
    if (!type) return null;
    const map: Record<string, string> = {
        A: "당신의 경로를 막는 가장 큰 요인은 '완벽주의'입니다.",
        B: "당신의 경로를 막는 가장 큰 요인은 '타인의 인정에 대한 갈망'입니다.",
        C: "당신의 경로를 막는 가장 큰 요인은 '감정 차단'입니다.",
        D: "당신의 경로를 막는 가장 큰 요인은 '회피 습관'입니다."
    };
    return map[type] || null;
}

function getProgressMessage(completed: number): { main: string; sub: string } {
    switch (completed) {
        case 0: return { main: "데이터 스캔 대기 중", sub: "1단계 완료 시 시스템 병목 분석 결과 확인" };
        case 1: return { main: "아키텍처 구성 중", sub: "2단계 완료 시 현재 아키텍처 맵 공개" };
        case 2: return { main: "데이터 동기화 중", sub: "3단계 완료 시 통합 블루프린트 발행" };
        default: return { main: "시스템 통합 블루프린트 준비 완료", sub: "생애 최적화 도면에서 종합 결과를 확인하세요" };
    }
}

const ONBOARDING_KEY = "mind_architect_onboarding_seen";

export default function Home() {
    const [results, setResults] = useState<ModuleStatus>({
        m1: null,
        m1Type: null,
        m2: null,
        m3: null
    });
    const [showOnboarding, setShowOnboarding] = useState(false);

    const completedCount = [results.m1, results.m2, results.m3].filter(Boolean).length;
    const progressPercent = Math.round((completedCount / 3) * 100);
    const progressMsg = getProgressMessage(completedCount);

    useEffect(() => {
        // Module 1 Logic
        const m1Raw = localStorage.getItem('sg_module1_result');
        let m1Result: string | null = null;
        let m1Type: string | null = null;
        if (m1Raw) {
            try {
                const parsed = JSON.parse(m1Raw);
                const data = Array.isArray(parsed) ? parsed : (parsed.shadowData || []);

                if (Array.isArray(data) && data.length > 0) {
                    const analysis = analyzeInterference(data);
                    const loopMap: Record<string, string> = { A: "성취 지향성", B: "내면 결핍", C: "감정 회피", D: "현실 도피" };
                    m1Result = loopMap[analysis.dominantType] || "분석 완료";
                    m1Type = analysis.dominantType ?? null;
                } else if (m1Raw.length > 10) {
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

        setResults({ m1: m1Result, m1Type, m2: m2Result, m3: m3Result });

        // 최초 진입 시 온보딩 배너 표시
        if (typeof window !== "undefined" && !localStorage.getItem(ONBOARDING_KEY)) {
            setShowOnboarding(true);
        }
    }, []);

    const dismissOnboarding = () => {
        setShowOnboarding(false);
        if (typeof window !== "undefined") {
            localStorage.setItem(ONBOARDING_KEY, "true");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">

            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

            <div className="z-10 text-center max-w-5xl w-full">
                {/* 온보딩 배너 - 최초 진입 시 표시 */}
                {showOnboarding && (
                    <div className="mb-8 relative rounded-xl border border-purple-500/30 bg-purple-950/40 p-6 text-left backdrop-blur-sm">
                        <button
                            onClick={dismissOnboarding}
                            className="absolute top-4 right-4 p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            aria-label="닫기"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-bold text-purple-300 mb-2 pr-8">
                            3단계로 완성하는 나의 심리 지도
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                            3개 모듈을 순서대로 진행하면 당신만의 통합 리포트가 완성됩니다.
                        </p>
                        <ul className="text-gray-400 text-sm space-y-1">
                            <li>· 1단계: 내가 자꾸 실패하는 심리적 원인 찾기</li>
                            <li>· 2단계: 남들이 보는 나의 모습 분석하기</li>
                            <li>· 3단계: 원하는 미래로 가는 길 찾기</li>
                        </ul>
                    </div>
                )}

                <div className="mb-8">
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
                        마인드 아키텍터
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 font-mono tracking-widest">
                        통합 심리 분석 아키텍처
                    </p>
                </div>

                {/* 전체 진행률 프로그레스 바 */}
                <div className="mb-10 max-w-md mx-auto">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500 font-mono">진행률</span>
                        <span className="text-sm font-bold text-purple-400">{progressPercent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-700 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <p className="mt-3 text-sm text-gray-400">{progressMsg.main}</p>
                    {progressMsg.sub && <p className="text-xs text-gray-500 mt-1">{progressMsg.sub}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Module 1 */}
                    <div className={`group relative h-full border p-8 rounded-2xl transition-all duration-300 flex flex-col items-center relative overflow-hidden
                        ${results.m1 
                            ? 'border-red-500/50 bg-red-950/20 shadow-[0_0_30px_rgba(239,68,68,0.15)] hover:shadow-[0_0_40px_rgba(239,68,68,0.2)]' 
                            : 'border-gray-800 bg-gray-900/50 hover:border-red-500/50 hover:bg-gray-900/80'}`}>
                        <Link href={results.m1 ? "/growth-roadmap/module1/result" : "/growth-roadmap/module1"} className="flex flex-col items-center flex-1">
                            {results.m1 && (
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40">
                                    <Check className="w-4 h-4 text-red-400" />
                                    <span className="text-xs font-bold text-red-400">1단계 완료</span>
                                </div>
                            )}
                            <div className={`mb-6 p-4 rounded-full transition-colors ${results.m1 ? "bg-red-500/20" : "bg-gray-800 group-hover:bg-red-900/20"}`}>
                                <Activity size={32} className={results.m1 ? "text-red-500" : "text-gray-400 group-hover:text-red-500"} />
                            </div>
                            <h2 className="text-2xl font-bold mb-1">시스템 병목 분석</h2>
                            <p className="text-xs text-gray-500 mb-2">비효율적 사고 루프·핵심 병목 지점을 데이터로 식별</p>
                            {results.m1 && getM1Teaser(results.m1Type) ? (
                                <p className="text-sm text-red-400/90 mb-4 font-medium italic">&quot;{getM1Teaser(results.m1Type)}&quot;</p>
                            ) : (
                                <p className="text-sm text-gray-400 mb-4">내가 자꾸 실패하는 심리적 원인 찾기</p>
                            )}
                            <span className={`text-sm px-3 py-1 rounded border font-bold ${results.m1 ? "border-red-500 text-red-400 bg-red-500/5" : "border-gray-700 text-gray-500"}`}>
                                {results.m1 || "분석 시작"}
                            </span>
                        </Link>
                        {results.m1 && (
                            <Link
                                href="/growth-roadmap/module1"
                                className="mt-4 text-xs text-red-400/80 hover:text-red-400 underline underline-offset-2"
                            >
                                재검사
                            </Link>
                        )}
                    </div>

                    {/* Module 2 */}
                    <div className={`group relative h-full border p-8 rounded-2xl transition-all duration-300 flex flex-col items-center relative overflow-hidden
                        ${results.m2 
                            ? 'border-blue-500/50 bg-blue-950/20 shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]' 
                            : 'border-gray-800 bg-gray-900/50 hover:border-blue-500/50 hover:bg-gray-900/80'}`}>
                        <Link href={results.m2 ? "/growth-roadmap/module2/result" : "/growth-roadmap/module2"} className="flex flex-col items-center flex-1">
                            {results.m2 && (
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/40">
                                    <Check className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs font-bold text-blue-400">2단계 완료</span>
                                </div>
                            )}
                            <div className={`mb-6 p-4 rounded-full transition-colors ${results.m2 ? "bg-blue-500/20" : "bg-gray-800 group-hover:bg-blue-900/20"}`}>
                                <Brain size={32} className={results.m2 ? "text-blue-500" : "text-gray-400 group-hover:text-blue-500"} />
                            </div>
                            <h2 className="text-2xl font-bold mb-1">현재 아키텍처 맵</h2>
                            <p className="text-xs text-gray-500 mb-2">사회에서 나를 어떻게 인식하는지 객관적으로 볼 수 있어요</p>
                            <p className="text-sm text-gray-400 mb-4">남들이 보는 나의 모습 분석하기</p>
                            <span className={`text-sm px-3 py-1 rounded border font-bold ${results.m2 ? "border-blue-500 text-blue-400 bg-blue-500/5" : "border-gray-700 text-gray-500"}`}>
                                {results.m2 || "분석 시작"}
                            </span>
                        </Link>
                        {results.m2 && (
                            <Link
                                href="/growth-roadmap/module2"
                                className="mt-4 text-xs text-blue-400/80 hover:text-blue-400 underline underline-offset-2"
                            >
                                재검사
                            </Link>
                        )}
                    </div>

                    {/* Module 3 */}
                    <div className={`group relative h-full border p-8 rounded-2xl transition-all duration-300 flex flex-col items-center relative overflow-hidden
                        ${results.m3 
                            ? 'border-purple-500/50 bg-purple-950/20 shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]' 
                            : 'border-gray-800 bg-gray-900/50 hover:border-purple-500/50 hover:bg-gray-900/80'}`}>
                        <Link href={results.m3 ? "/growth-roadmap/assessment/result" : "/growth-roadmap/assessment"} className="flex flex-col items-center flex-1">
                            {results.m3 && (
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/40">
                                    <Check className="w-4 h-4 text-purple-400" />
                                    <span className="text-xs font-bold text-purple-400">3단계 완료</span>
                                </div>
                            )}
                            <div className={`mb-6 p-4 rounded-full transition-colors ${results.m3 ? "bg-purple-500/20" : "bg-gray-800 group-hover:bg-purple-900/20"}`}>
                                <BarChart3 size={32} className={results.m3 ? "text-purple-500" : "text-gray-400 group-hover:text-purple-500"} />
                            </div>
                            <h2 className="text-2xl font-bold mb-1">타겟 컨피그레이션</h2>
                            <p className="text-xs text-gray-500 mb-2">지향하는 최적 상태를 설계 목표치로 정의·격차 전략 도출</p>
                            <p className="text-sm text-gray-400 mb-4">자원을 가장 효율적으로 배분할 목표 설계 수립</p>
                            <span className={`text-sm px-3 py-1 rounded border font-bold ${results.m3 ? "border-purple-500 text-purple-400 bg-purple-500/5" : "border-gray-700 text-gray-500"}`}>
                                {results.m3 || "분석 시작"}
                            </span>
                        </Link>
                        {results.m3 && (
                            <Link
                                href="/growth-roadmap/assessment"
                                className="mt-4 text-xs text-purple-400/80 hover:text-purple-400 underline underline-offset-2"
                            >
                                재검사
                            </Link>
                        )}
                    </div>
                </div>

                <div className="mt-8">
                    {(results.m1 && results.m2 && results.m3) ? (
                        <Link href="/growth-roadmap/report" className="group/btn px-12 py-4 rounded-full font-bold text-lg tracking-widest transition-all duration-300 flex items-center gap-4 mx-auto bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] w-fit">
                            <Sparkles className="w-5 h-5 text-black group-hover/btn:animate-pulse" />
                            최종 아키텍처 확인 <ArrowRight />
                        </Link>
                    ) : (
                        <button
                            className="px-12 py-4 rounded-full font-bold text-lg tracking-widest transition-all duration-300 flex items-center gap-4 mx-auto bg-gray-900 text-gray-600 border border-gray-800 hover:bg-gray-800 cursor-not-allowed"
                            disabled
                        >
                            최종 아키텍처 확인 <Lock className="w-5 h-5" />
                        </button>
                    )}
                    {!(results.m1 && results.m2 && results.m3) && (
                        <p className="mt-4 text-gray-400 text-sm">
                            {progressMsg.main}
                        </p>
                    )}
                </div>

                <footer className="mt-20 text-gray-700 text-xs font-mono">
                    시스템 버전 3.1.0 (통합형) | 마인드 아키텍터 프로젝트
                </footer>
            </div>
        </div>
    );
}
