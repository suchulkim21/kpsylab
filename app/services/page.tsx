import Link from "next/link";
import { Brain, Zap, BarChart3, ArrowRight, TestTube2, Sparkles } from "lucide-react";
import { MIND_ARCHITECT_ENABLED, MNPS_ENABLED } from "@/lib/constants/featureFlags";
import { PHILOSOPHY_PREMISE, SCIENCE_DISCLAIMER } from "@/lib/constants/copy";

export default function ServicesPage() {
  return (
    <div className="page">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      <main className="page-container relative z-10 py-24 md:py-32">
        {/* 철학 선행 + 질서(여정) */}
        <header className="text-center mb-20 space-y-4">
          <p className="text-emerald-400/90 font-medium text-base md:text-lg max-w-xl mx-auto">
            {PHILOSOPHY_PREMISE.weDoNotDefine}
          </p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
            서비스 소개
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-light tracking-widest uppercase">
            통합 심리 분석 아키텍처
          </p>
          <p className="text-gray-300 text-base max-w-2xl mx-auto mt-6">
            MNPS와 마인드 아키텍터는 한 연구소 아래, <strong className="text-white">자기 탐구의 여정</strong>을 이루는 두 개의 출발점입니다. 어둠 속 패턴을 읽는 것과, 성과를 가로막는 간섭과 잠재력을 읽는 것은 같은 당신의 내면을 다른 맥락으로 그리는 일입니다.
          </p>
        </header>

        {/* 서비스 목록 */}
        <div className="space-y-32 mb-32">
          {/* MNPS 서비스 (MNPS_ENABLED 시에만 노출) */}
          {MNPS_ENABLED && (
          <section className="space-y-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                <TestTube2 className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h2 className="text-4xl font-bold tracking-tight">MNPS</h2>
                <p className="text-blue-400 text-sm uppercase tracking-wider mt-1">
                  당신의 그림자가 빛이 되는 지점: 다크 테트라드에 숨겨진 잠재력 발견
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* 설명 */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-blue-400">
                    다크 테트라드: 맥락으로 읽는 패턴, 한 장의 지도
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    MNPS는 검증된 다크 테트라드(Dark Tetrad)·D요인 이론을 바탕으로, 당신의 응답이 그리는 무늬를 <strong className="text-white">한 시점의 맥락</strong>으로 펼쳐 보여줍니다. 그 맥락에서 관찰되는 패턴과 관계를 한 장의 지도로 투영합니다.
                  </p>
                  <p className="text-gray-400 leading-relaxed mt-4 text-sm">
                    {SCIENCE_DISCLAIMER.unified}
                  </p>
                </div>

                <div className="card p-6 space-y-4">
                  <h4 className="text-xl font-semibold text-white">핵심 특징</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Brain className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-white">검증된 심리학 기반 구조:</strong>
                        <span className="text-gray-400 ml-2">
                          검증된 심리 이론을 과학적 방법으로 구조화한 분석 모델
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <BarChart3 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-white">다차원 패턴 큐레이션:</strong>
                        <span className="text-gray-400 ml-2">
                          42문항 구조화 질문으로 4가지 특성 패턴 발견 및 맥락적 재구성
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-white">전략적 방향성 제안:</strong>
                        <span className="text-gray-400 ml-2">
                          단순 점수가 아닌, 시스템이 제안하는 활용 전략과 구조적 해석 제공
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="card bg-blue-500/10 border-blue-500/20 p-6">
                  <h4 className="text-lg font-semibold text-blue-400 mb-3">측정 항목</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-gray-300">
                      <strong className="text-white">• 마키아벨리즘:</strong> 전략적 사고와 조작 성향
                    </div>
                    <div className="text-gray-300">
                      <strong className="text-white">• 나르시시즘:</strong> 자기 중심적 성향과 과시욕
                    </div>
                    <div className="text-gray-300">
                      <strong className="text-white">• 사이코패시:</strong> 공감 결핍과 충동성
                    </div>
                    <div className="text-gray-300">
                      <strong className="text-white">• 사디즘:</strong> 타인에 대한 공격적 성향
                    </div>
                  </div>
                </div>
              </div>

              {/* 활용 방법 */}
              <div className="space-y-6">
                <div className="card bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 p-6">
                  <h4 className="text-xl font-semibold text-white mb-4">이런 분께 추천합니다</h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>자신의 잠재된 본성을 확인하고 싶은 분</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>맥락 기반의 자기 이해를 깊이고 싶은 분</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>성격 특성을 실무와 리더십에 활용하고 싶은 분</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>내면의 배치를 통해 경로를 탐색하고 싶은 분</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/mnps/test"
                  className="group flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/50 p-6 transition-all duration-300"
                >
                  <div>
                    <div className="text-blue-400 font-semibold text-lg mb-1">MNPS 테스트 시작하기</div>
                    <div className="text-gray-400 text-sm">약 15-20분 소요</div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-blue-400 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </section>
          )}

          {/* 마인드 아키텍터 서비스 (MIND_ARCHITECT_ENABLED 시에만 노출) */}
          {MIND_ARCHITECT_ENABLED && (
            <section className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold tracking-tight">마인드 아키텍터</h2>
                  <p className="text-purple-400 text-sm uppercase tracking-wider mt-1">
                    전략적 심리 분석 시스템
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* 설명 */}
                <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-purple-400">
                    잠재력 = 실행력 − 방해 요인: 맥락으로 읽는 간섭과 잠재력
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    마인드 아키텍터는 성과를 가로막는 간섭(Interference)과 현재 심리 아키텍처를 <strong className="text-white">맥락</strong>으로 삼아, 이상향과의 격차를 한 장의 지도로 그립니다. 3단계 모듈은 한 번의 진단이 아니라, 당신이 서 있는 지점과 나아갈 방향을 맥락적으로 잇는 이정표입니다.
                  </p>
                  <p className="text-gray-400 leading-relaxed mt-4">
                    결과는 고정된 정답이 아니라, <strong className="text-white">현재 맥락에서의 전략적 방향 제안</strong>이며 참고용으로 활용해 주세요.
                  </p>
                </div>

                  {/* 3가지 모듈 */}
                  <div className="space-y-4">
                  <div className="card border-red-500/20 p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                          <span className="text-red-400 font-bold text-sm">1</span>
                        </div>
                        <h4 className="text-lg font-semibold text-white">과거의 족쇄 · 시스템 병목 분석</h4>
                      </div>
                      <p className="text-gray-400 text-sm ml-11">
                        내면의 방해 요인과 패턴을 큐레이션하여 경로를 가로막는 요소를 탐색합니다.
                      </p>
                    </div>

                  <div className="card border-blue-500/20 p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <span className="text-blue-400 font-bold text-sm">2</span>
                        </div>
                        <h4 className="text-lg font-semibold text-white">현재의 투쟁 · 현재 아키텍처 맵</h4>
                      </div>
                      <p className="text-gray-400 text-sm ml-11">
                        사회적 아키타입을 통해 현재 자신의 위치와 역할을 명확히 인식합니다.
                      </p>
                    </div>

                  <div className="card border-purple-500/20 p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                          <span className="text-purple-400 font-bold text-sm">3</span>
                        </div>
                        <h4 className="text-lg font-semibold text-white">미래의 도약 · 타겟 컨피그레이션</h4>
                      </div>
                      <p className="text-gray-400 text-sm ml-11">
                        이상과 현실의 차이를 분석하여 잠재력을 실현할 수 있는 전략을 도출합니다.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 활용 방법 */}
                <div className="space-y-6">
                  <div className="card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-6">
                    <h4 className="text-xl font-semibold text-white mb-4">이런 분께 추천합니다</h4>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-3">
                        <span className="text-purple-400 mt-1">✓</span>
                        <span>전환점을 맞이하여 새로운 시작을 준비하는 분</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-purple-400 mt-1">✓</span>
                        <span>현재 상태를 객관적으로 파악하고 싶은 분</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-purple-400 mt-1">✓</span>
                        <span>경로 탐색과 최적화 방향을 수립하고 싶은 분</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-purple-400 mt-1">✓</span>
                        <span>통합적인 자기 이해와 변화 계획이 필요한 분</span>
                      </li>
                    </ul>
                  </div>

                  <div className="card bg-purple-500/10 border-purple-500/20 p-6">
                    <h4 className="text-lg font-semibold text-purple-400 mb-3">분석 프로세스</h4>
                    <div className="space-y-3 text-sm text-gray-300">
                      <div className="flex items-center gap-3">
                        <span className="text-purple-400">1단계</span>
                        <span>시스템 병목 분석 모듈 완료</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-purple-400">2단계</span>
                        <span>현재 아키텍처 맵 모듈 완료</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-purple-400">3단계</span>
                        <span>타겟 컨피그레이션 모듈 완료</span>
                      </div>
                      <div className="flex items-center gap-3 pt-2 border-t border-purple-500/20">
                        <span className="text-purple-400 font-semibold">최종</span>
                        <span className="font-semibold text-white">시스템 통합 블루프린트 발행</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/growth-roadmap"
                    className="group flex items-center justify-between rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-500/50 p-6 transition-all duration-300"
                  >
                    <div>
                      <div className="text-purple-400 font-semibold text-lg mb-1">마인드 아키텍터 시작하기</div>
                      <div className="text-gray-400 text-sm">3개 모듈 순차 진행</div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-purple-400 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* G3 시대 · 지능 자산 */}
        <div className="text-center py-16 px-4">
          <p className="text-xl md:text-2xl text-emerald-400/90 font-medium italic max-w-2xl mx-auto">
            AI와 기술 패권의 시대, 가장 강력한 자산은 &apos;나&apos;라는 지능의 설계도입니다
          </p>
        </div>

        {/* 하단 CTA */}
        <div className="text-center space-y-6 pt-16 border-t border-zinc-800">
          <h3 className="text-2xl font-bold text-white">자기 탐구의 여정: 출발점을 선택하세요</h3>
          <p className="text-gray-400">두 도구는 같은 연구소 아래 서로 다른 맥락을 그립니다. 하나만 써도 되고, 둘 다 쓸 때는 당신의 내면을 여러 각도에서 연결해 읽을 수 있습니다.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            {MNPS_ENABLED && (
              <Link
                href="/mnps/test"
                className="btn btn-primary px-8"
              >
                MNPS 시작하기
              </Link>
            )}
            {MIND_ARCHITECT_ENABLED && (
              <Link
                href="/growth-roadmap"
                className="btn btn-secondary px-8"
              >
                마인드 아키텍터 시작하기
              </Link>
            )}
            {!MNPS_ENABLED && !MIND_ARCHITECT_ENABLED && (
              <p className="text-gray-400 text-sm">테스트 서비스는 준비 중입니다.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}



