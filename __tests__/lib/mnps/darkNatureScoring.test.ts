/**
 * MNPS(Dark Nature) 채점 엔진 정확도·일관성 테스트
 * - 동일 입력 → 동일 출력 (결정론)
 * - 전저점(1) → 낮은 D점수·ALL_LOW 근처
 * - 전고점(5) → 높은 D점수·극단 아키타입
 * - 분석 정확도 구간 (50~99)
 */

import { describe, it, expect } from 'vitest';
import { scoreDarkNature, assembleReport } from '@/lib/mnps/darkNatureScoring';
import type { DarkAnswer } from '@/lib/mnps/darkNatureScoring';
import { MNPS_QUESTIONS } from '@/app/mnps/test/questions';

/** trait 또는 subFactor가 있는 문항만 사용 (채점 반영 문항) */
const SCORING_QUESTIONS = MNPS_QUESTIONS.filter(
  (q) => q.trait || q.subFactor
);

function buildAnswers(valuePerQuestion: Record<string, number>): DarkAnswer[] {
  return SCORING_QUESTIONS.map((q) => ({
    questionId: q.id,
    trait: q.trait,
    subFactor: q.subFactor,
    value: valuePerQuestion[q.id] ?? 3,
  }));
}

/** 모든 채점 문항에 동일 값 적용 */
function buildUniformAnswers(value: number): DarkAnswer[] {
  return SCORING_QUESTIONS.map((q) => ({
    questionId: q.id,
    trait: q.trait,
    subFactor: q.subFactor,
    value,
  }));
}

describe('MNPS darkNatureScoring', () => {
  it('동일 입력이면 동일 결과를 반환한다 (결정론)', () => {
    const answers = buildUniformAnswers(3);
    const r1 = scoreDarkNature(answers, {
      responseTimeMs: 120_000,
      questionCount: 42,
    });
    const r2 = scoreDarkNature(answers, {
      responseTimeMs: 120_000,
      questionCount: 42,
    });
    expect(r1.dTotal).toBe(r2.dTotal);
    expect(r1.archetype).toBe(r2.archetype);
    expect(r1.traitScores.machiavellianism).toBe(r2.traitScores.machiavellianism);
    expect(r1.traitScores.narcissism).toBe(r2.traitScores.narcissism);
    expect(r1.traitScores.psychopathy).toBe(r2.traitScores.psychopathy);
    expect(r1.traitScores.sadism).toBe(r2.traitScores.sadism);
  });

  it('전저점(1)이면 D점수와 trait 점수가 낮고 ALL_LOW 또는 저위험 아키타입에 수렴한다', () => {
    const answers = buildUniformAnswers(1);
    const result = scoreDarkNature(answers, {
      responseTimeMs: 90_000,
      questionCount: 42,
    });
    expect(result.dTotal).toBeLessThanOrEqual(35);
    expect(result.traitScores.machiavellianism).toBeLessThanOrEqual(25);
    expect(result.traitScores.narcissism).toBeLessThanOrEqual(25);
    expect(result.traitScores.psychopathy).toBeLessThanOrEqual(25);
    expect(result.traitScores.sadism).toBeLessThanOrEqual(25);
    expect(['ALL_LOW', 'HYBRID_MID']).toContain(result.archetype);
  });

  it('전고점(5)이면 D점수가 높고 극단 또는 고위험 아키타입이다', () => {
    const answers = buildUniformAnswers(5);
    const result = scoreDarkNature(answers, {
      responseTimeMs: 120_000,
      questionCount: 42,
    });
    expect(result.dTotal).toBeGreaterThanOrEqual(70);
    expect(result.traitScores.machiavellianism).toBeGreaterThanOrEqual(75);
    expect(result.traitScores.narcissism).toBeGreaterThanOrEqual(75);
    expect(result.traitScores.psychopathy).toBeGreaterThanOrEqual(75);
    expect(result.traitScores.sadism).toBeGreaterThanOrEqual(75);
    expect(result.archetype).not.toBe('ALL_LOW');
  });

  it('분석 정확도는 50~99 범위이다', () => {
    const answers = buildUniformAnswers(3);
    const result = scoreDarkNature(answers, {
      validationScores: { v1: 5, v3: 1, v4: 5, v7: 1 },
      responseTimeMs: 100_000,
      questionCount: 42,
    });
    expect(result.analysisAccuracy).toBeGreaterThanOrEqual(50);
    expect(result.analysisAccuracy).toBeLessThanOrEqual(99);
  });

  it('응답 시간이 너무 짧으면 분석 정확도에 페널티가 반영된다', () => {
    const answers = buildUniformAnswers(3);
    const slow = scoreDarkNature(answers, {
      responseTimeMs: 120_000,
      questionCount: 42,
    });
    const fast = scoreDarkNature(answers, {
      responseTimeMs: 20_000,
      questionCount: 42,
    });
    expect(fast.responseTimePenalty).toBe(true);
    expect(slow.analysisAccuracy!).toBeGreaterThanOrEqual(fast.analysisAccuracy!);
  });

  it('assembleReport는 goodReport·badTeaser를 반환한다', () => {
    const answers = buildUniformAnswers(3);
    const result = scoreDarkNature(answers, {
      responseTimeMs: 120_000,
      questionCount: 42,
    });
    const report = assembleReport(result, false);
    expect(typeof report.goodReport).toBe('string');
    expect(report.goodReport.length).toBeGreaterThan(50);
    expect(typeof report.badTeaser).toBe('string');
    expect(report.badTeaser.length).toBeGreaterThan(0);
  });

  it('assembleReport(isPaid: true)는 fullBadReport를 채운다', () => {
    const answers = buildUniformAnswers(4);
    const result = scoreDarkNature(answers, {
      responseTimeMs: 120_000,
      questionCount: 42,
    });
    const report = assembleReport(result, true);
    expect(typeof report.fullBadReport).toBe('string');
    expect(report.fullBadReport!.length).toBeGreaterThan(report.badTeaser.length);
  });
});
