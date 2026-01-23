import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface IntermediateResultProps {
    phase: number;
    result: {
        dominantTrait: string;
        description: string;
        detailedAnalysis?: string;
        implications?: string;
        strengths?: string;
        considerations?: string;
        psychologicalProfile?: string;
        behavioralPatterns?: string;
        neurologicalInsights?: string;
        relationshipDynamics?: string;
        careerMatches?: string;
        dailyLifeApplication?: string;
        developmentPath?: string;
        expertRecommendations?: string;
        caseStudyExample?: string;
        riskFactors?: string;
        growthOpportunities?: string;
        learningStyle?: string;
        communicationStyle?: string;
        leadershipStyle?: string;
        stressResponsePattern?: string;
        decisionMakingStyle?: string;
        teamworkCharacteristics?: string;
        growthStageGuide?: string;
        practicalScenarios?: string;
        comparisonAnalysis?: string;
        improvementPlan?: string;
        successMetrics?: string;
        percentages?: { proactivity: number; adaptability: number; socialDistance: number };
        percentiles?: { proactivity: string; adaptability: string; socialDistance: string };
    } | null;
    onNext: () => void;
}

export default function IntermediateResult({ phase, result, onNext }: IntermediateResultProps) {
    if (!result) return null;

    const titles = [
        "분석 시작",
        "자극 수용성 분석 완료",
        "위기 대처력 분석 완료",
        "사회적 아키타입 분석 완료", // Phase 3
    ];

    const subtitles = [
        "",
        "단계 01 // 자극 제어 분석",
        "단계 02 // 심리적 저항 분석",
        "단계 03 // 사회적 관계 분석",
    ];

    return (
        <div className="w-full max-w-5xl mx-auto animate-fade-in-up p-4 pb-20">
            <div className="text-center mb-10 sticky top-0 z-10 bg-black/80 backdrop-blur-sm pb-4 border-b border-gray-800">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/20 border border-green-500/30 text-green-400 text-sm font-mono mb-4">
                    <CheckCircle size={14} />
                    <span>분석 지점 도달</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">{titles[phase]}</h2>
                <p className="text-sm text-gray-500 font-mono tracking-widest">{subtitles[phase]}</p>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900/50 border border-gray-700 p-6 md:p-8 rounded-2xl mb-6 relative overflow-hidden space-y-6"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <CheckCircle size={120} />
                </div>

                <div className="relative z-10">
                    <div className="mb-6 pb-6 border-b border-gray-700">
                        <h3 className="text-2xl font-bold text-blue-400 mb-3">중간 분석 인사이트</h3>
                        <div className="text-3xl md:text-4xl font-black text-white mb-3">{result.dominantTrait}</div>
                        <p className="text-gray-300 leading-relaxed text-lg">
                            {result.description}
                        </p>
                        {result.percentages && (
                            <div className="mt-4 flex flex-wrap gap-3 text-sm">
                                <span className="px-3 py-1 bg-blue-900/30 border border-blue-700/50 rounded-full text-blue-300">
                                    주도성: {result.percentages.proactivity}%
                                </span>
                                <span className="px-3 py-1 bg-green-900/30 border border-green-700/50 rounded-full text-green-300">
                                    적응력: {result.percentages.adaptability}%
                                </span>
                                <span className="px-3 py-1 bg-purple-900/30 border border-purple-700/50 rounded-full text-purple-300">
                                    사회적 거리감: {result.percentages.socialDistance}%
                                </span>
                            </div>
                        )}
                    </div>

                {result.detailedAnalysis && (
                    <div className="mb-6 p-5 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <h4 className="text-xl font-bold text-blue-300 mb-4 flex items-center gap-2">
                            <span className="text-2xl">📊</span>
                            <span>상세 분석</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-base whitespace-pre-line">
                            {result.detailedAnalysis}
                        </p>
                    </div>
                )}

                {result.implications && (
                    <div className="mb-6 p-5 bg-blue-900/20 border border-blue-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-blue-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">💼</span>
                            <span>실전 적용</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-base">
                            {result.implications}
                        </p>
                    </div>
                )}

                {result.strengths && (
                    <div className="mb-6 p-5 bg-green-900/20 border border-green-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-green-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">✨</span>
                            <span>강점</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                            {result.strengths}
                        </p>
                    </div>
                )}

                {result.considerations && (
                    <div className="mb-6 p-5 bg-amber-900/20 border border-amber-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-amber-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">⚖️</span>
                            <span>고려사항</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-base whitespace-pre-line">
                            {result.considerations}
                        </p>
                    </div>
                )}

                {result.psychologicalProfile && (
                    <div className="mb-6 p-5 bg-purple-900/20 border border-purple-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">🧠</span>
                            <span>심리학적 프로필</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-base">
                            {result.psychologicalProfile}
                        </p>
                    </div>
                )}

                {result.behavioralPatterns && (
                    <div className="mb-6 p-5 bg-indigo-900/20 border border-indigo-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-indigo-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">📋</span>
                            <span>행동 패턴 분석</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-base whitespace-pre-line">
                            {result.behavioralPatterns}
                        </p>
                    </div>
                )}

                {result.neurologicalInsights && (
                    <div className="mb-6 p-5 bg-purple-900/20 border border-purple-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">⚗️</span>
                            <span>신경과학적 인사이트</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-base">
                            {result.neurologicalInsights}
                        </p>
                    </div>
                )}

                {result.relationshipDynamics && (
                    <div className="mb-6 p-5 bg-pink-900/20 border border-pink-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-pink-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">👥</span>
                            <span>관계에서의 영향</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-base">
                            {result.relationshipDynamics}
                        </p>
                    </div>
                )}

                {result.careerMatches && (
                    <div className="mb-6 p-5 bg-cyan-900/20 border border-cyan-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-cyan-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">💼</span>
                            <span>최적의 커리어 매칭</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line font-mono">
                            {result.careerMatches}
                        </p>
                    </div>
                )}

                {result.dailyLifeApplication && (
                    <div className="mb-6 p-5 bg-teal-900/20 border border-teal-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-teal-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">🏠</span>
                            <span>일상생활 적용법</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-base whitespace-pre-line">
                            {result.dailyLifeApplication}
                        </p>
                    </div>
                )}

                {result.developmentPath && (
                    <div className="mb-6 p-5 bg-emerald-900/20 border border-emerald-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-emerald-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">📈</span>
                            <span>발전 경로</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                            {result.developmentPath}
                        </p>
                    </div>
                )}

                {result.expertRecommendations && (
                    <div className="mb-6 p-5 bg-yellow-900/20 border border-yellow-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-yellow-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">💡</span>
                            <span>전문가 추천</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-base whitespace-pre-line">
                            {result.expertRecommendations}
                        </p>
                    </div>
                )}

                {result.caseStudyExample && (
                    <div className="mb-6 p-5 bg-violet-900/20 border border-violet-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-violet-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">📚</span>
                            <span>실제 사례</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                            {result.caseStudyExample}
                        </p>
                    </div>
                )}

                {result.riskFactors && (
                    <div className="mb-6 p-5 bg-red-900/20 border border-red-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-red-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">⚠️</span>
                            <span>주의해야 할 리스크</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-base whitespace-pre-line">
                            {result.riskFactors}
                        </p>
                    </div>
                )}

                {result.growthOpportunities && (
                    <div className="mb-6 p-5 bg-blue-900/20 border border-blue-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-blue-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">🚀</span>
                            <span>성장 기회</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-base whitespace-pre-line">
                            {result.growthOpportunities}
                        </p>
                    </div>
                )}

                {result.learningStyle && (
                    <div className="mb-6 p-5 bg-sky-900/20 border border-sky-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-sky-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">📖</span>
                            <span>학습 스타일</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                            {result.learningStyle}
                        </p>
                    </div>
                )}

                {result.communicationStyle && (
                    <div className="mb-6 p-5 bg-orange-900/20 border border-orange-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-orange-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">💬</span>
                            <span>커뮤니케이션 스타일</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                            {result.communicationStyle}
                        </p>
                    </div>
                )}

                {result.leadershipStyle && (
                    <div className="mb-6 p-5 bg-rose-900/20 border border-rose-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-rose-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">👑</span>
                            <span>리더십 스타일</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                            {result.leadershipStyle}
                        </p>
                    </div>
                )}

                {result.stressResponsePattern && (
                    <div className="mb-6 p-5 bg-red-900/20 border border-red-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-red-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">⚡</span>
                            <span>스트레스 반응 패턴</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                            {result.stressResponsePattern}
                        </p>
                    </div>
                )}

                {result.decisionMakingStyle && (
                    <div className="mb-6 p-5 bg-lime-900/20 border border-lime-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-lime-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">⚖️</span>
                            <span>의사결정 스타일</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                            {result.decisionMakingStyle}
                        </p>
                    </div>
                )}

                {result.teamworkCharacteristics && (
                    <div className="mb-6 p-5 bg-fuchsia-900/20 border border-fuchsia-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-fuchsia-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">🤝</span>
                            <span>팀워크 특성</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                            {result.teamworkCharacteristics}
                        </p>
                    </div>
                )}

                {result.growthStageGuide && (
                    <div className="mb-6 p-5 bg-emerald-900/20 border border-emerald-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-emerald-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">📊</span>
                            <span>성장 단계별 가이드</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-xs whitespace-pre-line font-mono">
                            {result.growthStageGuide}
                        </p>
                    </div>
                )}

                {result.practicalScenarios && (
                    <div className="mb-6 p-5 bg-amber-900/20 border border-amber-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-amber-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">🎯</span>
                            <span>실전 적용 시나리오</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                            {result.practicalScenarios}
                        </p>
                    </div>
                )}

                {result.comparisonAnalysis && (
                    <div className="mb-6 p-5 bg-teal-900/20 border border-teal-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-teal-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">🔀</span>
                            <span>다른 유형과의 비교</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                            {result.comparisonAnalysis}
                        </p>
                    </div>
                )}

                {result.improvementPlan && (
                    <div className="mb-6 p-5 bg-indigo-900/20 border border-indigo-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-indigo-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">📅</span>
                            <span>90일 개선 계획</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                            {result.improvementPlan}
                        </p>
                    </div>
                )}

                {result.successMetrics && (
                    <div className="mb-6 p-5 bg-cyan-900/20 border border-cyan-700/30 rounded-xl">
                        <h4 className="text-lg font-bold text-cyan-300 mb-3 flex items-center gap-2">
                            <span className="text-xl">📈</span>
                            <span>성공 지표 (KPI)</span>
                        </h4>
                        <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line font-mono">
                            {result.successMetrics}
                        </p>
                    </div>
                )}
                </div>
            </motion.div>

            <div className="flex justify-center mt-8 sticky bottom-4 z-10">
                <button
                    onClick={onNext}
                    className="px-10 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] text-lg flex items-center gap-2 group"
                >
                    다음 단계 진행
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
