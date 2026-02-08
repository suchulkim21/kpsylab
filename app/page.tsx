'use client';

import Link from "next/link";
import { TestTube2, Activity } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import { MIND_ARCHITECT_ENABLED } from "@/lib/constants/featureFlags";
import { MNPS_ENABLED } from "@/lib/constants/featureFlags";

export default function Home() {
  return (
    <div className="page">
      <section className="text-center py-16 md:py-24 px-4">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6 max-w-3xl mx-auto">
          당신의 내면을 그리는 한 장의 지도 KPSY LAB
        </h1>
      </section>

      <section className="page-container max-w-5xl mx-auto pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MNPS_ENABLED && (
            <ServiceCard
              theme="cyan"
              title="MNPS"
              subtitle=""
              icon={TestTube2}
              link="/mnps/test"
              intro="MNPS는 검증된 심리학(다크 테트라드·D요인)을 바탕으로, 당신의 응답이 그리는 무늬를 한 시점의 맥락으로 펼쳐 보여줍니다. 그 맥락에서 관찰되는 패턴과 관계를 삶의 지도로 투영합니다."
              note="결과는 그때그때의 맥락에서 나온 한 장의 지도이며, 진단이 아닌 참고용 해석입니다."
              ctaTitle="MNPS 테스트 시작하기"
              ctaDescription="응답을 마치면 다차원 패턴 발견 기반의 결과 리포트를 제공합니다."
              ctaLabel="테스트 시작"
            />
          )}

          {MIND_ARCHITECT_ENABLED && (
            <ServiceCard
              theme="purple"
              title="마인드 아키텍터"
              subtitle="잠재력 = 실행력 − 방해 요인: 간섭과 잠재력을 맥락으로"
              icon={Activity}
              link="/growth-roadmap"
              intro="성과를 가로막는 간섭(Interference)과 현재 아키텍처를 맥락으로 삼아, 이상향과의 격차를 한 장의 지도로 그립니다. 3단계 모듈은 한 번의 진단이 아니라, 당신이 서 있는 지점과 나아갈 방향을 맥락적으로 잇는 이정표입니다."
              bullets={[
                "1단계. 시스템 병목 분석: 경로를 가로막는 패턴을 맥락으로 식별",
                "2단계. 현재 아키텍처 맵: 심리 작동·에너지 흐름·방어 기제의 배치",
                "3단계. 타겟 컨피그레이션: 맥락에 따른 최적 상태와 자원 배분",
                "최종. 통합 블루프린트: 지금 맥락에서 읽은 이정표 (참고용)",
              ]}
              note="결과는 고정된 정답이 아니라, 현재 맥락에서의 전략적 방향 제안입니다."
              ctaTitle="마인드 아키텍터 시작하기"
              ctaDescription="3개 모듈을 완료하면 당신만을 위한 생애 최적화 지도(통합 블루프린트)를 확인할 수 있습니다."
              ctaLabel="테스트 시작"
            />
          )}
          {!MNPS_ENABLED && !MIND_ARCHITECT_ENABLED && (
            <div className="md:col-span-2 text-center py-8 text-gray-400">
              <p className="mb-4">테스트 서비스는 준비 중입니다.</p>
              <Link href="/services" className="text-cyan-400 hover:text-cyan-300 underline">
                서비스 소개에서 자세한 내용 보기
              </Link>
            </div>
          )}
        </div>

      </section>
    </div>
  );
}
