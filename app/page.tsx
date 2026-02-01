'use client';

import Link from "next/link";
import { TestTube2, Activity } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";

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
        <p className="typography-caption text-sm">
          두 가지 심리 테스트로 자신을 발견하세요
        </p>
      </section>

      {/* 두 가지 테스트 카드 */}
      <section className="page-container max-w-5xl mx-auto pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ServiceCard
            theme="cyan"
            title="MNPS"
            subtitle="내 안의 어둠을 과학적으로 탐구하다"
            icon={TestTube2}
            link="/mnps/test"
            intro="MNPS 테스트는 심리학의 다크 테트라드(Dark Tetrad) 이론을 기반으로 개발되었으며, 응답 결과는 AI가 분석합니다. 그러나 MNPS 테스트는 과학적으로 검증되지 않았습니다. 그러니 맹신하지 마십시오. 다크 테트라드는 마키아벨리즘, 나르시시즘, 사이코패시, 사디즘 네 가지 특성을 함께 보는 개념으로, 이 테스트는 이러한 경향이 어떻게 섞여 있는지를 대략적으로 살펴보는 도구입니다."
            note="과학적 근거는 많이 알려진 이론들을 근거로 하였으며, 그 근거는 과학적인 결과입니다."
            ctaTitle="MNPS 테스트 시작하기"
            ctaDescription="응답을 마치면 AI 분석을 기반으로 한 간단한 결과 리포트를 제공합니다."
            ctaLabel="테스트 시작"
          />

          <ServiceCard
            theme="purple"
            title="마인드 아키텍터"
            subtitle="통합 심리 분석 아키텍처"
            icon={Activity}
            link="/growth-roadmap"
            intro="마인드 아키텍터는 Potential = Performance - Interference 공식을 기반으로 개발되었으며, 성장 저해 요인, 현 상태, 이상향을 3단계로 분석하여 전략적 방향 전환을 위한 최종 아키텍처를 제시합니다."
            bullets={[
              "3가지 모듈(성장 저해 요인, 현 상태 분석, 이상향 및 잠재력)을 순차적으로 진행하며, 과거와 현재를 분석하고 미래로 나아가는 구체적인 로드맵을 제공합니다.",
              "최종 통합 리포트",
            ]}
            note="분석 결과는 심리학적 프레임워크를 근거로 하였으며, 참고용으로 활용해 주세요."
            ctaTitle="마인드 아키텍터 시작하기"
            ctaDescription="3개 모듈을 완료하면 통합 리포트를 생성하여 당신만의 성장 아키텍처를 확인할 수 있습니다."
            ctaLabel="테스트 시작"
          />
        </div>

        {/* 블로그 섹션 */}
        <div className="mt-16 text-center">
          <h2 className="text-xl font-bold text-white mb-4">블로그</h2>
          <p className="text-gray-400 text-sm mb-4">
            심리 분석과 성장에 관한 인사이트를 만나보세요
          </p>
          <Link
            href="/blog"
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            블로그 보기 →
          </Link>
        </div>
      </section>
    </div>
  );
}
