"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MNPS_QUESTIONS, MNPS_OPTIONS, DarkNatureQuestion } from "./questions";
import { scoreDarkNature, buildInterpretation, DarkAnswer } from "@/lib/mnps/darkNatureScoring";
import InterstitialView from "./InterstitialView";

const QUESTIONS_PER_PHASE = 14;
const PHASE_1_END_INDEX = 13;  // Q14 답변 후 휴식
const PHASE_2_END_INDEX = 27;   // Q28 답변 후 휴식

/** 네트워크 오류·5xx 시 재시도(지수 백오프). 2xx·4xx는 재시도하지 않고 즉시 반환. */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  { maxRetries = 3, baseDelayMs = 1000 } = {}
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      if (res.status >= 400 && res.status < 500) return res; // 4xx: 재시도 안 함
      lastError = new Error(`Server error ${res.status}`);
    } catch (e) {
      lastError = e;
    }
    if (attempt < maxRetries) {
      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

type ViewMode = "question" | "interstitial";

export default function TestPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [testStartedAt, setTestStartedAt] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("question");
  const [interstitialPhase, setInterstitialPhase] = useState<1 | 2>(1);

  const currentPhase =
    currentIndex < QUESTIONS_PER_PHASE
      ? 1
      : currentIndex < QUESTIONS_PER_PHASE * 2
        ? 2
        : 3;
  const overallProgress = (currentIndex + 1) / MNPS_QUESTIONS.length;

  // 테스트 시작 시 assessment 생성 및 시작 시각 기록 (실패 시 sessionStorage만 사용)
  useEffect(() => {
    setTestStartedAt(new Date().toISOString());
    async function createAssessment() {
      try {
        const sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const response = await fetch('/api/mnps/assessments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: null, sessionId }), // 익명 시 session_id로 RLS 식별
        });
        const data = await response.json();
        if (data.success) {
          setAssessmentId(data.assessment.id);
        }
        // 503(DB 미설정) 또는 500이어도 sessionStorage로 계속 진행
      } catch {
        // 네트워크 오류 등 → sessionStorage만 사용
      }
    }
    createAssessment();
  }, []);

  const current = MNPS_QUESTIONS[currentIndex];

  // 답변을 DarkAnswer 형식으로 변환하여 채점 (trait 또는 subFactor가 있는 문항 = 32문항, 시나리오 포함)
  const darkAnswers: DarkAnswer[] = useMemo(() => {
    return MNPS_QUESTIONS.filter(
      (q) => (q.trait || q.subFactor) && answers[q.id] != null,
    ).map((q) => ({
      questionId: q.id,
      trait: q.trait,
      subFactor: q.subFactor,
      value: q.isReverse ? 6 - answers[q.id] : answers[q.id], // 역문항 처리
    }));
  }, [answers]);

  // 검증 문항(v1~v8) 점수는 채점 합산에는 넣지 않고, 일관성·방어적 응답 지표로만 사용
  const validationScores = useMemo(() => {
    const v = {
      v1: answers.v1, v2: answers.v2, v3: answers.v3, v4: answers.v4,
      v5: answers.v5, v6: answers.v6, v7: answers.v7, v8: answers.v8,
    };
    if (v.v1 == null || v.v2 == null || v.v3 == null || v.v4 == null) return undefined;
    return v as Record<string, number>;
  }, [answers.v1, answers.v2, answers.v3, answers.v4, answers.v5, answers.v6, answers.v7, answers.v8]);

  const result = useMemo(
    () => scoreDarkNature(darkAnswers, { validationScores }),
    [darkAnswers, validationScores]
  );

  const handleSelect = async (value: number) => {
    const finalValue = current.isReverse ? 6 - value : value;
    const newAnswers = { ...answers, [current.id]: finalValue };
    setAnswers(newAnswers);

    // DB에 응답 저장 (assessmentId가 있을 때만)
    if (assessmentId) {
      try {
        await fetch('/api/mnps/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assessmentId,
            responses: [{ questionId: current.id, score: finalValue }],
          }),
        });
      } catch (error) {
        console.error('Response 저장 실패:', error);
      }
    }

    // Phase 1 종료(Q14) → 중간 휴식 화면
    if (currentIndex === PHASE_1_END_INDEX) {
      setTimeout(() => {
        setInterstitialPhase(1);
        setViewMode("interstitial");
      }, 200);
      return;
    }
    // Phase 2 종료(Q28) → 중간 휴식 화면
    if (currentIndex === PHASE_2_END_INDEX) {
      setTimeout(() => {
        setInterstitialPhase(2);
        setViewMode("interstitial");
      }, 200);
      return;
    }
    // 그 외: 다음 문항으로 이동
    if (currentIndex < MNPS_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 200);
      return;
    }

    // 마지막 문항이면 테스트 완료 처리
    setTimeout(async () => {
      // DB에 완료 처리 및 결과 저장
      if (assessmentId) {
        try {
          const allResponses = Object.entries(newAnswers).map(([questionId, score]) => ({
            questionId,
            score,
          }));

          // 서버 주도 채점: responses만 전송. 네트워크/5xx 시 재시도(최대 3회), 멱등성으로 중복 제출 시에도 저장 결과 반환
          const completeResponse = await fetchWithRetry(
            '/api/mnps/complete',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                assessmentId,
                responses: allResponses,
                startedAt: testStartedAt || new Date().toISOString(),
              }),
            },
            { maxRetries: 3, baseDelayMs: 1000 }
          );

          const completeData = await completeResponse.json();
          if (completeData.success) {
            // 최종 결과는 서버에 저장됨(또는 이미 완료된 경우 멱등 응답). 결과 페이지는 API fetch로 표시
            sessionStorage.setItem('mnpsAssessmentId', assessmentId);
            router.push(`/mnps/result?assessmentId=${assessmentId}`);
            return;
          }
        } catch (error) {
          console.error('Complete API 실패 (재시도 후):', error);
        }
      }

      // DB 저장 실패 시에만 sessionStorage에 미리보기용 결과 저장 (fallback)
      const resultData = {
        result,
        interpretation: buildInterpretation(result),
        answers: darkAnswers,
      };
      sessionStorage.setItem('darkNatureResult', JSON.stringify(resultData));
      router.push('/mnps/result');
    }, 300);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleInterstitialContinue = () => {
    setViewMode("question");
    setCurrentIndex(interstitialPhase === 1 ? QUESTIONS_PER_PHASE : QUESTIONS_PER_PHASE * 2);
  };

  // 카테고리별 진행률 표시
  const getCategoryLabel = (q: DarkNatureQuestion): string => {
    switch (q.category) {
      case 'darkTetrad':
        return '핵심 측정';
      case 'dFactor':
        return '확장 측정';
      case 'validation':
        return '검증';
      case 'scenario':
        return '상황 시나리오';
      default:
        return '';
    }
  };

  return (
    <main className="page">
      <div className="page-container max-w-3xl py-12 space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-4xl font-bold">Dark Nature Test</h1>
          <p className="text-gray-400">
            42문항으로 당신의 Dark Nature를 측정합니다.
          </p>
          <p className="text-xs text-amber-400/90">
            원활한 분석을 위해 시작 후 24시간 이내에 완료해 주세요.
          </p>
        </header>

        <AnimatePresence mode="wait">
          {viewMode === "interstitial" ? (
            <motion.div
              key="interstitial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <InterstitialView
                phase={interstitialPhase}
                onContinue={handleInterstitialContinue}
              />
            </motion.div>
          ) : (
            <motion.section
              key="question"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.25 }}
              className="card p-6 space-y-6"
            >
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>
                  문항 {currentIndex + 1} / {MNPS_QUESTIONS.length}
                </span>
                <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-cyan-300">
                  {getCategoryLabel(current)}
                </span>
                <span className="font-medium text-cyan-400">
                  Step {currentPhase}/3
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-cyan-500 rounded-full"
                  initial={false}
                  animate={{ width: `${overallProgress * 100}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>

              <div>
                <p className="text-lg font-semibold mb-4 leading-relaxed">{current.text}</p>
                <div className="grid gap-3">
                  {MNPS_OPTIONS.map((option) => {
                    const checked = answers[current.id] === (current.isReverse ? 6 - option.value : option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                          checked
                            ? "border-cyan-400 bg-cyan-500/10 text-cyan-200 shadow-lg shadow-cyan-500/20"
                            : "border-gray-700 bg-gray-900/30 text-gray-200 hover:border-gray-500 hover:bg-gray-900/50"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="btn btn-secondary rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                <div className="text-xs text-gray-500 text-center sm:text-left">
                  {currentPhase === 1 && "1단계: 기본 성향을 파악하고 있습니다."}
                  {currentPhase === 2 && "2단계: 심층 패턴을 분석하고 있습니다."}
                  {currentPhase === 3 && "마지막 단계입니다. 끝까지 답변해주세요."}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {viewMode === "question" && (
          <div className="text-center text-sm text-gray-500">
            * 답변을 선택하면 자동으로 다음 문항으로 이동합니다.
          </div>
        )}
      </div>
    </main>
  );
}
