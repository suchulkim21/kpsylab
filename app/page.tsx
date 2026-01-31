'use client';

import Link from "next/link";
import { ArrowRight, TestTube2, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="page">
      {/* 히어로 */}
      <section className="text-center py-16 md:py-24">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
          www.kpsylab.com
        </h1>
        <p className="text-lg text-gray-300 mb-1">
          심리 분석 통합 서비스 플랫폼
        </p>
        <p className="text-sm text-gray-400">
          두 가지 심리 테스트로 자신을 발견하세요
        </p>
      </section>

      {/* 두 가지 테스트 카드 */}
      <section className="page-container max-w-5xl mx-auto pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* MNPS */}
          <Link
            href="/mnps/test"
            className="group block rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:border-cyan-500/50 hover:bg-zinc-900 transition-all duration-300 overflow-hidden"
          >
            <div className="p-8 md:p-10">
              <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6">
                <TestTube2 className="w-7 h-7 text-cyan-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                MNPS
              </h2>
              <p className="text-xl font-bold text-cyan-300 mb-6">
                내 안의 어둠을 과학적으로 탐구하다
              </p>
              
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-3">서비스 소개</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                  MNPS 테스트는 심리학의 다크 테트라드(Dark Tetrad) 이론을 기반으로 개발되었으며, 응답 결과는 AI가 분석합니다.
                  그러나 MNPS 테스트는 과학적으로 검증되지 않았습니다. 그러니 맹신하지 마십시오.
                </p>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                  다크 테트라드는 마키아벨리즘, 나르시시즘, 사이코패시, 사디즘 네 가지 특성을 함께 보는 개념으로,
                  이 테스트는 이러한 경향이 어떻게 섞여 있는지를 대략적으로 살펴보는 도구입니다.
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  과학적 근거는 많이 알려진 이론들을 근거로 하였으며, 그 근거는 과학적인 결과입니다.
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-700">
                <h3 className="text-lg font-bold text-white mb-2">MNPS 테스트 시작하기</h3>
                <p className="text-gray-300 text-sm mb-4">
                  응답을 마치면 AI 분석을 기반으로 한 간단한 결과 리포트를 제공합니다.
                </p>
                <span className="inline-flex items-center gap-2 text-cyan-400 font-semibold group-hover:gap-3 transition-all">
                  테스트 시작
                  <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-cyan-600 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          {/* 성장 로드맵 */}
          <Link
            href="/growth-roadmap"
            className="group block rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:border-purple-500/50 hover:bg-zinc-900 transition-all duration-300 overflow-hidden"
          >
            <div className="p-8 md:p-10">
              <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
                <Activity className="w-7 h-7 text-purple-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                성장 로드맵
              </h2>
              <p className="text-purple-400 text-sm font-medium mb-4">
                통합 심리 분석 아키텍처
              </p>
              <p className="text-gray-400 mb-6 leading-relaxed">
                성장 저해 요인, 현 상태, 이상향을 3단계로 분석하고
                전략적 방향 전환을 위한 최종 아키텍처를 제시합니다.
              </p>
              <ul className="space-y-2 text-sm text-gray-500 mb-6">
                <li>· 성장 저해 요인 · 현 상태 · 이상향 3모듈</li>
                <li>· 최종 통합 리포트</li>
              </ul>
              <span className="inline-flex items-center gap-2 text-purple-400 font-semibold group-hover:gap-3 transition-all">
                시작하기
                <ArrowRight className="w-5 h-5" />
              </span>
            </div>
            <div className="h-1 bg-gradient-to-r from-purple-600 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        {/* 하단 링크 */}
        <div className="mt-16 flex flex-wrap justify-center gap-6 text-sm">
          <Link
            href="/services"
            className="text-gray-400 hover:text-white transition-colors"
          >
            서비스 소개
          </Link>
          <Link
            href="/board"
            className="text-gray-400 hover:text-white transition-colors"
          >
            게시판
          </Link>
        </div>
      </section>
    </div>
  );
}
