"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MNPS_OPTIONS, getRandomQuestionSet, getConsistencyBaseId, type DarkNatureQuestion } from "./questions";
import { scoreDarkNature, buildInterpretation, assembleReport, DarkAnswer } from "@/lib/mnps/darkNatureScoring";
import InterstitialView from "./InterstitialView";

const QUESTIONS_PER_PHASE = 14;
const PHASE_1_END_INDEX = 13;  // Q14 답변 후 휴식
const PHASE_2_END_INDEX = 27;   // Q28 답변 후 휴식

const MNPS_SESSION_KEY = 'mnps_session_id';
const MNPS_RESULTS_LIST_KEY = 'mnps_results_list';

function appendResultToList(item: { id: string; completedAt: string; totalDScore: number | null }) {
  if (typeof window === "undefined") return;
  const save = (storage: Storage) => {
    try {
      const raw = storage.getItem(MNPS_RESULTS_LIST_KEY);
      const list: { id: string; completedAt: string; totalDScore: number | null }[] = raw ? JSON.parse(raw) : [];
      list.unshift(item);
      storage.setItem(MNPS_RESULTS_LIST_KEY, JSON.stringify(list));
    } catch {
      storage.setItem(MNPS_RESULTS_LIST_KEY, JSON.stringify([item]));
    }
  };
  save(sessionStorage);
  save(localStorage);
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  const stored = sessionStorage.getItem(MNPS_SESSION_KEY);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (stored && uuidRegex.test(stored)) return stored;
  const newId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
  sessionStorage.setItem(MNPS_SESSION_KEY, newId);
  return newId;
}

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

/** 이 세션에 출제된 42문항 (문제 은행에서 슬롯당 랜덤 1문항). 마운트 시 1회 생성 */
function useSessionQuestions(): DarkNatureQuestion[] {
  const [questions, setQuestions] = useState<DarkNatureQuestion[]>(() => getRandomQuestionSet());
  return questions;
}

