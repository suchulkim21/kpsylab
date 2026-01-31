"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type PhaseVariant = {
  title: string;
  subtitle: string;
  message: string;
  insights: string[];
  buttonLabel: string;
};

const PHASE_1_VARIANTS: PhaseVariant[] = [
  {
    title: "1단계 분석 완료",
    subtitle: "당신의 응답에서 첫 번째 신호가 포착되었습니다.",
    message: `흥미롭군요. 당신의 선택에서 일관된 패턴이 감지되기 시작했습니다. 겉으로 드러난 성향 뒤에 숨겨진 '본능'을 조금 더 파고들어야 명확해질 것 같습니다.

지금까지의 질문은 자기 인식, 권리 의식, 위기 상황에서의 선택 경향을 살펴본 것입니다. 다음 단계에서는 갈등·경쟁·관계 속에서의 판단을 더 깊이 분석해, 당신만의 '다크 네이처' 윤곽을 잡겠습니다.`,
    insights: [
      "자기 평가와 타인에 대한 기대에서 일관된 축이 감지됨",
      "위기·압박 상황에서의 선택 패턴이 수집 중",
      "2단계에서 갈등·경쟁·도덕적 경계 질문으로 심층 분석 예정",
    ],
    buttonLabel: "심층 분석 계속하기 (2단계)",
  },
  {
    title: "1단계 분석 완료",
    subtitle: "14개 문항의 응답이 분석 큐에 반영되었습니다.",
    message: `당신의 첫 14개 응답을 기반으로 예비 프로파일이 생성되고 있습니다. 아직 결론을 내리기에는 데이터가 부족하지만, 몇 가지 가설이 이미 서 있습니다.

2단계에서는 승진·경쟁·배신·복수 같은 구체적 상황에서의 판단을 묻습니다. 그 답들이 지금까지의 패턴을 확정하거나, 전혀 다른 면을 드러낼 수 있습니다.`,
    insights: [
      "나르시시즘·마키아벨리즘·도덕적 이탈 관련 응답 패턴 수집 완료",
      "다음: 사이코패시·사디즘·상황 시나리오 문항으로 교차 검증",
      "완료 시 당신 전용 '다크 네이처' 리포트 생성",
    ],
    buttonLabel: "심층 분석 계속하기 (2단계)",
  },
  {
    title: "1단계 분석 완료",
    subtitle: "기본 성향 레이어 분석이 끝났습니다.",
    message: `겉으로 드러난 성향 뒤에 숨겨진 '본능'을 조금 더 파고들어야 명확해질 것 같습니다. 1단계 문항만으로는 당신이 '어떤 상황에서' 어떤 선택을 할지 예측하기 어렵습니다.

2단계와 3단계에서 갈등, 경쟁, 관계, 규칙 위반에 대한 구체적 선택을 묻고, 이를 1단계 데이터와 합쳐 최종 프로파일을 산출합니다.`,
    insights: [
      "자기 우월감·특별 대우·도덕적 유연성 관련 지표 1차 산출",
      "2단계에서 충동성·공감·경쟁·복수 심리 추가 측정",
      "3단계에서 검증 문항과 일관성 쌍으로 신뢰도 보정",
    ],
    buttonLabel: "심층 분석 계속하기 (2단계)",
  },
];

