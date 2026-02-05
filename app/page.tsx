'use client';

import Link from "next/link";
import { TestTube2, Activity } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import { MIND_ARCHITECT_ENABLED } from "@/lib/constants/featureFlags";
import { MNPS_ENABLED } from "@/lib/constants/featureFlags";

export default function Home() {
  return (
    <div className="page">
      {/* 브랜드 매니페스토 · Hero */}
      <section className="text-center py-16 md:py-24 px-4">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6 max-w-3xl mx-auto">
          당신의 내면을 그리는 시스템 설계도, KPSY LAB
        </h1>
        <p className="text-lg md:text-xl text-emerald-400/95 font-medium italic max-w-2xl mx-auto mb-8">
          &ldquo;우리는 정답을 팔지 않습니다. 우리는 당신의 복잡함을 해석할 수 있는 &apos;도면&apos;을 제공합니다.&rdquo;
        </p>
        <div className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto space-y-4 text-left">
          <p>
            인간의 마음은 수많은 변수와 데이터가 얽혀 있는 거대한 시스템입니다. KPSY LAB은 전통적인 심리학의 권위에 기대기보다, 인간의 마음을 하나의 정교한 시스템으로 바라보고 그 안의 데이터들을 연결하는 데 집중합니다.
          </p>
          <p>
            MNPS를 포함한 우리의 모든 분석 모듈은 제작자가 세상을 이해하는 방식인 <strong className="text-gray-300">블록화</strong>와 <strong className="text-gray-300">연결</strong>을 심리 영역에 투영한 결과물입니다. 우리는 당신이 누구라고 단정 짓지 않습니다. 다만, 흩어져 있는 당신의 내면 데이터를 질서 있게 정렬하여, 스스로 삶의 경로를 최적화할 수 있는 이정표를 제시할 뿐입니다.
          </p>
          <p className="text-gray-300 font-medium">
            전문가의 처방이 아닌, 시스템 설계자가 제안하는 새로운 시각으로 당신의 내면을 탐험해 보십시오.
          </p>
        </div>
      </section>

      {/* 두 가지 테스트 카드 */}
      <section className="page-container max-w-5xl mx-auto pb-20">
        <p className="text-center text-lg text-emerald-400/90 mb-10 italic">
          당신의 뇌가 그리는 지도를 확인하십시오
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ServiceCard
            theme="cyan"
            title="MNPS"
            subtitle="당신의 그림자가 빛이 되는 지점: 다크 테트라드에 숨겨진 잠재력 발견"
            icon={TestTube2}
            link="/mnps/test"
            intro="왜 그 사람은 나만 상대할 때 다르게 행동할까? MNPS는 다크 테트라드를 시스템 공학적 관점으로 풀어낸 독자적 논리 모델(Proprietary Logic Model)입니다. 당신의 내면 본성 지도를 다차원 데이터 큐레이션으로 탐색합니다."
            note="결과는 자기 탐색을 위한 정교한 이정표이며, 시스템이 제안하는 전략적 방향성입니다."
            ctaTitle="MNPS 탐색 시작하기"
            ctaDescription="응답을 마치면 다차원 패턴 발견 기반의 결과 리포트를 제공합니다."
            ctaLabel="테스트 시작"
          />

          {MIND_ARCHITECT_ENABLED && (
            <ServiceCard
              theme="purple"
              title="마인드 아키텍터"
              subtitle="당신의 무의식이 성공을 가로막고 있지는 않나요?"
              icon={Activity}
              link="/growth-roadmap"
              intro="시스템 병목 분석 → 현재 아키텍처 맵 → 타겟 컨피그레이션을 거쳐, 생애 최적화 도면(통합 블루프린트)을 완성합니다. 시스템 설계자가 제안하는 최적화 경로로 내면 데이터를 구조화합니다."
              bullets={[
                "1단계. 시스템 병목 분석: 비효율적 사고 루프·핵심 병목 지점 식별",
                "2단계. 현재 아키텍처 맵: 심리 작동 도면·에너지 흐름·방어 기제 구조",
                "3단계. 타겟 컨피그레이션: 최적 상태 설계·자원 배분 목표 수립",
                "최종. 시스템 통합 블루프린트: 생애 최적화 도면 발행",
              ]}
              note="결과는 시스템이 제안하는 전략적 방향성이며, 참고용으로 활용해 주세요."
              ctaTitle="마인드 아키텍터 시작하기"
              ctaDescription="3개 모듈을 완료하면 당신만을 위한 생애 최적화 도면(통합 블루프린트)을 확인할 수 있습니다."
              ctaLabel="테스트 시작"
            />
          )}
        </div>

      </section>
    </div>
  );
}
