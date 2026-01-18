"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateModule1Content } from "@second-genesis/lib/content/module1";

export default function Module1ResultPage() {
    const router = useRouter();
    const [analysis, setAnalysis] = useState<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem('sg_module1_result');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                // content generation
                const contentText = generateModule1Content(data.dominantType);

                setAnalysis({
                    dominantType: data.dominantType,
                    contentText // Long form text
                });
            } catch (e) {
                console.error("Result parsing failed", e);
                router.push('/second-genesis/module1');
            }
        } else {
            router.push('/second-genesis/module1');
        }
    }, [router]);

    if (!analysis) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">분석 결과 처리 중...</div>;

    const mapType: any = { A: "성취 지향성", B: "내면 결핍", C: "감정 회피", D: "현실 도피" };

    return (
        <div className="min-h-screen bg-black text-white p-6 animate-fade-in-up relative overflow-hidden font-sans">

            <div className="max-w-3xl mx-auto pt-10 pb-20 relative z-10">
                <header className="mb-10 text-center">
                    <span className="text-gray-500 font-mono text-xs tracking-widest border border-gray-800 bg-gray-900/50 px-3 py-1 rounded-full mb-4 inline-block">
                        진단 완료
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-100">
                        내면의 방해 요인 분석
                    </h1>
                    <p className="text-gray-400 text-sm">심층 무의식 데이터 분석 결과</p>
                </header>

                <div className="glass-panel p-8 rounded-2xl mb-12 border border-white/10 bg-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full mix-blend-screen filter blur-3xl"></div>
                    <div className="relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-red-900/20 border border-red-500/30 rounded-full">
                            <Shield className="text-red-500" size={16} />
                            <span className="text-red-400 font-bold text-sm">감지된 핵심 요인</span>
                        </div>
                        <h2 className="text-5xl font-bold text-white mb-2 tracking-tight">{mapType[analysis.dominantType]}</h2>
                    </div>
                </div>

                <div className="prose prose-invert max-w-none text-gray-300 leading-8">
                    {analysis.contentText.split("\n\n").map((paragraph: string, idx: number) => {
                        if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                            const clean = paragraph.replace(/\*\*/g, "");
                            return (
                                <div key={idx} className="mt-8 mb-4 border-l-4 border-red-500 pl-4">
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

                <div className="mt-12 flex justify-center gap-4">
                    <Link href="/second-genesis/module1">
                        <div className="px-6 py-3 border border-gray-700 text-gray-400 font-medium rounded-full hover:bg-gray-800 transition-colors text-sm cursor-pointer">
                            다시 진단하기
                        </div>
                    </Link>
                    <Link href="/second-genesis/module2">
                        <div className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors text-sm cursor-pointer flex items-center gap-2">
                            다음 단계로 이동 <span className="text-xs">→</span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