const PHASE_2_VARIANTS: PhaseVariant[] = [
  {
    title: "2단계 분석 완료",
    subtitle: "윤곽이 잡혔습니다. 마지막 검증만 남았습니다.",
    message: `이제 윤곽이 잡혔습니다. 당신은 특정 상황에서 매우 독특한 판단 기준을 가지고 있군요. 28개 문항의 응답을 교차 분석한 결과, 몇 가지 성향 축이 안정적으로 추정되고 있습니다.

마지막 14문항은 검증 문항과 일관성 확인용 문항이 포함되어 있습니다. 솔직하게 답할수록 최종 '다크 네이처' 리포트의 정확도가 올라갑니다. 이제 마지막 몇 가지 질문으로 당신의 프로파일을 확정하겠습니다.`,
    insights: [
      "갈등·경쟁·복수·도덕적 경계에서의 선택 패턴 분석 완료",
      "나르시시즘·마키아벨리즘·사이코패시·사디즘 4축 예비 점수 산출됨",
      "3단계: 검증·일관성 반영 후 최종 리포트 생성",
    ],
    buttonLabel: "마지막 확인하기 (3단계)",
  },
  {
    title: "2단계 분석 완료",
    subtitle: "당신의 '다크 네이처' 프로파일이 거의 완성되었습니다.",
    message: `2단계까지의 응답으로 당신의 상황별 판단 방식이 상당 부분 드러났습니다. 승진 경쟁, 배신, 복수, 통제, 규칙 위반에 대한 답변이 1단계의 자기 인식·권리 의식과 합쳐지면서 하나의 프로파일로 수렴하고 있습니다.

3단계에서는 '솔직히 답했다'는 검증 문항과, 비슷한 질문을 다른 표현으로 한 일관성 문항이 포함됩니다. 이 단계를 마치면 당신만의 다크 테트라드·D-Factor 해석과 최종 시나리오가 생성됩니다.`,
    insights: [
      "상황 시나리오·도덕적 이탈·사디즘·악의성 관련 데이터 수집 완료",
      "4대 어두운 특성(마키아벨리즘·나르시시즘·사이코패시·사디즘) 예비 프로파일 존재",
      "마지막 14문항으로 신뢰도 보정 후 최종 결과 공개",
    ],
    buttonLabel: "마지막 확인하기 (3단계)",
  },
  {
    title: "2단계 분석 완료",
    subtitle: "심층 패턴 분석이 거의 끝났습니다.",
    message: `당신은 특정 상황에서 매우 독특한 판단 기준을 가지고 있군요. 지금까지의 선택은 '겉으로 드러난 태도'와 '갈등·압박 속에서의 실제 선택'이 잘 맞아떨어지는 편인지, 아니면 갈라지는 지점이 있는지까지 보여 주고 있습니다.

마지막 단계에서는 검증 문항으로 응답 신뢰도를 보정하고, 일관성 쌍으로 분석 정확도를 높입니다. 3단계를 완료하면 당신의 다크 네이처가 최종 확정됩니다.`,
    insights: [
      "이기주의·권리의식·도덕적 이탈·악의성(D-Factor) 2차 지표 반영됨",
      "다음: 검증 4문항 + 일관성 쌍(n1/n1b, m1/m1b)으로 최종 산출",
      "완료 시 아키타입·D-Factor 해석·최종 리스크 시나리오 제공",
    ],
    buttonLabel: "마지막 확인하기 (3단계)",
  },
];

type InterstitialPhase = 1 | 2;

interface InterstitialViewProps {
  phase: InterstitialPhase;
  onContinue: () => void;
}

function pickVariant(phase: InterstitialPhase): PhaseVariant {
  const variants = phase === 1 ? PHASE_1_VARIANTS : PHASE_2_VARIANTS;
  return variants[Math.floor(Math.random() * variants.length)];
}

export default function InterstitialView({ phase, onContinue }: InterstitialViewProps) {
  const [showContent, setShowContent] = useState(false);
  const content = useMemo(() => pickVariant(phase), [phase]);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 1800);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <motion.div
      key={`interstitial-${phase}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="card p-8 sm:p-10 space-y-8 max-w-xl mx-auto"
    >
      <AnimatePresence mode="wait">
        {!showContent ? (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center min-h-[200px] space-y-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent"
            />
            <p className="text-cyan-400/90 font-medium tracking-wide">
              데이터 분석 중...
            </p>
            <p className="text-xs text-gray-500">
              당신의 응답 패턴을 심층 분석하고 있습니다.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-sm text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {phase}단계 완료
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {content.title}
              </h2>
              <p className="text-cyan-400/90 text-sm font-medium">
                {content.subtitle}
              </p>
            </div>

            <div className="text-left space-y-4">
              <p className="text-gray-300 leading-relaxed text-base sm:text-lg whitespace-pre-line">
                {content.message}
              </p>
              <div className="rounded-xl bg-zinc-900/80 border border-zinc-700/80 p-4 sm:p-5 space-y-3">
                <p className="text-xs font-semibold text-cyan-400/90 uppercase tracking-wider">
                  지금까지 감지된 것
                </p>
                <ul className="space-y-2">
                  {content.insights.map((insight, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i, duration: 0.3 }}
                      className="flex items-start gap-2 text-sm text-gray-300"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500/80 shrink-0" />
                      {insight}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            <motion.button
              onClick={onContinue}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold text-lg shadow-lg shadow-cyan-900/30 transition-all"
            >
              {content.buttonLabel}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