export default function TestPage() {
  const router = useRouter();
  const sessionQuestions = useSessionQuestions();
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
  // 단계별 진행률 (각 단계 1~14문항)
  const phase1Progress = currentPhase === 1 ? (currentIndex + 1) / QUESTIONS_PER_PHASE : currentPhase > 1 ? 1 : 0;
  const phase2Progress = currentPhase === 2 ? (currentIndex - PHASE_1_END_INDEX) / QUESTIONS_PER_PHASE : currentPhase > 2 ? 1 : 0;
  const phase3Progress = currentPhase === 3 ? (currentIndex - PHASE_2_END_INDEX) / QUESTIONS_PER_PHASE : 0;

  // 테스트 시작 시 assessment 생성 및 시작 시각 기록 (sessionId는 저장해 두어 이전 결과 보기에서 사용)
  useEffect(() => {
    setTestStartedAt(new Date().toISOString());
    async function createAssessment() {
      try {
        const sessionId = getOrCreateSessionId();
        const response = await fetch('/api/mnps/assessments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: null, sessionId }),
        });
        const data = await response.json();
        if (data.success) {
          setAssessmentId(data.assessment.id);
        }
      } catch {
        // 네트워크 오류 등 → sessionStorage만 사용
      }
    }
    createAssessment();
  }, []);

  const current = sessionQuestions[currentIndex];

  // 답변을 DarkAnswer 형식으로 변환하여 채점 (이 세션 42문항 중 trait/subFactor 있는 문항)
  const darkAnswers: DarkAnswer[] = useMemo(() => {
    return sessionQuestions.filter(
      (q) => (q.trait || q.subFactor) && answers[q.id] != null,
    ).map((q) => ({
      questionId: q.id,
      trait: q.trait,
      subFactor: q.subFactor,
      value: q.isReverse ? 6 - answers[q.id] : answers[q.id], // 역문항 처리
    }));
  }, [sessionQuestions, answers]);

  // 검증 문항: baseId(v1,v3,v4,v7) 기준으로 채점 엔진에 전달 (문제 은행 랜덤 출제 대응)
  const validationScores = useMemo(() => {
    const v: Record<string, number> = {};
    sessionQuestions.forEach((q) => {
      if (q.category !== 'validation') return;
      const baseId = getConsistencyBaseId(q.id);
      if (answers[q.id] != null) v[baseId] = answers[q.id];
    });
    if (v.v1 == null || v.v3 == null || v.v4 == null || v.v7 == null) return undefined;
    return v;
  }, [sessionQuestions, answers]);

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
      setInterstitialPhase(1);
      setViewMode("interstitial");
      return;
    }
    if (currentIndex === PHASE_2_END_INDEX) {
      setInterstitialPhase(2);
      setViewMode("interstitial");
      return;
    }
    if (currentIndex < sessionQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    const finalize = async () => {
      if (assessmentId) {
        try {
          const allResponses = Object.entries(newAnswers).map(([questionId, score]) => ({
            questionId,
            score,
          }));

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
            sessionStorage.setItem('mnpsAssessmentId', assessmentId);
            appendResultToList({
              id: assessmentId,
              completedAt: new Date().toISOString(),
              totalDScore: Math.round(result.dTotal),
            });
            router.push(`/mnps/result?assessmentId=${assessmentId}`);
            return;
          }
        } catch (error) {
          console.error('Complete API 실패 (재시도 후):', error);
        }
      }

      const report = assembleReport(result, true);
      const resultData = {
        result,
        interpretation: buildInterpretation(result),
        answers: darkAnswers,
        goodReportFull: report.goodReport,
        badReportFull: report.fullBadReport ?? report.badTeaser,
        badTeaserFull: report.badTeaser,
      };
      sessionStorage.setItem('darkNatureResult', JSON.stringify(resultData));
      localStorage.setItem('darkNatureResult', JSON.stringify(resultData));
      const localId = `local-${Date.now()}`;
      sessionStorage.setItem(`mnps_result_local_${localId}`, JSON.stringify(resultData));
      localStorage.setItem(`mnps_result_local_${localId}`, JSON.stringify(resultData));
      appendResultToList({
        id: localId,
        completedAt: new Date().toISOString(),
        totalDScore: Math.round(result.dTotal),
      });
      router.push(`/mnps/result?localId=${encodeURIComponent(localId)}`);
    };

    finalize();
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
    <main className="page mobile-safe-container one-screen-fit">
      <div className="page-container max-w-3xl py-12 space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-4xl font-bold">MNPS 테스트</h1>
          <p className="text-gray-400">
            독자적 논리 모델을 통해 다크 테트라드를 탐색합니다.
          </p>
          <p className="text-xs text-amber-400/90">
            원활한 분석을 위해 테스트 시작 후 24시간 이내에 완료해 주세요.
          </p>
          <p className="text-xs text-gray-500 italic max-w-md mx-auto mt-3">
            이 결과는 정답이 아닌, 참고할 수 있는 정교한 한 장의 지도입니다.
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
                  문항 {currentIndex + 1} / {sessionQuestions.length}
                </span>
                <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-cyan-300">
                  {getCategoryLabel(current)}
                </span>
                <span className="font-medium text-cyan-400">
                  단계 {currentPhase}/3
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 block">단계 1</span>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-cyan-500 rounded-full"
                      initial={false}
                      animate={{ width: `${phase1Progress * 100}%` }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 block">단계 2</span>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-cyan-500 rounded-full"
                      initial={false}
                      animate={{ width: `${phase2Progress * 100}%` }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 block">단계 3</span>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-cyan-500 rounded-full"
                      initial={false}
                      animate={{ width: `${phase3Progress * 100}%` }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  </div>
                </div>
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
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-none duration-0 active:scale-95 touch-manipulation ${
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

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="btn btn-secondary rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                <Link
                  href="/mnps/results"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-sm font-medium transition-colors"
                >
                  이전 결과 보기
                </Link>
                <span className="text-xs text-gray-500">
                  {currentPhase === 1 && "1단계: 기본 성향을 파악하고 있습니다."}
                  {currentPhase === 2 && "2단계: 심층 패턴을 분석하고 있습니다."}
                  {currentPhase === 3 && "마지막 단계입니다. 끝까지 답변해 주세요."}
                </span>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {viewMode === "question" && (
          <div className="text-center text-sm text-gray-500">
            답변을 선택하시면 자동으로 다음 문항으로 이동합니다.
          </div>
        )}
      </div>
    </main>
  );
}
