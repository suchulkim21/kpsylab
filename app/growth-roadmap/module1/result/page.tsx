"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { analyzeInterference } from "@growth-roadmap/lib/module1/analysisEngine";
import { adaptModule1 } from "@/lib/adapters/report-adapter";
import UnifiedReportCard from "@/components/report/UnifiedReportCard";
import type { UnifiedReportData } from "@/types/report";

export default function Module1ResultPage() {
    const router = useRouter();
    const [reportData, setReportData] = useState<UnifiedReportData | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("sg_module1_result");
        if (stored) {
            try {
                const raw = JSON.parse(stored);
                // Legacy: shadowData만 있으면 analyzeInterference로 계산
                let dominantType = raw.dominantType;
                let vector = raw.vector;
                const dataArray = Array.isArray(raw) ? raw : (raw.shadowData || []);
                if (Array.isArray(dataArray) && dataArray.length > 0 && (!vector || !dominantType)) {
                    const analysis = analyzeInterference(dataArray.map((x: any) => typeof x === "string" ? x : x?.id).filter(Boolean));
                    vector = vector ?? analysis.vector;
                    dominantType = dominantType ?? analysis.dominantType;
                }
                const adapted = adaptModule1({ dominantType, vector });
                setReportData(adapted);
            } catch (e) {
                console.error("Result parsing failed", e);
                router.push("/growth-roadmap/module1");
            }
        } else {
            router.push("/growth-roadmap/module1");
        }
    }, [router]);

    if (!reportData)
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">
                분석 결과 처리 중...
            </div>
        );

    return (
        <div className="min-h-screen bg-black text-white p-6 animate-fade-in-up relative overflow-hidden font-sans">
            <div className="max-w-4xl mx-auto pt-10 pb-20 relative z-10">
                <UnifiedReportCard data={reportData} />

                <div className="report-actions">
                    <Link href="/growth-roadmap/module1" className="report-btn-secondary">
                        재검사
                    </Link>
                    <Link href="/growth-roadmap/module2" className="report-btn-primary flex items-center gap-2">
                        다음 단계로 이동 <span className="text-xs">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
