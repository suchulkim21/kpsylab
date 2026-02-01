"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function IntegrationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState("데이터 수신 대기 중...");

    useEffect(() => {
        const source = searchParams.get('source');
        const data = searchParams.get('data');

        if (source && data) {
            try {
                const parsedData = JSON.parse(decodeURIComponent(data));

                // Save to Module 3's LocalStorage (Central Storage)
                if (source === 'module1') {
                    localStorage.setItem('sg_module1_result', JSON.stringify(parsedData));
                    setStatus("모듈 1 데이터 통합 완료.");
                } else if (source === 'module2') {
                    localStorage.setItem('sg_module2_result', JSON.stringify(parsedData));
                    setStatus("모듈 2 데이터 통합 완료.");
                }

                // Auto-redirect to Final Report after short delay
                setTimeout(() => {
                    router.push('/growth-roadmap/report');
                }, 1500);

            } catch (e) {
                console.error("Integration Parsing Error", e);
                setStatus("데이터 손상 감지. 통합 실패.");
            }
        } else {
            setStatus("유효하지 않은 데이터 소스입니다.");
            setTimeout(() => router.push('/growth-roadmap/'), 2000);
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
            <h1 className="text-2xl font-bold mb-4 animate-pulse text-blue-500">SYSTEM SYNC</h1>
            <p className="font-mono text-gray-400">{status}</p>
        </div>
    );
}

export default function IntegrationPage() {
    return (
        <Suspense fallback={<div className="text-white">통합 중...</div>}>
            <IntegrationContent />
        </Suspense>
    );
}
