import Link from "next/link";
import { Brain, Zap, BarChart3, ArrowRight, TestTube2, Sparkles } from "lucide-react";

export default function ServicesPage() {
  return (
    <div className="page">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      <main className="page-container relative z-10 py-24 md:py-32">
        {/* Header */}
        <header className="text-center mb-20 space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
            서비스 소개
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-light tracking-widest uppercase">
            Comprehensive Psychology Services
          </p>
          <p className="text-gray-300 text-base max-w-2xl mx-auto mt-6">
            심리 분석 및 측정 서비스를 통해 자신의 내면을 탐구하고,
            <br />
            새로운 성장의 가능성을 발견하세요.
          </p>
        </header>

        {/* 서비스 목록 */}
        <div className="space-y-32 mb-32">
          {/* MNPS 서비스 */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                <TestTube2 className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h2 className="text-4xl font-bold tracking-tight">MNPS</h2>
                <p className="text-blue-400 text-sm uppercase tracking-wider mt-1">
                  Dark Tetrad Analysis Platform
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* 설명 */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-blue-400">
                    내 안의 어둠을 과학적으로 탐구하다
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    MNPS(Multidimensional Nature Profiling System)는 다크 테트라드(Dark Tetrad) 이론을 기반으로
                    당신의 내면에 숨겨진 본성을 정밀하게 측정하고 분석합니다.
                  </p>
                  <p className="text-gray-400 leading-relaxed mt-4">
                    위로나 공감 대신, <strong className="text-white">냉철한 데이터와 과학적 근거</strong>를 통해
                    당신의 진짜 모습을 마주하게 합니다.
                  </p>
                </div>

                <div className="card p-6 space-y-4">
                  <h4 className="text-xl font-semibold text-white">핵심 특징</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Brain className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-white">과학적 타당성:</strong>
                        <span className="text-gray-400 ml-2">
                          학계에서 검증된 연구를 기반으로 설계된 정밀한 분석 시스템
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <BarChart3 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-white">다차원 분석:</strong>
                        <span className="text-gray-400 ml-2">
                          120문항의 하이브리드 질문 시스템으로 4가지 특성을 종합 분석
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-white">프리미엄 인사이트:</strong>
                        <span className="text-gray-400 ml-2">
                          단순한 점수가 아닌, 실질적인 활용 전략과 깊이 있는 해석 제공
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
                      <span>데이터 기반의 객관적인 자기 이해를 원하는 분</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>성격 특성을 실무와 리더십에 활용하고 싶은 분</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">✓</span>
                      <span>심리학적 통찰을 통해 성장하고 싶은 분</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/mnps"
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

          {/* 성장 로드맵 서비스 */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h2 className="text-4xl font-bold tracking-tight">성장 로드맵</h2>
                <p className="text-purple-400 text-sm uppercase tracking-wider mt-1">
                  Strategic Psychology Analysis System
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* 설명 */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-purple-400">
                    새로운 도약을 위한 전략적 심리 분석
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    성장 로드맵는 3가지 모듈을 통해 당신의 성장 저해 요인, 현재 상태, 그리고 이상향을
                    종합적으로 분석하여 새로운 시작의 전략을 제시합니다.
                  </p>
                  <p className="text-gray-400 leading-relaxed mt-4">
                    과거와 현재를 분석하고, <strong className="text-white">미래로 나아가는 구체적인 로드맵</strong>을
                    제공합니다.
                  </p>
                </div>

                {/* 3가지 모듈 */}
                <div className="space-y-4">
                <div className="card border-red-500/20 p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                        <span className="text-red-400 font-bold text-sm">1</span>
                      </div>
                      <h4 className="text-lg font-semibold text-white">성장 저해 요인</h4>
                    </div>
                    <p className="text-gray-400 text-sm ml-11">
                      내면의 방해 요인과 패턴을 분석하여 성장을 가로막는 요소를 파악합니다.
                    </p>
                  </div>

                <div className="card border-blue-500/20 p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <span className="text-blue-400 font-bold text-sm">2</span>
                      </div>
                      <h4 className="text-lg font-semibold text-white">현 상태 분석</h4>
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
                      <h4 className="text-lg font-semibold text-white">이상향 및 잠재력</h4>
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
                      <span>성장 방향과 전략을 수립하고 싶은 분</span>
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
                      <span>성장 저해 요인 모듈 완료</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-purple-400">2단계</span>
                      <span>현 상태 분석 모듈 완료</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-purple-400">3단계</span>
                      <span>이상향 및 잠재력 모듈 완료</span>
                    </div>
                    <div className="flex items-center gap-3 pt-2 border-t border-purple-500/20">
                      <span className="text-purple-400 font-semibold">최종</span>
                      <span className="font-semibold text-white">통합 리포트 생성</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/growth-roadmap"
                  className="group flex items-center justify-between rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-500/50 p-6 transition-all duration-300"
                >
                  <div>
                    <div className="text-purple-400 font-semibold text-lg mb-1">성장 로드맵 시작하기</div>
                    <div className="text-gray-400 text-sm">3개 모듈 순차 진행</div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-purple-400 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* 하단 CTA */}
        <div className="text-center space-y-6 pt-16 border-t border-zinc-800">
          <h3 className="text-2xl font-bold text-white">원하는 서비스를 선택해 시작하세요</h3>
          <p className="text-gray-400">각 서비스는 독립적으로 이용 가능하며, 함께 이용 시 더욱 깊이 있는 분석을 받을 수 있습니다.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/mnps"
              className="btn btn-primary px-8"
            >
              MNPS 시작하기
            </Link>
            <Link
              href="/growth-roadmap"
              className="btn btn-secondary px-8"
            >
              성장 로드맵 시작하기
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}



