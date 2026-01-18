import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface IntermediateResultProps {
    phase: number;
    result: {
        dominantTrait: string;
        description: string;
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
        <div className="w-full max-w-2xl mx-auto animate-fade-in-up p-4">
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/20 border border-green-500/30 text-green-400 text-sm font-mono mb-4">
                    <CheckCircle size={14} />
                    <span>분석 지점 도달</span>
                </div>
                <h2 className="text-3xl font-bold mb-2">{titles[phase]}</h2>
                <p className="text-sm text-gray-500 font-mono tracking-widest">{subtitles[phase]}</p>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900/50 border border-gray-700 p-8 rounded-2xl mb-12 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CheckCircle size={100} />
                </div>

                <h3 className="text-xl font-bold text-blue-400 mb-4">중간 분석 인사이트</h3>
                <div className="text-2xl font-bold text-white mb-4">{result.dominantTrait}</div>
                <p className="text-gray-300 leading-relaxed text-lg">
                    {result.description}
                </p>
            </motion.div>

            <div className="flex justify-center">
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
