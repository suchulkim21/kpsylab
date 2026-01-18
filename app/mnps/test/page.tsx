"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MNPS_QUESTIONS, MNPS_OPTIONS, MnpsTrait } from "./questions";

type ScoreMap = Record<MnpsTrait, number>;

const TRAIT_LABELS: Record<MnpsTrait, string> = {
  machiavellianism: "마키아벨리즘",
  narcissism: "나르시시즘",
  psychopathy: "사이코패시",
  sadism: "사디즘",
};

const getInitialScores = (): ScoreMap => ({
  machiavellianism: 0,
  narcissism: 0,
  psychopathy: 0,
  sadism: 0,
});

export default function TestPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  const current = MNPS_QUESTIONS[currentIndex];
  const progress = Math.round(((currentIndex + 1) / MNPS_QUESTIONS.length) * 100);

  const scores = useMemo(() => {
    const map = getInitialScores();
    for (const q of MNPS_QUESTIONS) {
      const value = answers[q.id];
      if (typeof value === "number") {
        map[q.trait] += value;
      }
    }
    return map;
  }, [answers]);

  const handleSelect = (value: number) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const handleNext = () => {
    if (currentIndex < MNPS_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    setShowResult(true);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentIndex(0);
    setShowResult(false);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-4xl font-bold">MNPS 테스트</h1>
          <p className="text-gray-400">
            4가지 다크 테트라드 특성을 간단히 점검합니다.
          </p>
        </header>

        {!showResult ? (
          <section className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>
                문항 {currentIndex + 1} / {MNPS_QUESTIONS.length}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div>
              <p className="text-lg font-semibold mb-4">{current.text}</p>
              <div className="grid gap-3">
                {MNPS_OPTIONS.map((option) => {
                  const checked = answers[current.id] === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                        checked
                          ? "border-cyan-400 bg-cyan-500/10 text-cyan-200"
                          : "border-gray-700 bg-gray-900/30 text-gray-200 hover:border-gray-500"
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
                className="rounded-full px-6 py-3 bg-gray-700 text-white disabled:opacity-40"
              >
                이전
              </button>
              <button
                onClick={handleNext}
                disabled={answers[current.id] == null}
                className="rounded-full px-6 py-3 bg-cyan-600 text-white disabled:opacity-40"
              >
                {currentIndex === MNPS_QUESTIONS.length - 1 ? "결과 보기" : "다음"}
              </button>
            </div>
          </section>
        ) : (
          <section className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 space-y-6">
            <h2 className="text-2xl font-bold text-center">결과 요약</h2>
            <div className="grid gap-4">
              {Object.entries(scores).map(([trait, value]) => (
                <div key={trait} className="flex items-center justify-between">
                  <span className="text-gray-300">{TRAIT_LABELS[trait as MnpsTrait]}</span>
                  <span className="text-cyan-300 font-semibold">{value}점</span>
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-400">
              이 결과는 간단 점검용이며, 상세 진단은 확장 테스트에서 제공합니다.
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <button
                onClick={handleReset}
                className="rounded-full px-6 py-3 bg-gray-700 text-white"
              >
                다시하기
              </button>
              <Link
                href="/mnps"
                className="rounded-full px-6 py-3 bg-cyan-600 text-white text-center"
              >
                MNPS 메인으로
              </Link>
            </div>
          </section>
        )}

        <div className="text-center text-sm text-gray-500">
          * 본 테스트는 내부 점검용 간이 버전입니다.
        </div>
      </div>
    </main>
  );
}
