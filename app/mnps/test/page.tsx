"use client";

import Link from "next/link";

export default function TestPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-8">
            <h1 className="text-4xl font-bold mb-6">MNPS 테스트 페이지</h1>
            <p className="text-lg mb-8 text-center max-w-2xl">
                여기서는 MNPS 포털의 테스트 기능을 확인할 수 있습니다.
                필요에 따라 테스트 시나리오를 추가하세요.
            </p>
            <Link
                href="/mnps"
                className="rounded-full bg-cyan-600 px-6 py-3 text-lg font-medium text-white hover:bg-cyan-500 transition-colors"
            >
                MNPS 메인으로 돌아가기
            </Link>
        </main>
    );
}
