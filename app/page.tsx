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
          당신이 회사에서 이유 없이 손해 보는 진짜 이유를 알고 계십니까?
        </p>
      </section>

      {/* 두 가지 테스트 카드 */}
      <section className="page-container max-w-5xl mx-auto pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ServiceCard
            theme="cyan"
            title="MNPS"
            subtitle="당신 안의 '위험한' 면을 알고 있나요?"
            icon={TestTube2}
            link="/mnps/test"
            intro="왜 그 사람은 나만 상대할 때 다르게 행동할까? MNPS는 다크 테트라드(마키아벨리즘, 나르시시즘, 사이코패시, 사디즘) 이론을 기반으로, 당신과 주변인의 숨겨진 성향을 과학적으로 탐구합니다. 검증된 심리학 이론에 근거하나, 임상 진단을 대체하지는 않습니다."
            note="과학적 근거는 많이 알려진 이론들을 근거로 하였으며, 그 근거는 과학적인 결과입니다."
            ctaTitle="MNPS 테스트 시작하기"
            ctaDescription="응답을 마치면 AI 분석을 기반으로 한 간단한 결과 리포트를 제공합니다."
            ctaLabel="테스트 시작"
          />

          <ServiceCard
            theme="purple"
            title="마인드 아키텍터"
            subtitle="당신의 무의식이 성공을 가로막고 있지는 않나요?"
            icon={Activity}
            link="/growth-roadmap"
            intro="당신의 무의식이 당신의 성공을 어떻게 가로막고 있는지 확인하세요. Potential = Performance - Interference 공식을 기반으로, 성장 저해 요인·현 상태·이상향을 3단계로 분석해 전략적 방향 전환 아키텍처를 제시합니다."
            bullets={[
              "지금 이 순간도 당신의 재능이 낭비되고 있을 수 있습니다. 3가지 모듈로 원인을 파악하세요.",
              "최종 통합 리포트에서 구체적 로드맵 제공",
            ]}
            note="분석 결과는 심리학적 프레임워크를 근거로 하였으며, 참고용으로 활용해 주세요."
            ctaTitle="마인드 아키텍터 시작하기"
            ctaDescription="3개 모듈을 완료하면 당신이 놓치고 있던 성장 기회를 확인할 수 있습니다."
            ctaLabel="테스트 시작"
          />
        </div>

      </section>
    </div>
  );
}
