'use client';

import Link from 'next/link';
import { ArrowRight, TestTube2, BarChart3, FileText, Zap } from 'lucide-react';

export default function MNPSPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/20 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-24 md:py-32">
        {/* Header */}
        <header className="text-center mb-16 space-y-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
            <TestTube2 className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
            MNPS
          </h1>
          <p className="text-blue-400 text-sm uppercase tracking-wider mt-2">
            Dark Tetrad Analysis Platform
          </p>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mt-6">
            내 안의 어둠을 과학적으로 탐구하다
            <br />
            <span className="text-gray-400 text-sm">Explore Your Inner Darkness Scientifically</span>
          </p>
        </header>

        {/* Description */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 mb-12 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">서비스 소개</h2>
            <p className="text-gray-300 leading-relaxed">
              MNPS(Multidimensional Nature Profiling System)는 다크 테트라드(Dark Tetrad) 이론을 기반으로
              당신의 내면에 숨겨진 본성을 정밀하게 측정하고 분석합니다. 위로나 공감 대신,
              냉철한 데이터와 과학적 근거를 통해 당신의 진짜 모습을 마주하게 합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-6 border-t border-zinc-800">
            <div className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <strong className="text-white">120문항 분석:</strong>
                <span className="text-gray-400 ml-2">4가지 특성을 종합 분석</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <strong className="text-white">과학적 근거:</strong>
                <span className="text-gray-400 ml-2">학계에서 검증된 연구 기반</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <strong className="text-white">상세 리포트:</strong>
                <span className="text-gray-400 ml-2">깊이 있는 해석과 활용 전략</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">MNPS 테스트 시작하기</h3>
            <p className="text-gray-300 mb-6">
              약 15-20분 소요되며, 4가지 다크 테트라드 특성을 분석합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="http://localhost:7777"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-300"
              >
                <span>MNPS 테스트 시작</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                href="/services"
                className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-colors"
              >
                서비스 소개 보기
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              * MNPS 서비스는 별도 서버에서 실행됩니다. 서버가 실행 중이지 않으면 접속할 수 없습니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
