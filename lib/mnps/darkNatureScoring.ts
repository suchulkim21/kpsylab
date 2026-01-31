/**
 * Dark Nature Test Scoring Engine
 *
 * - Dark Tetrad: Machiavellianism, Narcissism, Psychopathy, Sadism
 * - Sub‑factors: Egoism, Moral Disengagement, Entitlement, Spitefulness
 * - Likert 1–5 점수 기반
 * - D_total = Σ(w_i * q_i) + InterCorrelationWeight
 */

import {
  traitScores as contentTraitScores,
  synergyCombinations,
  archetypeIntros,
  archetypeDeepDives,
  finalWarnings,
  extraBadDepthBlocks,
  dFactorInterpretations,
  finalRuinScenarios,
  TraitLevel,
  TraitKey,
  type TraitSnippet,
  type DFactorKey,
} from './contentLibrary';
import {
  getProfileMatrix,
  determineArchetype,
  getDisplayFromArchetypeId,
  getIntensity,
} from './dynamicProfileMatrix';
import type { MnpsArchetypeId } from './dynamicProfileMatrix';
import { ARCHETYPE_CONTENT } from './archetypeContent';

export type DarkTrait = 'machiavellianism' | 'narcissism' | 'psychopathy' | 'sadism';

export type DarkSubFactor = 'egoism' | 'moralDisengagement' | 'entitlement' | 'spitefulness';

export type DarkAnswer = {
  questionId: string;
  trait?: DarkTrait; // Dark Tetrad 문항만
  subFactor?: DarkSubFactor; // D-Factor 문항만 (또는 Dark Tetrad와 함께)
  value: number; // 1 ~ 5 Likert
};

export type DarkTraitScores = Record<DarkTrait, number>;
export type DarkSubFactorScores = Record<DarkSubFactor, number>;

export interface DarkNatureResult {
  traitScores: DarkTraitScores;          // 0 ~ 100 scale
  subFactorScores: DarkSubFactorScores;  // 0 ~ 100 scale
  dTotal: number;                        // 0 ~ 100 표출용 종합 D 점수 (비선형 매핑)
  /** 원점수. 100 초과 가능. 천장 효과 제거용 */
  rawDTotal?: number;
  /** rawDTotal이 임계(예: 100) 초과 시 true. 상위 0.1% Extreme 태그용 */
  isExtremeTop?: boolean;
  /** 검증 문항 평균 (0~100). 높을수록 일관·정직 주장. 방어적 응답 판정에 사용 */
  validationScore?: number;
  /** 4개 trait 점수 범위 (max-min). 낮을수록 평탄 = 방어적 가능성 */
  consistencySpread?: number;
  /** 분석 정확도 50~99. 응답 신뢰도(검증 보너스 + 일관성 패널티) 반영, 높을수록 신뢰 가능 */
  analysisAccuracy?: number;
  /** 문항당 0.8초 미만으로 완료 시 true. analysisAccuracy에 -30 적용됨 */
  responseTimePenalty?: boolean;
  /** LSI(동일 응답 연속) 또는 지그재그(1-5-1-5) 패턴 감지 시 true. 리포트에 "불성실 응답 의심" 표시 */
  insincereResponsePattern?: boolean;
  /** 검사 완료 시점 D-Score 백분위(0~100). "상위 N% 위험군" 배지용. RPC get_d_score_percentile 결과 저장 */
  percentileAtCreation?: number;
  /** 다이내믹 아키타입 ID (16+종 정밀 판별: MACH_PURE, MACH_NARC, DARK_APEX, ALL_LOW, HYBRID_MID 등) */
  archetype?: MnpsArchetypeId;
}

/**
 * D-Total 가중치·Inter-correlation 설정
 * - SD4(Short Dark Tetrad): 4개 특성 각각 7문항 평균, 특성 간 동일 가중(문헌 기준).
 * - 본 시스템: 복합 D 점수 = 가중 합산 + Inter-correlation 가산. 실측/문헌 확보 시 아래 값 재설정.
 */
export const D_SCORE_CONFIG = {
  /** Dark Tetrad 특성별 가중치. SD4는 모두 1.0(동일); 실측 시 상대적 기여도 반영 가능 */
  traitWeights: {
    machiavellianism: 1.0,
    narcissism: 0.9,
    psychopathy: 1.1,
    sadism: 1.0,
  } as Record<DarkTrait, number>,
  /** D-Factor 하위요인별 가중치. 문헌(darkfactor.org 등) 반영 시 조정 */
  subFactorWeights: {
    egoism: 0.9,
    moralDisengagement: 1.0,
    entitlement: 1.0,
    spitefulness: 1.1,
  } as Record<DarkSubFactor, number>,
  /** Inter-correlation 가산 계수: trait 평균 × 이 값이 D-Total에 가산. 0이면 가산 없음(순수 가중평균). */
  interCorrelationCoeff: 0.2,
  /** Inter-correlation 가산 상한(점). 0~100 척도에서 base에 더해지는 최대치 */
  interCorrelationMax: 20,
} as const;

const TRAIT_WEIGHTS = D_SCORE_CONFIG.traitWeights;
const SUBFACTOR_WEIGHTS = D_SCORE_CONFIG.subFactorWeights;

/**
 * 규준·임계값 (high/mid/low 구간)
 * - 규준 데이터(평균·표준편차·백분위) 확보 시 상수 재설정 권장 (예: 상위 25% = high)
 * - 참고: Short Dark Tetrad 등에서는 중앙값 분할 또는 3분위 사용
 *
 * --- NORM_CONFIG 보정 가이드 (analyze_mnps_norms() RPC 결과 활용) ---
 * 1) 통계 조회: Supabase RPC `analyze_mnps_norms()` 또는 GET /api/admin/mnps/norm-analysis
 *    - 반환 JSON: { raw_d_total: { n, mean, stddev, p50, p70, p80, p90 }, traits: { machiavellianism: {...}, ... } }
 *    - p50/p70/p80/p90 = 상위 50%/30%/20%/10% 지점의 점수(0~100).
 * 2) 매핑 제안:
 *    - highCutoff  → raw_d_total.p80 (상위 20% 하한). 예: Math.round(result.raw_d_total.p80)
 *    - midCutoff   → raw_d_total.p50 (중위). 예: Math.round(result.raw_d_total.p50)
 *    - archetypeHighCutoff / subFactorHighCutoff → 4개 trait의 p80 평균. 예: (mach.p80 + narc.p80 + psych.p80 + sadism.p80) / 4
 *    - dTotalCritical → raw_d_total.p90 (상위 10% 근처). 예: Math.round(result.raw_d_total.p90)
 *    - dTotalHigh    → raw_d_total.p80 (상위 20%). 예: Math.round(result.raw_d_total.p80)
 * 3) 적용: 값은 0~100으로 clamp 후 정수로 반올림. 샘플 수(n)가 10건 미만이면 보정 보류 권장.
 */
export const NORM_CONFIG = {
  /** high 구간 하한 (0~100). 질문이 매운맛으로 조정되어 고득점이 어려워짐 → 70으로 하향 */
  highCutoff: 70,
  /** mid 구간 하한. high 미만·mid 이상 = mid, 그 미만 = low */
  midCutoff: 40,
  /** 아키타입 단일 최고 trait 임계 (ordered[0].value >= 이 값). 필요 시 65로 소폭 하향 고려 */
  archetypeHighCutoff: 70,
  /** SubFactor(도덕적 이탈·악의성) "높음" 판정 임계 → archetypeHighCutoff와 동일 적용 */
  subFactorHighCutoff: 70,
  /** D-Total·최종 시나리오 강도 구간 (critical/high/moderate) → p90 / p80 권장 */
  dTotalCritical: 85,
  dTotalHigh: 70,
} as const;

/**
 * 정규화 유틸리티: 1~5 Likert 평균을 0~100 점수로 변환
 */
function normalizeLikert(avg: number): number {
  // 1 → 0, 5 → 100
  const clamped = Math.min(5, Math.max(1, avg));
  return ((clamped - 1) / 4) * 100;
}

/** 검증 문항 ID (동적 계산용. v2,v5,v6,v8 제거 — 4문항만 사용) */
const VALIDATION_IDS = ['v1', 'v3', 'v4', 'v7'] as const;
/** 역코딩 적용할 검증 문항 ID (v3: 바람직성, v7: 비난받을 생각 숨김) */
const VALIDATION_REVERSE_IDS = new Set<string>(['v3', 'v7']);

/** 일관성 쌍 문항 (동의어: 같은 구인 다른 표현). 쌍별 |답1−답2|로 분석 정확도 반영 */
const CONSISTENCY_PAIRS: [string, string][] = [['n1', 'n1b'], ['m1', 'm1b']];

/** 문항당 최소 소요 시간(ms). 이보다 짧으면 분석 정확도 -30 페널티 */
const MIN_MS_PER_QUESTION = 800;

/** 불성실 응답 패턴 감지: Longstring Index. 동일 응답이 이 횟수 이상 연속이면 기둥 세우기 의심 */
const LSI_THRESHOLD = 6;
/** 극단 지그재그(1-5 또는 5-1) 비율. (연속 쌍 중 이 비율 이상이면 지그재그 의심) */
const ALTERNATING_RATIO_THRESHOLD = 0.28;
/** 패턴 감지 시 analysisAccuracy 추가 패널티 */
const PATTERN_PENALTY = 10;

/**
 * 연속 동일 값 최대 길이 (Longstring Index)
 */
function maxConsecutiveSame(values: number[]): number {
  if (values.length === 0) return 0;
  let max = 1;
  let run = 1;
  for (let i = 1; i < values.length; i++) {
    if (values[i] === values[i - 1]) {
      run += 1;
      max = Math.max(max, run);
    } else {
      run = 1;
    }
  }
  return max;
}

/**
 * 극단 반복 패턴: 연속 쌍 중 |a-b| === 4 (1-5, 5-1, 2-4, 4-2)인 쌍 비율
 */
function alternatingExtremeRatio(values: number[]): number {
  if (values.length < 2) return 0;
  let count = 0;
  for (let i = 0; i < values.length - 1; i++) {
    const diff = Math.abs(values[i]! - values[i + 1]!);
    if (diff === 4) count += 1;
  }
  return count / (values.length - 1);
}

/**
 * 검증 점수 비선형 매핑 (4문항 환경에서 1문항 실수/보통 응답 허용).
 * 선형 [0, 25, 50, 75, 100] 대신 [0, 40, 70, 90, 100]으로 매핑하여
 * 중상위 구간을 완화하고 False Positive(일반 사용자 검증 실패)를 줄임.
 * ratio: 0~1 (획득점수/만점)
 */
function mapValidationRatioToDisplay(ratio: number): number {
  const r = Math.max(0, Math.min(1, ratio));
  if (r <= 0.25) return (r / 0.25) * 40;
  if (r <= 0.5) return 40 + ((r - 0.25) / 0.25) * 30;
  if (r <= 0.75) return 70 + ((r - 0.5) / 0.25) * 20;
  return 90 + ((r - 0.75) / 0.25) * 10;
}

/**
 * 100점을 초과하는 Raw Score를 표출용 0~100 점수로 매핑.
 * 전략: 0~90점까지는 선형, 90점 이상부터는 tanh로 압축하여 변별력 확보.
 * rawScore가 120(이론상 최대 근사치)일 때 약 99.9가 되도록 조정.
 */
function mapRawDTotalToDisplay(rawScore: number): number {
  if (rawScore <= 0) return 0;
  if (rawScore <= 90) return Math.min(90, Math.max(0, rawScore));

  // 90점 초과: 남은 10점 구간(90~100)에 대해 비선형 매핑 (tanh로 부드럽게 100에 수렴)
  const excess = rawScore - 90;
  const compressed = 10 * Math.tanh(excess / 15);

  return Math.min(99.9, 90 + compressed);
}

/**
 * Dark Nature 종합 스코어 계산
 * @param answers trait/subFactor가 있는 문항 답변 (시나리오 포함 32문항)
 * @param options.validationScores 검증 문항(v1,v3,v4,v7) 원점수 1~5. 있으면 일관성·방어 지표 산출
 * @param options.responseTimeMs 전체 테스트 소요 시간(ms). 문항당 0.8초 미만이면 analysisAccuracy -30
 * @param options.questionCount 문항 수. responseTimeMs와 함께 사용
 * @param options.patternAnalysisValues 문항 표시 순서대로의 응답 값 배열(1~5). 있으면 LSI·지그재그 패턴 감지
 */
export function scoreDarkNature(
  answers: DarkAnswer[],
  options?: {
    validationScores?: Record<string, number>;
    responseTimeMs?: number;
    questionCount?: number;
    patternAnalysisValues?: number[];
  }
): DarkNatureResult {
  if (!answers.length) {
    const zeroTraits: DarkTraitScores = {
      machiavellianism: 0,
      narcissism: 0,
      psychopathy: 0,
      sadism: 0,
    };
    const zeroSubs: DarkSubFactorScores = {
      egoism: 0,
      moralDisengagement: 0,
      entitlement: 0,
      spitefulness: 0,
    };
    const detailedArchetype = determineArchetype(zeroTraits, 0);
    return {
      traitScores: zeroTraits,
      subFactorScores: zeroSubs,
      dTotal: 0,
      rawDTotal: 0,
      isExtremeTop: false,
      analysisAccuracy: 50,
      archetype: detailedArchetype,
    };
  }

  const traitSums: Record<DarkTrait, { sum: number; count: number }> = {
    machiavellianism: { sum: 0, count: 0 },
    narcissism: { sum: 0, count: 0 },
    psychopathy: { sum: 0, count: 0 },
    sadism: { sum: 0, count: 0 },
  };
  const traitValues: Record<DarkTrait, number[]> = {
    machiavellianism: [],
    narcissism: [],
    psychopathy: [],
    sadism: [],
  };

  const subSums: Record<DarkSubFactor, { sum: number; count: number }> = {
    egoism: { sum: 0, count: 0 },
    moralDisengagement: { sum: 0, count: 0 },
    entitlement: { sum: 0, count: 0 },
    spitefulness: { sum: 0, count: 0 },
  };

  // 가중치가 포함된 합산
  let weightedSum = 0;
  let weightTotal = 0;

  for (const a of answers) {
    // Dark Tetrad 문항 (trait 있음)
    if (a.trait) {
      traitSums[a.trait].sum += a.value;
      traitSums[a.trait].count += 1;
      traitValues[a.trait].push(a.value);
    }

    // D-Factor 문항 (subFactor 있음)
    if (a.subFactor) {
      subSums[a.subFactor].sum += a.value;
      subSums[a.subFactor].count += 1;
    }

    // 가중치 계산: trait와 subFactor 모두 있으면 평균, 하나만 있으면 그 가중치 사용
    const wTrait = a.trait ? TRAIT_WEIGHTS[a.trait] : 0;
    const wSub = a.subFactor ? SUBFACTOR_WEIGHTS[a.subFactor] : 0;
    const w = wTrait && wSub ? (wTrait + wSub) / 2 : (wTrait || wSub || 1.0);
    weightedSum += w * a.value;
    weightTotal += w * 5; // 최대값 기준 정규화용
  }

  const traitScores: DarkTraitScores = {
    machiavellianism: normalizeLikert(traitSums.machiavellianism.sum / Math.max(1, traitSums.machiavellianism.count)),
    narcissism: normalizeLikert(traitSums.narcissism.sum / Math.max(1, traitSums.narcissism.count)),
    psychopathy: normalizeLikert(traitSums.psychopathy.sum / Math.max(1, traitSums.psychopathy.count)),
    sadism: normalizeLikert(traitSums.sadism.sum / Math.max(1, traitSums.sadism.count)),
  };

  const subFactorScores: DarkSubFactorScores = {
    egoism: normalizeLikert(subSums.egoism.sum / Math.max(1, subSums.egoism.count)),
    moralDisengagement: normalizeLikert(subSums.moralDisengagement.sum / Math.max(1, subSums.moralDisengagement.count)),
    entitlement: normalizeLikert(subSums.entitlement.sum / Math.max(1, subSums.entitlement.count)),
    spitefulness: normalizeLikert(subSums.spitefulness.sum / Math.max(1, subSums.spitefulness.count)),
  };

  // Inter‑correlation Weight: 특성들 간 평균이 높을수록 가산 (D_SCORE_CONFIG 기반)
  const traitAvg =
    (traitScores.machiavellianism +
      traitScores.narcissism +
      traitScores.psychopathy +
      traitScores.sadism) /
    4;
  const rawInterCorr = traitAvg * D_SCORE_CONFIG.interCorrelationCoeff;
  const interCorrelationWeight = Math.min(
    D_SCORE_CONFIG.interCorrelationMax,
    Math.max(0, rawInterCorr)
  );

  const base = weightTotal > 0 ? (weightedSum / weightTotal) * 100 : 0;
  // rawDTotal: 100 초과 가능 (천장 효과 제거). 표출용 dTotal은 비선형 매핑
  const rawDTotal = Math.max(0, base + interCorrelationWeight);
  const isExtremeTop = rawDTotal > 100;
  const dTotal = mapRawDTotalToDisplay(rawDTotal);

  const consistencySpread =
    Math.max(traitScores.machiavellianism, traitScores.narcissism, traitScores.psychopathy, traitScores.sadism) -
    Math.min(traitScores.machiavellianism, traitScores.narcissism, traitScores.psychopathy, traitScores.sadism);

  // 검증 점수: 동적 계산 후 비선형 매핑 (1문항 실수/보통 허용, False Positive 완화)
  let validationScore: number | undefined;
  if (options?.validationScores && typeof options.validationScores === 'object') {
    const vs = options.validationScores;
    const validationIds = [...VALIDATION_IDS];
    const maxPossibleValidation = validationIds.length * 5;
    let currentValidationScore = 0;
    validationIds.forEach((id) => {
      let score = Number(vs[id]) || 3;
      if (VALIDATION_REVERSE_IDS.has(id)) score = 6 - score;
      currentValidationScore += Math.min(5, Math.max(1, score));
    });
    const linearRatio = maxPossibleValidation > 0
      ? currentValidationScore / maxPossibleValidation
      : 0.5;
    validationScore = mapValidationRatioToDisplay(linearRatio);
  }

  // Trait 내부 일관성(SD): 1~5 척도에서 SD가 0.3~1.2면 "차별화되면서 일관된 응답" → 보너스 최대 +5
  function sd(arr: number[]): number {
    if (arr.length < 2) return 0;
    const mean = arr.reduce((s, x) => s + x, 0) / arr.length;
    const variance = arr.reduce((s, x) => s + (x - mean) ** 2, 0) / arr.length;
    return Math.sqrt(variance);
  }
  let internalConsistencyBonus = 0;
  const traits: DarkTrait[] = ['machiavellianism', 'narcissism', 'psychopathy', 'sadism'];
  for (const t of traits) {
    const vals = traitValues[t];
    if (vals.length >= 2) {
      const s = sd(vals);
      if (s >= 0.3 && s <= 1.2) internalConsistencyBonus += 1.25;
    }
  }
  internalConsistencyBonus = Math.min(5, Math.round(internalConsistencyBonus));

  // 일관성 쌍 문항: 쌍별 |답1−답2| 평균이 작을수록 보너스, 클수록 패널티 (최대 ±5)
  let pairConsistencyBonus = 0;
  const pairDiffs: number[] = [];
  for (const [id1, id2] of CONSISTENCY_PAIRS) {
    const a1 = answers.find((a) => a.questionId === id1)?.value;
    const a2 = answers.find((a) => a.questionId === id2)?.value;
    if (a1 != null && a2 != null) pairDiffs.push(Math.abs(a1 - a2));
  }
  if (pairDiffs.length > 0) {
    const avgDiff = pairDiffs.reduce((s, d) => s + d, 0) / pairDiffs.length;
    if (avgDiff <= 0.5) pairConsistencyBonus = 5;
    else if (avgDiff <= 1) pairConsistencyBonus = 3;
    else if (avgDiff <= 1.5) pairConsistencyBonus = 0;
    else if (avgDiff <= 2) pairConsistencyBonus = -3;
    else pairConsistencyBonus = -5;
  }

  // 응답 시간 검증: 문항당 0.8초 미만이면 물리적으로 읽기 어려움 → analysisAccuracy -30
  const questionCount = options?.questionCount ?? answers.length;
  const responseTimeMs = options?.responseTimeMs;
  const responseTimePenalty =
    questionCount > 0 &&
    responseTimeMs != null &&
    responseTimeMs >= 0 &&
    responseTimeMs / questionCount < MIN_MS_PER_QUESTION;

  // 불성실 응답 패턴: LSI(동일 응답 연속 k회 이상) · 지그재그(1-5-1-5 극단 반복)
  const patternValues = options?.patternAnalysisValues?.filter((v) => v >= 1 && v <= 5) ?? [];
  let insincereResponsePattern = false;
  if (patternValues.length >= LSI_THRESHOLD) {
    const lsi = maxConsecutiveSame(patternValues);
    const altRatio = alternatingExtremeRatio(patternValues);
    if (lsi >= LSI_THRESHOLD || altRatio >= ALTERNATING_RATIO_THRESHOLD) {
      insincereResponsePattern = true;
    }
  }

  // 분석 정확도: Base 80 + ... + 패턴 페널티(불성실 응답 의심 시 -10). 50~99 범위.
  const baseScore = 80;
  const validationBonus =
    validationScore != null ? (validationScore / 100) * 20 : 0;
  const rawConsistencyPenalty =
    consistencySpread < 20 ? Math.min(20, 20 - consistencySpread) : 0;
  const consistencyPenalty =
    validationScore != null
      ? rawConsistencyPenalty * (1 - validationScore / 100)
      : rawConsistencyPenalty;
  const timePenaltyAmount = responseTimePenalty ? 30 : 0;
  const patternPenaltyAmount = insincereResponsePattern ? PATTERN_PENALTY : 0;
  const analysisAccuracy = Math.min(
    99,
    Math.max(
      50,
      baseScore +
        validationBonus -
        consistencyPenalty +
        internalConsistencyBonus +
        pairConsistencyBonus -
        timePenaltyAmount -
        patternPenaltyAmount
    )
  );

  // 다이내믹 아키타입 결정 (16+종 정밀 판별)
  const detailedArchetype = determineArchetype(traitScores, dTotal);

  return {
    traitScores,
    subFactorScores,
    dTotal,
    rawDTotal,
    isExtremeTop,
    archetype: detailedArchetype,
    validationScore,
    consistencySpread,
    analysisAccuracy,
    responseTimePenalty: responseTimePenalty || undefined,
    insincereResponsePattern: insincereResponsePattern || undefined,
  };
}

// ----------------- 해석 생성 -----------------

export interface InterpretationBlock {
  title: string;
  summary: string;
  highlights: string[];
  risks?: string[];
}

export interface DarkNatureInterpretation {
  good: InterpretationBlock;
  bad: InterpretationBlock;
}

export function buildInterpretation(result: DarkNatureResult): DarkNatureInterpretation {
  const { traitScores, subFactorScores, dTotal } = result;
  const { highCutoff, midCutoff } = NORM_CONFIG;

  const veryHigh = (v: number) => v >= highCutoff + 5;
  const high = (v: number) => v >= highCutoff;
  const medium = (v: number) => v >= midCutoff && v < highCutoff;
  const low = (v: number) => v < midCutoff;

  // Good Version (Euphemistic) - 제안된 매핑 로직 반영
  const goodHighlights: string[] = [];

  // 마키아벨리즘
  if (veryHigh(traitScores.machiavellianism)) {
    goodHighlights.push(
      '**탁월한 전략적 실행력**: 목표 달성을 위해 자원을 효율적으로 배치하고 정치적 흐름을 읽는 능력이 뛰어납니다.',
    );
  } else if (high(traitScores.machiavellianism)) {
    goodHighlights.push(
      '복잡한 인간관계와 조직 내 정치 상황을 읽어내는 **전략적 판단력**이 뛰어납니다.',
    );
  } else if (medium(traitScores.machiavellianism)) {
    goodHighlights.push(
      '상황에 맞는 유연한 접근 방식을 취할 수 있는 **적응력**을 보입니다.',
    );
  }

  // 나르시시즘
  if (veryHigh(traitScores.narcissism)) {
    goodHighlights.push(
      '**강력한 자기 확신과 리더십**: 스스로를 믿고 앞으로 밀어붙일 수 있는 카리스마와 영향력을 지니고 있습니다.',
    );
  } else if (high(traitScores.narcissism)) {
    goodHighlights.push(
      '스스로를 믿고 앞으로 밀어붙일 수 있는 **강한 자기 확신과 리더십 잠재력**이 있습니다.',
    );
  } else if (medium(traitScores.narcissism)) {
    goodHighlights.push(
      '자기 가치를 인정하고 목표를 향해 나아가는 **건강한 자존감**을 보입니다.',
    );
  }

  // 사이코패시
  if (veryHigh(traitScores.psychopathy)) {
    goodHighlights.push(
      '**압박 상황에서의 뛰어난 침착함**: 위기 상황에서도 감정에 휘둘리지 않고 빠르게 결단하는 실행력을 보입니다.',
    );
  } else if (high(traitScores.psychopathy)) {
    goodHighlights.push(
      '압박 상황에서도 침착함을 유지하며, **위험을 감수하고 빠르게 결단하는 실행력**을 보입니다.',
    );
  } else if (medium(traitScores.psychopathy)) {
    goodHighlights.push(
      '새로운 도전을 두려워하지 않고 **모험적 정신**을 지니고 있습니다.',
    );
  }

  // 사디즘
  if (veryHigh(traitScores.sadism)) {
    goodHighlights.push(
      '**지배적인 영향력과 회복탄력성**: 갈등 상황에서도 위축되지 않으며 경쟁 상대를 압도하는 강력한 카리스마를 보유하고 있습니다.',
    );
  } else if (high(traitScores.sadism)) {
    goodHighlights.push(
      '경쟁 상황에서 뒤로 물러서지 않고, **상대보다 앞서가려는 강한 승부욕**을 지니고 있습니다.',
    );
  } else if (medium(traitScores.sadism)) {
    goodHighlights.push(
      '경쟁 상황에서 **적극적이고 단호한 태도**를 보입니다.',
    );
  }

  // D-Factor 서브팩터
  if (high(subFactorScores.egoism)) {
    goodHighlights.push(
      '자신의 목표와 이익을 명확히 인식하고 추진하는 **자기주도성**이 강합니다.',
    );
  }
  if (high(subFactorScores.entitlement)) {
    goodHighlights.push(
      '자신의 가치를 높게 평가하고 적절한 보상을 기대하는 **자기 확신**을 보입니다.',
    );
  }

  if (!goodHighlights.length) {
    goodHighlights.push(
      '극단적인 성향보다는 **균형 잡힌 자기 보호 전략**을 사용하려는 경향이 보입니다.',
    );
  }

  // Summary 생성 (NORM_CONFIG.dTotalHigh, midCutoff 사용)
  const { dTotalHigh } = NORM_CONFIG;
  let summary = '';
  if (dTotal >= NORM_CONFIG.dTotalCritical) {
    summary = `당신의 Dark Nature 종합 점수는 약 ${Math.round(dTotal)}점으로, 매우 강한 전략적·지배적 성향을 보입니다. 이러한 특성은 리더십과 경쟁 상황에서 큰 강점으로 작용할 수 있습니다.`;
  } else if (dTotal >= dTotalHigh) {
    summary = `당신의 Dark Nature 종합 점수는 약 ${Math.round(dTotal)}점으로, 높은 긴장감 속에서도 전략적으로 움직일 여지가 있는 프로파일입니다.`;
  } else if (dTotal >= midCutoff) {
    summary = `당신의 Dark Nature 종합 점수는 약 ${Math.round(dTotal)}점으로, 상황에 따라 전략적 사고를 할 수 있는 균형 잡힌 프로파일입니다.`;
  } else {
    summary = `당신의 Dark Nature 종합 점수는 약 ${Math.round(dTotal)}점으로, 협력적이고 신뢰 기반의 관계를 중시하는 프로파일입니다.`;
  }

  const good: InterpretationBlock = {
    title: 'Good Version – 전략적 잠재력 보고서',
    summary,
    highlights: goodHighlights,
  };

  // Bad Version (Clinical / Raw) - 제안된 매핑 로직 반영
  const badHighlights: string[] = [];
  const badRisks: string[] = [];

  // 마키아벨리즘
  if (veryHigh(traitScores.machiavellianism)) {
    badHighlights.push(
      '**냉혹한 체스 플레이어**: 타인을 감정을 가진 인격체가 아닌 도구로 보며, 자신의 이익을 위해 기꺼이 기만합니다.',
    );
    badRisks.push(
      '장기적인 신뢰 관계 구축이 어렵고, 주변 사람들의 **강한 불신과 거리감**을 불러올 수 있습니다.',
    );
  } else if (high(traitScores.machiavellianism)) {
    badHighlights.push(
      '목적을 위해 사람을 수단으로 보는 경향이 강하며, 관계를 장기적인 신뢰보다 **도구적 가치**로 평가할 수 있습니다.',
    );
    badRisks.push('신뢰가 필요한 상황에서 주변 사람들의 **강한 불신과 거리감**을 불러올 수 있습니다.');
  } else if (medium(traitScores.machiavellianism)) {
    badHighlights.push(
      '상황에 따라 계산적으로 움직이는 편이며, 필요하다면 **정보를 조정하거나 숨기는 선택**을 할 수 있습니다.',
    );
  }

  // 나르시시즘
  if (veryHigh(traitScores.narcissism)) {
    badHighlights.push(
      '**과도한 자기중심성**: 비판을 개인에 대한 공격으로 과장 해석하며, 자신의 가치를 과대평가하는 경향이 강합니다.',
    );
    badRisks.push(
      '조직 내에서 **협업보다는 인정 욕구 중심으로 행동**할 가능성이 크며, 팀워크를 해칠 수 있습니다.',
    );
  } else if (high(traitScores.narcissism)) {
    badHighlights.push(
      '자기중심성이 강해지고, 비판을 **개인에 대한 공격으로 과장 해석**할 위험이 있습니다.',
    );
    badRisks.push('조직 내에서 **협업보다는 인정 욕구 중심으로 행동**할 가능성이 큽니다.');
  } else if (medium(traitScores.narcissism)) {
    badHighlights.push(
      '자신의 기여를 과대평가하거나, 다른 사람의 노력을 인정하지 않는 경향이 있습니다.',
    );
  }

  // 사이코패시
  if (veryHigh(traitScores.psychopathy)) {
    badHighlights.push(
      '**낮은 공감과 높은 충동성**: 타인의 감정이나 결과를 거의 고려하지 않고, 즉각적인 만족을 추구하는 경향이 강합니다.',
    );
    badRisks.push(
      '위험 감수 성향이 강해 **도덕적·법적 경계선을 넘는 행동**으로 이어질 수 있으며, 장기적 결과를 무시할 위험이 있습니다.',
    );
  } else if (high(traitScores.psychopathy)) {
    badHighlights.push(
      '충동성과 낮은 공감 수준이 결합되어, **타인의 감정이나 결과를 충분히 고려하지 않은 결정**을 내릴 수 있습니다.',
    );
    badRisks.push('위험 감수 성향이 강해 **도덕적·법적 경계선을 넘는 행동**으로 이어질 수 있습니다.');
  } else if (medium(traitScores.psychopathy)) {
    badHighlights.push(
      '감정적 유대보다는 즉각적인 결과에 집중하는 경향이 있으며, 타인의 감정을 이해하는 데 어려움을 느낄 수 있습니다.',
    );
  }

  // 사디즘
  if (veryHigh(traitScores.sadism)) {
    badHighlights.push(
      '**잔인한 포식자**: 타인의 고통에서 에너지를 얻으며, 무고한 사람의 자존감을 짓밟는 데서 순수한 즐거움을 느낍니다.',
    );
    badRisks.push(
      '갈등 상황을 필요 이상으로 악화시키고, **타인에게 정서적·심리적 피해**를 줄 수 있습니다.',
    );
  } else if (high(traitScores.sadism)) {
    badHighlights.push(
      '상대의 약점이나 불편함에서 **은근한 쾌감**을 느낄 수 있으며, 갈등 상황을 필요 이상으로 끌고 갈 위험이 있습니다.',
    );
    badRisks.push('타인과의 관계에서 **독성적이고 해로운 패턴**이 나타날 수 있습니다.');
  } else if (medium(traitScores.sadism)) {
    badHighlights.push(
      '경쟁 상황에서 상대의 불편함을 관찰하는 것에 흥미를 느끼는 경향이 있습니다.',
    );
  }

  // D-Factor 서브팩터
  if (high(subFactorScores.egoism)) {
    badHighlights.push(
      '자신의 이익을 최우선으로 하며, **타인의 필요나 감정을 무시**할 수 있습니다.',
    );
  }
  if (high(subFactorScores.entitlement)) {
    badHighlights.push(
      '과도한 권리 의식으로 인해 **불공평한 요구나 기대**를 할 수 있습니다.',
    );
  }
  if (high(subFactorScores.moralDisengagement)) {
    badHighlights.push(
      '도덕적 기준을 상황에 따라 유연하게 변경하여, **윤리적 경계를 넘는 행동**을 정당화할 수 있습니다.',
    );
  }
  if (high(subFactorScores.spitefulness)) {
    badHighlights.push(
      '손해를 감수하면서까지 상대를 곤란하게 만들려는 **앙심 기반 행동**이 나타날 수 있습니다.',
    );
    badRisks.push(
      '복수나 보복 행동으로 인해 **장기적인 관계 손상**이 발생할 수 있습니다.',
    );
  }

  if (!badHighlights.length) {
    badHighlights.push(
      '현재 프로파일은 극단적인 Dark 성향이 두드러지지는 않지만, 특정 상황에서 방어적/공격적 패턴이 나타날 여지는 존재합니다.',
    );
  }

  // Summary 생성
  let badSummary = '';
  if (dTotal >= 80) {
    badSummary =
      '이 보고서는 사회적·윤리적 관점에서 잠재적인 위험과 갈등 요인을 직접적으로 다룹니다. 매우 높은 Dark Nature 점수는 장기적인 인간관계와 사회적 적응에 심각한 문제를 일으킬 수 있습니다. 전문가 상담을 권장합니다.';
  } else if (dTotal >= 60) {
    badSummary =
      '이 보고서는 사회적·윤리적 관점에서 잠재적인 위험과 갈등 요인을 직접적으로 다룹니다. 높은 Dark Nature 점수는 특정 상황에서 타인에게 해를 끼치거나 신뢰를 손상시킬 위험이 있습니다.';
  } else {
    badSummary =
      '이 보고서는 사회적·윤리적 관점에서 잠재적인 위험과 갈등 요인을 직접적으로 다룹니다. 해석 시 불편함을 느낄 수 있습니다.';
  }

  const bad: InterpretationBlock = {
    title: 'Bad Version – Dark Risk Report',
    summary: badSummary,
    highlights: badHighlights,
    risks: badRisks.length > 0 ? badRisks : undefined,
  };

  return { good, bad };
}

// ----------------- Report Builder (Good / Bad Dual Report) -----------------

/**
 * ReportBuilder 입력 스코어
 * - dTotal: 0~100 종합 D 점수
 * - traits: DarkTrait별 0~100 점수
 */
export interface ReportScores {
  dTotal: number;
  traits: DarkTraitScores;
}

export interface GoodVersionReport {
  title: string;
  summary: string;
  bullets: string[];
  radarLabels: {
    trait: DarkTrait;
    goodLabel: string;
    badLabel: string;
  }[];
}

export interface BadVersionDeepDive {
  title: string;
  intensityLevel: 'moderate' | 'high' | 'critical';
  hiddenMask: string;
  destructivePatterns: string;
  why: string;
  riskWarning: string;
  socialPersona: string;
  weaknessAnalysis: string;
  villainType: string;
  fullText: string;
}

export interface BadVersionView {
  teaser: string;
  locked: boolean;
  deepDive?: BadVersionDeepDive;
}

export interface GeneratedReport {
  scores: ReportScores;
  darkKeywords: string[];
  good: GoodVersionReport;
  bad: BadVersionView;
}

/**
 * Dark Nature Test - Dual Report Generator
 * - Good Version: 전략적 잠재력 보고서 (무료)
 * - Bad Version: Raw Malice Analysis (유료, 티저만 무료)
 */
export function generateReport(scores: ReportScores, isPaid: boolean): GeneratedReport {
  const { dTotal, traits } = scores;
  const { highCutoff, midCutoff, dTotalCritical, dTotalHigh } = NORM_CONFIG;

  const veryHigh = (v: number) => v >= highCutoff + 5;
  const high = (v: number) => v >= highCutoff;
  const medium = (v: number) => v >= midCutoff && v < highCutoff;

  // 1. 주요 특성 정렬 (키워드/빌런 타입용)
  const orderedTraits = (Object.keys(traits) as DarkTrait[]).sort(
    (a, b) => traits[b] - traits[a],
  );
  const primaryTrait = orderedTraits[0];
  const secondaryTrait = orderedTraits[1];

  // 2. Good Version – Strategic Potential Report
  const goodBullets: string[] = [];

  if (medium(traits.machiavellianism) || high(traits.machiavellianism) || veryHigh(traits.machiavellianism)) {
    goodBullets.push(
      '당신은 복잡한 이해관계 속에서도 한두 수 앞을 내다보는 **전략적 민첩성(Strategic Agility)**을 가지고 있습니다.',
    );
  }
  if (medium(traits.narcissism) || high(traits.narcissism) || veryHigh(traits.narcissism)) {
    goodBullets.push(
      '스스로의 가치를 과소평가하지 않고, 무대 중앙에 설 수 있는 **흔들리지 않는 자기 확신(Unshakable Self-Confidence)**을 보유하고 있습니다.',
    );
  }
  if (medium(traits.psychopathy) || high(traits.psychopathy) || veryHigh(traits.psychopathy)) {
    goodBullets.push(
      '위기 상황에서도 감정에 휘둘리기보다 결과를 우선시하는 **압박 하에서의 정서적 결단력(Emotional Decisiveness)**이 돋보입니다.',
    );
  }
  if (medium(traits.sadism) || high(traits.sadism) || veryHigh(traits.sadism)) {
    goodBullets.push(
      '경쟁 구도에서 뒤로 물러서지 않고, 상대의 움직임을 읽어내는 **공격적이지만 전략적인 경쟁력(Competitive Edge)**을 사용할 수 있습니다.',
    );
  }

  if (!goodBullets.length) {
    goodBullets.push(
      '당신의 Dark Nature 점수는 상대적으로 낮지만, 이는 **신뢰 기반의 협력과 장기적 관계 구축**에서 강점을 가진다는 의미이기도 합니다.',
    );
  }

  let goodSummary: string;
  if (dTotal >= dTotalCritical) {
    goodSummary =
      '당신은 정서적으로 평범한 다수와는 다른, 고강도 전략형 프로파일입니다. 위험과 갈등이 많은 환경일수록 당신의 집중력과 정치적 감각이 더 선명해집니다.';
  } else if (dTotal >= dTotalHigh) {
    goodSummary =
      '당신의 Dark Nature는 필요할 때 꺼내 쓸 수 있는 숨겨진 무기와 같습니다. 조직 내 복잡한 이해관계 속에서 냉정함과 추진력을 동시에 유지할 수 있습니다.';
  } else if (dTotal >= midCutoff) {
    goodSummary =
      '당신은 기본적으로 협력적이지만, 필요할 때는 전략적인 거리 두기와 자기 보호 본능을 활용할 줄 아는 균형형 프로파일입니다.';
  } else {
    goodSummary =
      '당신의 점수는 Dark Nature 측면에서 비교적 낮은 편입니다. 이는 공격적 전략보다는 신뢰와 안정감을 기반으로 한 리더십 스타일에 더 잘 맞는 성향입니다.';
  }

  const good: GoodVersionReport = {
    title: '전략적 잠재력 보고서 – 다크 네이처 긍정 해석',
    summary: goodSummary,
    bullets: goodBullets,
    radarLabels: [
      {
        trait: 'machiavellianism',
        goodLabel: '전략적 기동력과 정치 지성',
        badLabel: '냉정한 도구적 조종',
      },
      {
        trait: 'narcissism',
        goodLabel: '흔들리지 않는 자기 확신과 비전',
        badLabel: '취약한 자아와 과대 자아 집착',
      },
      {
        trait: 'psychopathy',
        goodLabel: '압박 하의 회복력과 결단력',
        badLabel: '정서적 무감각과 무모한 충동',
      },
      {
        trait: 'sadism',
        goodLabel: '단호한 지배력과 경쟁 우위',
        badLabel: '타인의 고통에 대한 잔혹한 쾌감',
      },
    ],
  };

  // 3. Dark Keywords & Villain Typing
  const keywords: string[] = [];
  let villainType: string;

  switch (primaryTrait) {
    case 'machiavellianism':
      keywords.push('침묵형 전략가', '카리스마 조종자', '장기전 설계자');
      villainType = '정면 승부 대신, 뒤에서 판을 설계하는 **정치적 설계자 타입**입니다.';
      break;
    case 'narcissism':
      keywords.push('무대 중심 자아', '영광 추구 비전가', '스포트라이트 헌터');
      villainType = '무대 위 스포트라이트가 꺼지는 순간을 무엇보다 두려워하는 **무대 중심 카리스마 타입**입니다.';
      break;
    case 'psychopathy':
      keywords.push('위험 감수 실행자', '정서적 무감각 실행자', '위기 중독형');
      villainType = '위험과 혼란 속에서만 숨을 쉬는 것처럼 느끼는 **위기 중독 실행자 타입**입니다.';
      break;
    case 'sadism':
      keywords.push('사회적 포식자', '고통 지향 관찰자', '통제 열정가');
      villainType = '상대의 표정이 무너지는 순간을 가장 솔직한 데이터로 여기는 **사회적 포식자 타입**입니다.';
      break;
  }

  // 4. Bad Version – Raw Malice Analysis (깊이 해석)
  const intensity: BadVersionDeepDive['intensityLevel'] =
    dTotal >= dTotalCritical ? 'critical' : dTotal >= dTotalHigh ? 'high' : 'moderate';

  // Hidden Mask
  const hiddenMask = (() => {
    if (dTotal >= dTotalHigh) {
      return '당신은 일상에서 충분히 매력적이고 기능적인 인격을 연기합니다. 공감하는 표정, 적절한 리액션, 팀을 배려하는 멘트까지 모두 준비된 레퍼토리 안에 들어 있습니다. 하지만 이 모든 것은 진짜 감정보다, 상황을 통제하기 위한 계산에 더 가깝습니다.';
    }
    return '당신은 평소에는 비교적 온화하고 무난한 인상을 유지하려고 합니다. 다만 갈등이 깊어지거나 이해관계가 걸리는 순간, 공감보다 “어떻게 이 판을 유리하게 끝낼 것인가”에 초점이 이동하는 경향이 있습니다.';
  })();

  // Destructive Patterns
  const destructivePatterns = (() => {
    if (primaryTrait === 'machiavellianism') {
      return '갈등이 생기면 정면충돌보다, 서서히 상대의 평판을 깎아내리는 쪽을 선호하는 경향이 있습니다. 직접 공격하기보다는 제3자를 활용해 이야기를 흘리거나, 필요한 정보만 골라 제공해 상대를 고립시키는 방식의 심리전을 구사할 수 있습니다.';
    }
    if (primaryTrait === 'narcissism') {
      return '비판을 받는 순간, 문제의 핵심을 보기보다 “누가 감히 나를 흔드는가”에 집중하게 됩니다. 그 결과, 합리적인 피드백조차 공격으로 인식하며, 상대를 가스라이팅하거나 “문제는 너”라고 돌려버리는 패턴이 반복될 수 있습니다.';
    }
    if (primaryTrait === 'psychopathy') {
      return '당신은 조직의 규칙이나 정서적 분위기를 “필요하면 지키고, 아니면 넘을 수 있는 것” 정도로 보는 경향이 있습니다. 그래서 단기 성과를 위해 팀의 신뢰를 희생시키거나, 누군가를 희생양으로 삼는 선택을 서슴지 않을 수 있습니다.';
    }
    // sadism
    return '갈등 상황에서 당신은 상대가 무너지는 과정을 유심히 관찰합니다. 논리로 상대를 몰아붙이거나, 집단 속에서 한 사람을 은근히 따돌리게 만들고 그 반응을 지켜보는 식으로 “관찰자이자 연출자” 역할을 즐길 위험이 있습니다.';
  })();

  // Why – Core Motive
  const why = (() => {
    if (dTotal >= highCutoff) {
      return '당신은 단순히 이기고 싶어 하는 사람이 아닙니다. **승리 그 자체보다 상대가 패배하는 모습**에서 더 강한 긴장감과 해방감을 느낍니다. 즉, 목표 달성은 수단이고, 진짜 목적은 “누가 위인지”를 끝까지 확인하는 것입니다.';
    }
    if (high(dTotal)) {
      return '당신의 핵심 동기는 “절대 약자로 보이고 싶지 않다”는 감각에 가깝습니다. 그래서 누군가가 당신을 가볍게 보거나 무시하려 들 때, 실제 위협 이상으로 강한 방어와 역공이 작동합니다.';
    }
    return '당신의 동기는 전통적인 악의라기보다는, **상대에게 휘둘리고 싶지 않다는 자기 보호 욕구**에 가깝습니다. 다만 이 방어가 과도해질 경우, 주변 사람에게는 충분히 공격처럼 느껴질 수 있습니다.';
  })();

  // Risk Warning
  const riskWarning = (() => {
    if (intensity === 'critical') {
      return '지금과 같은 패턴이 강화되면, 직장 내 괴롭힘, 정서적 학대, 명예훼손, 배임·횡령과 같은 **법적 리스크**로 이어질 가능성이 큽니다. “한 번쯤은 괜찮겠지”라는 생각으로 넘긴 선택들이, 몇 년 뒤 당신의 이름으로 남을 기록을 만든다는 점을 잊지 마십시오.';
    }
    if (intensity === 'high') {
      return '당신의 성향은 갈등이 심해질수록 더 극단적인 선택을 부추기는 경향이 있습니다. 지금 단계에서 멈추지 않으면, **직장 내 신뢰 붕괴, 관계 단절, 평판 손상**이 한 번에 터지는 지점을 경험할 수 있습니다.';
    }
    return '현재로서는 치명적인 단계는 아니지만, 특정 스트레스 상황(배신감, 무시당함, 공개적인 망신 등)에서 **평소의 윤리 기준을 스스로 무효화시키는 선택**을 할 위험이 있습니다.';
  })();

  // Social Persona
  const socialPersona = (() => {
    switch (secondaryTrait ?? primaryTrait) {
      case 'machiavellianism':
        return '겉으로는 합리적이고 중립적인 조정자처럼 보이지만, 실제로는 판을 설계하고 사람을 배치하는 데 더 큰 관심을 두는 **전략가형 페르소나**를 사용합니다.';
      case 'narcissism':
        return '사교적인 자리에서 에너지가 올라가며, 인정과 주목을 자연스럽게 끌어오는 **카리스마형 퍼포머 페르소나**를 사용합니다.';
      case 'psychopathy':
        return '위기 상황일수록 더 침착해 보이며, 감정이입 대신 해결책을 제시하는 **냉정한 해결사 페르소나**를 사용합니다.';
      case 'sadism':
      default:
        return '집단 안에서 미묘한 서열과 긴장감을 감지하며, 갈등의 흐름을 관전하거나 유도하는 **관찰자이자 연출자 페르소나**를 사용합니다.';
    }
  })();

  // Weakness Analysis
  const weaknessAnalysis = (() => {
    switch (primaryTrait) {
      case 'machiavellianism':
        return '당신과 비슷한 성향을 가진 이들이 가장 두려워하는 것은 “숨은 의도가 완전히 들통나는 순간”입니다. 더 이상 계산이 통하지 않는 관계 앞에서, 스스로도 어떤 얼굴로 반응해야 할지 모르게 됩니다.';
      case 'narcissism':
        return '당신과 같은 프로파일은 **공개적인 무시, 조롱, 무관심**을 가장 강한 위협으로 느낍니다. 아무도 주목하지 않는 무대에서 오래 버티는 것이 가장 큰 숙제입니다.';
      case 'psychopathy':
        return '**장기적인 책임과 정서적 돌봄이 요구되는 관계**가 가장 부담스럽습니다. 돌이킬 수 없는 결과 앞에서 “그땐 어쩔 수 없었다”는 변명이 통하지 않을 때, 내면의 공허감이 확대됩니다.';
      case 'sadism':
      default:
        return '당신과 유사한 성향의 사람들은 **상대가 무너지지 않고 끝까지 버티는 장면**을 가장 견디기 어려워합니다. 예상한 만큼 상대가 흔들리지 않는 순간, 통제감을 잃었다는 공포가 고스란히 자신에게 되돌아옵니다.';
    }
  })();

  const deepDive: BadVersionDeepDive = {
    title: '잔혹 분석 – 당신 안의 어두운 알고리즘',
    intensityLevel: intensity,
    hiddenMask,
    destructivePatterns,
    why,
    riskWarning,
    socialPersona,
    weaknessAnalysis,
    villainType,
    fullText:
      `${hiddenMask}\n\n` +
      `${destructivePatterns}\n\n` +
      `${why}\n\n` +
      `${socialPersona}\n\n` +
      `${weaknessAnalysis}\n\n` +
      `${riskWarning}\n\n` +
      `※ 이 리포트는 법적·임상적 진단이 아니라, Dark Nature 경향성을 기반으로 한 심리적 시뮬레이션입니다.`,
  };

  // 5. Teaser (Curiosity Gap) – Bad Version 일부만 공개
  const teaserSentences: string[] = [];
  teaserSentences.push(
    `당신의 ${Math.round(
      dTotal,
    )}점은 평범한 사람들과 섞여 살기 위한 최소한의 연기를 이미 마스터했음을 의미합니다.`,
  );
  teaserSentences.push(
    '하지만 스트레스가 임계점을 넘는 순간, 당신은 주변 사람을 동료가 아니라 **소모 가능한 자원**으로 보기 시작합니다.',
  );

  const teaser = teaserSentences.join(' ');

  const bad: BadVersionView = {
    teaser,
    locked: !isPaid,
    deepDive: isPaid ? deepDive : undefined,
  };

  return {
    scores,
    darkKeywords: keywords,
    good,
    bad,
  };
}

// ----------------- Synergy-based Archetype Engine -----------------

export interface DarkProfile {
  totalDScore: number;
  archetype: string;
  goodReport: string;
  badTeaser: string;
  fullBadReport: string;
}

export interface AssembledReport {
  totalDScore: number;
  archetype: string;
  headline?: string;
  highlights?: string[];
  goodReport: string;
  badTeaser: string;
  fullBadReport?: string; // isPaid === true일 때만 포함
}

/**
 * 시너지 기반 아키타입 엔진
 * - 단순 합산이 아닌 상호 작용, 시너지, 최상위 두 특성 조합에 따라 프로파일 생성
 */
export function calculateDarkProfile(raw: DarkNatureResult): DarkProfile {
  const { traitScores, dTotal } = raw;
  const { highCutoff, midCutoff, archetypeHighCutoff } = NORM_CONFIG;

  const m = traitScores.machiavellianism;
  const n = traitScores.narcissism;
  const p = traitScores.psychopathy;
  const s = traitScores.sadism;

  const high = (v: number) => v >= highCutoff;
  const mid = (v: number) => v >= midCutoff && v < highCutoff;

  // 1. 다이내믹 프로파일 매트릭스 산출 (지배/보조·Pure·Hybrid·Intensity 반영)
  const matrix = getProfileMatrix(traitScores, dTotal);
  const archetype = matrix.legacyArchetypeKey; // contentLibrary·switch 매칭용
  const archetypeDisplay = `${matrix.archetypeLabelKo} (${matrix.archetypeLabelEn})`;

  // 2. 시너지 보너스 및 텍스트 템플릿
  let multiplier = 1.0;
  let synergyLabel: string | null = null;
  let synergyGoodText: string | null = null;
  let synergyBadText: string | null = null;

  if (high(m) && high(s)) {
    multiplier = 1.2;
    synergyLabel = 'Strategic Predator Synergy (Machiavellianism + Sadism)';
    synergyGoodText = '상대방의 심리를 완벽히 장악하여 조직을 리드합니다.';
    synergyBadText = '당신은 타인의 고통을 설계하고, 그들이 파멸해가는 과정을 즐기며 조종합니다.';
  } else if (high(m) && high(p)) {
    multiplier = 1.2;
    synergyLabel = 'Cold Predator Synergy (Machiavellianism + Psychopathy)';
  } else if (high(m) && high(n)) {
    multiplier = 1.2;
    synergyLabel = 'Puppet Master Synergy (Machiavellianism + Narcissism)';
  } else if (high(p) && high(s)) {
    multiplier = 1.2;
    synergyLabel = 'Volatile Outlaw Synergy (Psychopathy + Sadism)';
  }

  const totalDScore = Math.min(100, Math.round(dTotal * multiplier));

  const ordered: { key: DarkTrait; value: number }[] = [
    { key: 'machiavellianism' as DarkTrait, value: m },
    { key: 'narcissism' as DarkTrait, value: n },
    { key: 'psychopathy' as DarkTrait, value: p },
    { key: 'sadism' as DarkTrait, value: s },
  ].sort((a, b) => b.value - a.value);
  const top1 = ordered[0]!;
  const top2 = ordered[1]!;

  // 3. 일관성 / 방어적 응답 플래그 (간이 버전)
  const spread = Math.max(m, n, p, s) - Math.min(m, n, p, s);
  const defensive =
    spread < 15 && totalDScore >= 60
      ? '응답 패턴이 평탄하게 보정되어 있습니다. 이는 실제 성향을 숨기기 위한 **Defensive / Manipulative 프로파일링** 신호일 수 있습니다.'
      : '';

  // 4. Good Version (Elite Perspective) - 개인화된 텍스트
  let goodReport = '';

  goodReport += `아키타입: **${archetypeDisplay}**\n\n`;

  // 시너지 텍스트가 있으면 우선 적용
  if (synergyGoodText) {
    goodReport += `${synergyGoodText}\n\n`;
  }

  // 개별 trait별 Good 텍스트 (high일 때)
  const traitGoodTexts: string[] = [];
  if (high(m)) {
    traitGoodTexts.push('전략적 직관과 고도의 정치적 감각이 돋보입니다.');
  }
  if (high(n)) {
    traitGoodTexts.push('무대 중앙에서 서사를 주도하는 카리스마와 비전을 보유하고 있습니다.');
  }
  if (high(p)) {
    traitGoodTexts.push('극한 압박 상황에서도 감정적 동요 없이 목표를 달성하는 실행력을 보여줍니다.');
  }
  if (high(s)) {
    traitGoodTexts.push('경쟁 구도에서 주도권을 포기하지 않는 공격적이지만 전략적인 경쟁력을 발휘합니다.');
  }

  if (traitGoodTexts.length > 0) {
    goodReport += traitGoodTexts.join(' ') + '\n\n';
  }

  // 전체 프로파일 요약
  if (totalDScore >= 80) {
    goodReport +=
      '이 프로파일은 고위험 감수 성향과 정교한 조종 능력이 결합된, 전형적인 하이-레벨 전략 인물의 패턴입니다. 당신은 단순히 판에 참여하는 플레이어가 아니라, 판의 구조와 규칙을 재설계하려는 쪽에 가깝습니다.\n\n';
  } else if (totalDScore >= 60) {
    goodReport +=
      '당신의 Dark Nature는 고위험·고수익 환경에서 활용 가능한 고급 전략 리소스로 작동합니다. 감정 소음을 최소화하고, 필요한 국면에만 선택적으로 개입하는 **전략적 오퍼레이터**에 가깝습니다.\n\n';
  } else {
    goodReport +=
      '당신은 대부분의 상황에서 안정성과 협력을 우선하지만, 특정 임계점이 넘어가면 감정보다 계산을 우선하는 모드를 가동할 수 있는, 통제된 리스크 관리형 프로파일입니다.\n\n';
  }

  if (synergyLabel && !synergyGoodText) {
    goodReport += `시너지 신호: ${synergyLabel}가 감지되었습니다. 상위 두 특성이 동시에 활성화될 때, 당신의 의사결정은 타인의 기준이 아닌 **자체 알고리즘**에 의해 구동됩니다.\n\n`;
  }

  // 5. Bad Version (Unfiltered Darkness) - 개인화된 텍스트
  let badTeaser = '';
  let fullBadReport = '';

  badTeaser += `당신의 조합은 **${archetypeDisplay}** 아키타입으로, 보통 사람들의 심리적 안전선 바깥에서 움직이는 패턴을 보여줍니다. `;
  badTeaser += `특히 상위 두 특성(${top1.key}, ${top2.key}) 사이의 시너지는, 갈등 상황에서 당신이 어떤 얼굴을 선택할지 예측하기 어렵게 만듭니다.\n\n`;

  fullBadReport += badTeaser;

  // 시너지 Bad 텍스트가 있으면 우선 적용
  if (synergyBadText) {
    fullBadReport += `${synergyBadText}\n\n`;
  }

  // 개별 trait별 Bad 텍스트 (high일 때)
  const traitBadTexts: string[] = [];
  if (high(m)) {
    traitBadTexts.push('당신에게 타인은 감정을 가진 존재가 아닌, 목적 달성을 위한 장기말일 뿐입니다.');
  }
  if (high(n)) {
    traitBadTexts.push('타인은 당신의 서사를 비추는 거울 조각일 뿐이며, 독립된 존재로 인정하지 않습니다.');
  }
  if (high(p)) {
    traitBadTexts.push('타인의 고통이나 결과를 거의 고려하지 않고, 즉각적인 만족을 추구하는 경향이 강합니다.');
  }
  if (high(s)) {
    traitBadTexts.push('상대의 약점이나 불편함에서 쾌감을 느끼며, 갈등 상황을 필요 이상으로 끌고 갑니다.');
  }

  if (traitBadTexts.length > 0) {
    fullBadReport += traitBadTexts.join(' ') + '\n\n';
  }

  // 아키타입별 파이널 시나리오
  switch (archetype) {
    case 'The Puppet Master':
      fullBadReport +=
        '당신은 사람을 기능 단위로 쪼개서 배치하는 데 익숙합니다. 겉으로는 코칭과 리더십의 언어를 사용하지만, 내적으로는 “누가 언제 어느 위치에서 소모되어야 하는가”를 계산합니다. 이 패턴이 지속되면, 언젠가 팀 전체가 당신을 중심으로 뭉치는 것이 아니라, **당신을 피해 서로 연합하는 구조**를 만들게 됩니다.\n\n';
      fullBadReport +=
        '최종 붕괴 시나리오에서 당신은 공식 직함은 유지하고 있을지 몰라도, 실제 정보와 신뢰는 이미 다른 축으로 이동해 있습니다. 그때가 되면 아무도 대놓고 공격하지 않지만, 아무도 진심으로 당신 곁에 남아 있지 않습니다.\n\n';
      break;
    case 'The Silent Predator':
      fullBadReport +=
        '당신은 직접적인 파괴자가 아니라, **붕괴 과정을 관찰하는 연출자**에 가깝습니다. 누군가가 무너지는 과정을 침묵 속에서 지켜보며, 필요하다면 아주 미세한 자극만 추가합니다. 당신의 흔적은 거의 남지 않지만, 그 자리에 있었던 사람들은 “그때 뭔가 이상했다”는 감각만 오래 가져가게 됩니다.\n\n';
      fullBadReport +=
        '최종 붕괴 시나리오에서 당신은 공식적으로는 아무 책임도 지지 않습니다. 하지만, 가장 가까운 사람조차 이유를 설명하지 못한 채 **당신을 피하는 선택**을 하게 됩니다. 사람들은 당신이 한 말보다, 당신이 침묵했던 순간들을 더 오래 기억하게 됩니다.\n\n';
      break;
    case 'The Mirror Egoist':
      fullBadReport +=
        '당신은 타인을 독립된 존재로 보기보다, 자신의 서사를 비추는 **거울 조각**으로 다루는 경향이 강합니다. 누군가가 당신과 다른 방식으로 빛나기 시작하면, 그 사람의 자존감을 깎아내려 균형을 맞추려 합니다. 칭찬과 비난 모두 결국 “내가 중심에 서 있는가”를 확인하기 위한 도구가 됩니다.\n\n';
      fullBadReport +=
        '최종 붕괴 시나리오에서 당신은 “나는 늘 베풀었는데, 사람들은 결국 배신했다”고 말하게 될 가능성이 큽니다. 그러나 타인의 입장에서는, 조용히 자신감을 잃어가던 시간이 훨씬 더 길게 기억될 것입니다.\n\n';
      break;
    case 'The Volatile Outlaw':
      fullBadReport +=
        '당신은 감정과 충동, 쾌감과 파괴가 서로 분리되지 않은 상태로 작동하는 경향이 강합니다. 한순간의 분노, 모멸감, 스릴을 위해 **돌이킬 수 없는 선택**을 할 위험이 항상 열려 있습니다. 규칙은 지키기 위한 것이 아니라, 넘나들면서 테스트해 보는 대상에 가깝습니다.\n\n';
      fullBadReport +=
        '최종 붕괴 시나리오에서 당신은 “그땐 어쩔 수 없었다”는 문장을 반복하지만, 기록과 증거는 다른 이야기를 말하게 됩니다. 관계, 커리어, 평판 중 최소 하나는 급격하게 무너지고, 그 과정에서 법적 리스크가 현실화될 가능성이 높습니다.\n\n';
      break;
    default:
      fullBadReport +=
        '당신의 Dark Nature는 단일한 악역 캐릭터로 정리되기보다는, 상황에 따라 다른 얼굴을 꺼내 쓰는 **멀티 아키타입 구조**에 가깝습니다. 이는 통제된 상태에서는 유연성으로 작동하지만, 스트레스가 누적되면 어떤 얼굴이 튀어나올지 스스로도 예측하기 어려워질 수 있습니다.\n\n';
      break;
  }

  if (defensive) {
    fullBadReport += `${defensive}\n\n`;
  }

  fullBadReport +=
    '이 섹션은 사용자가 직접 요청하고 결제했을 때에만 열람되는 영역입니다. 이 문장을 읽고 있다면, 이미 당신은 자신의 어두운 알고리즘을 직시할 준비가 되어 있다는 뜻입니다.';

  return {
    totalDScore,
    archetype: archetypeDisplay, // 매트릭스 세분화 유형 표기 (UI·공유용)
    goodReport,
    badTeaser,
    fullBadReport,
  };
}

// ----------------- Modular Report Assembly Engine -----------------

/**
 * 모듈러 리포트 어셈블리 엔진
 * - contentLibrary의 스니펫을 조합하여 리포트 생성
 * - isPaid에 따라 Bad 콘텐츠 제어
 */
export function assembleReport(
  raw: DarkNatureResult,
  isPaid: boolean = false,
): AssembledReport {
  const { traitScores: rawScores, subFactorScores: rawSubs, dTotal, consistencySpread: rawSpread, validationScore: rawValidation, insincereResponsePattern: rawInsincere } = raw;

  const m = Number(rawScores?.machiavellianism) ?? 0;
  const n = Number(rawScores?.narcissism) ?? 0;
  const p = Number(rawScores?.psychopathy) ?? 0;
  const s = Number(rawScores?.sadism) ?? 0;

  const spread = rawSpread ?? (Math.max(m, n, p, s) - Math.min(m, n, p, s));
  const validationScore = rawValidation ?? undefined;

  const { highCutoff, midCutoff, archetypeHighCutoff, subFactorHighCutoff, dTotalCritical, dTotalHigh } = NORM_CONFIG;
  const high = (v: number) => v >= highCutoff;
  const mid = (v: number) => v >= midCutoff && v < highCutoff;
  const low = (v: number) => v < midCutoff;

  // 1. 아키타입: result.archetype이 있으면 재계산 없이 표시 정보만 조회 (채점 시 1회만 determineArchetype)
  const traitScoresForMatrix = { machiavellianism: m, narcissism: n, psychopathy: p, sadism: s };
  const archetypeId = raw.archetype as MnpsArchetypeId | undefined;
  const displayFromId =
    archetypeId != null ? getDisplayFromArchetypeId(archetypeId) : null;
  let archetype: string;
  let archetypeDisplay: string;
  if (displayFromId) {
    archetype = displayFromId.legacyArchetypeKey;
    archetypeDisplay = `${displayFromId.archetypeLabelKo} (${displayFromId.archetypeLabelEn})`;
  } else {
    const matrix = getProfileMatrix(traitScoresForMatrix, dTotal);
    archetype = matrix.legacyArchetypeKey;
    archetypeDisplay = `${matrix.archetypeLabelKo} (${matrix.archetypeLabelEn})`;
  }

  // 2. 시너지 보너스 계산
  let multiplier = 1.0;
  if ((high(m) && high(p)) || (high(m) && high(n)) || (high(p) && high(s)) || (high(m) && high(s))) {
    multiplier = 1.2;
  }
  const totalDScore = Math.min(100, Math.round(dTotal * multiplier));

  // 3. Good Report 어셈블리
  let goodReport = '';

  // 매트릭스 아키타입 표기명 (세분화 유형)
  goodReport += `아키타입: **${archetypeDisplay}**\n\n`;

  // 아키타입 콘텐츠 (ARCHETYPE_CONTENT 우선, 없으면 레거시 contentLibrary)
  const archetypeContent = archetypeId ? ARCHETYPE_CONTENT[archetypeId] : null;
  const archetypeIntro = archetypeIntros[archetype];
  
  if (archetypeContent) {
    // 새로운 ARCHETYPE_CONTENT 사용
    goodReport += `### ${archetypeContent.goodReport.title}\n\n`;
    goodReport += archetypeContent.goodReport.content + '\n\n';
  } else if (archetypeIntro) {
    // 레거시 contentLibrary 사용 (fallback)
    goodReport += archetypeIntro.good + '\n\n';
  }

  // Trait 스니펫 선택
  const getTraitLevel = (v: number): TraitLevel => {
    if (high(v)) return 'high';
    if (mid(v)) return 'mid';
    return 'low';
  };

  const traitMap: Record<DarkTrait, TraitKey> = {
    machiavellianism: 'mach',
    narcissism: 'narc',
    psychopathy: 'psych',
    sadism: 'sadism',
  };

  // SubFactor 점수 (스니펫·해석 세분화용)
  const subs = rawSubs ?? {};
  const moralHigh = Number(subs.moralDisengagement) >= subFactorHighCutoff;
  const spiteHigh = Number(subs.spitefulness) >= subFactorHighCutoff;

  // 시너지 키 (스니펫 다양화·시너지 문단에 공통 사용) — 6가지: Nar+Mac, Nar+Psy, Nar+Sad, Mac+Psy, Mac+Sad, Psy+Sad
  const synergyKeys = [
    high(m) && high(s) ? 'mach_high_sadism_high' : null,
    high(m) && high(p) ? 'mach_high_psych_high' : null,
    high(m) && high(n) ? 'mach_high_narc_high' : null,
    high(p) && high(s) ? 'psych_high_sadism_high' : null,
    high(n) && high(p) ? 'narc_high_psych_high' : null,
    high(n) && high(s) ? 'narc_high_sadism_high' : null,
  ].filter((k): k is string => k !== null);
  const synergySeed = synergyKeys.length > 0
    ? synergyKeys[0].split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    : 0;

  // Trait별 시드 (mach/narc/psych/sadism 순서로 0,3,6,9 → 프로필별·trait별 스니펫 분산)
  const traitSeedOffset: Record<TraitKey, number> = { mach: 0, narc: 3, psych: 6, sadism: 9 };

  // Trait 스니펫 선택 (다중 후보: sum + subFactor + trait + 시너지 시드로 인덱스 결정 → 문장 중복·단조로움 감소)
  const getTraitSnippet = (trait: TraitKey, level: TraitLevel, type: 'good' | 'bad', indexMod: number = 0): string => {
    const traitData = contentTraitScores[trait];
    if (!traitData) return '';
    const snippets = traitData[level];
    if (!snippets) return '';
    if (Array.isArray(snippets)) {
      if (snippets.length === 0) return '';
      const base = Math.floor((m + n + p + s) / 100) || 0;
      const seed = traitSeedOffset[trait] + synergySeed + indexMod;
      const idx = (base + seed + 100) % snippets.length;
      const chosen = snippets[idx];
      return chosen && typeof chosen[type] === 'string' ? chosen[type] : (snippets[0]?.[type] ?? '');
    }
    const single = snippets as unknown as TraitSnippet;
    return (single && single[type]) ?? '';
  };

  const goodTraitSnippets: string[] = [];
  goodTraitSnippets.push(getTraitSnippet('mach', getTraitLevel(m), 'good', moralHigh ? 1 : 0));
  goodTraitSnippets.push(getTraitSnippet('narc', getTraitLevel(n), 'good', spiteHigh ? 1 : 0));
  goodTraitSnippets.push(getTraitSnippet('psych', getTraitLevel(p), 'good', moralHigh ? 1 : 0));
  goodTraitSnippets.push(getTraitSnippet('sadism', getTraitLevel(s), 'good', spiteHigh ? 1 : 0));

  goodReport += goodTraitSnippets.join('\n\n') + '\n\n';

  // Good 리포트에 SubFactor 강조 (도덕적 이탈·악의성 높을 때 긍정 해석 문장)
  if (moralHigh) {
    goodReport +=
      '도덕적 이탈 수준이 높게 나타나, **결과와 목표를 중시하는 전략적 판단**이 뚜렷합니다. 과정의 유연함을 활용할 때 리스크 관리에 강점을 보일 수 있습니다.\n\n';
  }
  if (spiteHigh) {
    goodReport +=
      '악의성(스파이트) 수준이 눈에 띄어, **경계와 자기방어**가 분명한 편입니다. 상대의 부당함에 대한 반응이 예리하므로, 관계에서 명확한 선을 그을 수 있습니다.\n\n';
  }

  // 시너지 Good 텍스트
  for (const key of synergyKeys) {
    const synergies = synergyCombinations[key];
    if (synergies && Array.isArray(synergies) && synergies.length > 0) {
      // 첫 번째 시너지의 good 텍스트 사용
      goodReport += synergies[0].good + '\n\n';
      break; // 첫 번째 시너지만
    }
  }

  // 전체 프로파일 요약
  if (totalDScore >= 80) {
    goodReport +=
      '이 프로파일은 고위험 감수 성향과 정교한 조종 능력이 결합된, 전형적인 하이-레벨 전략 인물의 패턴입니다. 당신은 단순히 판에 참여하는 플레이어가 아니라, 판의 구조와 규칙을 재설계하려는 쪽에 가깝습니다.';
  } else if (totalDScore >= 60) {
    goodReport +=
      '당신의 Dark Nature는 고위험·고수익 환경에서 활용 가능한 고급 전략 리소스로 작동합니다. 감정 소음을 최소화하고, 필요한 국면에만 선택적으로 개입하는 **전략적 오퍼레이터**에 가깝습니다.';
  } else {
    goodReport +=
      '당신은 대부분의 상황에서 안정성과 협력을 우선하지만, 특정 임계점이 넘어가면 감정보다 계산을 우선하는 모드를 가동할 수 있는, 통제된 리스크 관리형 프로파일입니다.';
  }

  if (rawInsincere) {
    goodReport += '\n\n※ **불성실 응답 의심**: 동일/지그재그 패턴이 감지되었습니다. 결과는 참고용으로만 활용하시기 바랍니다.';
  }

  // 4. Bad Teaser (항상 표시)
  let badTeaser = '';

  if (archetypeContent) {
    // 새로운 ARCHETYPE_CONTENT의 badReport 일부를 티저로 (첫 200자)
    const badContent = archetypeContent.badReport.content;
    const firstParagraph = badContent.split('\n\n')[0] || badContent.substring(0, 200);
    badTeaser = firstParagraph;
  } else if (synergyKeys.length > 0) {
    // 레거시: 첫 번째 시너지 Bad 텍스트만 티저로
    const synergies = synergyCombinations[synergyKeys[0]];
    if (synergies && Array.isArray(synergies) && synergies.length > 0) {
      badTeaser += synergies[0].bad;
    }
  } else {
    // 시너지가 없으면 아키타입 Bad 소개만
    if (archetypeIntro) {
      badTeaser += archetypeIntro.bad;
    }
  }

  // 5. Full Bad Report (isPaid === true일 때만 생성)
  let fullBadReport: string | undefined = undefined;

  if (isPaid) {
    fullBadReport = '';

    // 아키타입 Bad 콘텐츠 (ARCHETYPE_CONTENT 우선)
    if (archetypeContent) {
      fullBadReport += `### ${archetypeContent.badReport.title}\n\n`;
      fullBadReport += archetypeContent.badReport.content + '\n\n';
    } else if (archetypeIntro) {
      // 레거시 contentLibrary 사용 (fallback)
      fullBadReport += archetypeIntro.bad + '\n\n';
    }

    // 모든 Trait Bad 스니펫 (content library)
    const badTraitSnippets: string[] = [];
    const lib = contentTraitScores;
    const pushBad = (trait: TraitKey, level: TraitLevel) => {
      const sn = lib[trait]?.[level];
      if (Array.isArray(sn)) sn.forEach((s) => badTraitSnippets.push(s.bad));
      else if (sn && typeof (sn as TraitSnippet).bad === 'string') badTraitSnippets.push((sn as TraitSnippet).bad);
    };
    pushBad('mach', getTraitLevel(m));
    pushBad('narc', getTraitLevel(n));
    pushBad('psych', getTraitLevel(p));
    pushBad('sadism', getTraitLevel(s));

    fullBadReport += badTraitSnippets.join('\n\n') + '\n\n';

    // SubFactor 강조 (도덕적 이탈·악의성 높을 때 해석 정확도 보강)
    if (moralHigh) {
      fullBadReport +=
        '**도덕적 이탈** 수준이 높습니다. 결과가 좋다면 과정의 희생이나 기만을 정당화하는 경향이 있어, 장기적으로 신뢰 붕괴와 법적 리스크로 이어질 수 있습니다.\n\n';
    }
    if (spiteHigh) {
      fullBadReport +=
        '**악의성** 수준이 눈에 띕니다. 타인의 불행이나 손해에서 쾌감을 느끼는 경향이 강화되면, 관계 파괴와 사회적 고립으로 이어질 수 있습니다.\n\n';
    }

    // D-Factor 해석 (4대 하위 요인별 High/Low → Bad 관점 2문장)
    const dFactorMap: { key: DFactorKey; score: number }[] = [
      { key: 'Egoism', score: Number(rawSubs?.egoism) ?? 0 },
      { key: 'Entitlement', score: Number(rawSubs?.entitlement) ?? 0 },
      { key: 'MoralDisengagement', score: Number(rawSubs?.moralDisengagement) ?? 0 },
      { key: 'Spitefulness', score: Number(rawSubs?.spitefulness) ?? 0 },
    ];
    fullBadReport += '## D-Factor 해석\n\n';
    for (const { key, score } of dFactorMap) {
      const level = score >= highCutoff ? 'High' : 'Low';
      const text = dFactorInterpretations[key]?.[level]?.Bad;
      if (text) fullBadReport += `**${key}** (${level}): ${text}\n\n`;
    }

    // 방어적·일관성·불성실 패턴 검사 (구간별: 심각/중등/경미)
    let defensive = '';
    if (rawInsincere) {
      defensive =
        '**[불성실 응답 의심]** 동일 응답의 반복(기둥 세우기) 또는 극단값 지그재그(1-5-1-5) 패턴이 감지되었습니다. 분석 결과의 신뢰도가 낮을 수 있으니 참고용으로만 활용하시기 바랍니다.';
    } else if (validationScore !== undefined && validationScore < 50 && spread < 25) {
      defensive =
        '**[심각]** 검증 문항에서 정직·일관성이 낮게 나왔습니다. 분석 결과의 신뢰도가 제한적일 수 있으니, 참고용으로만 활용하시기 바랍니다.';
    } else if (spread < 15 && totalDScore >= 60) {
      defensive =
        '**[중등]** 응답 패턴이 평탄하게 보정되어 있습니다. 이는 실제 성향을 숨기기 위한 Defensive/Manipulative 프로파일링 신호일 수 있습니다.';
    } else if (validationScore !== undefined && validationScore >= highCutoff && spread < 20) {
      defensive =
        '**[경미]** 검증 문항에서 "정직·일관성"을 강하게 주장했으나, 4개 특성 점수는 다소 평탄합니다. 실제 성향을 완화해 답했을 가능성을 참고하세요.';
    }
    if (defensive) {
      fullBadReport += `## 응답 신뢰도 참고\n\n${defensive}\n\n`;
    }

    // 모든 시너지 Bad 텍스트 (각 시너지의 모든 스니펫 포함)
    for (const key of synergyKeys) {
      const synergies = synergyCombinations[key];
      if (synergies && Array.isArray(synergies)) {
        synergies.forEach((synergy) => {
          fullBadReport += synergy.bad + '\n\n';
        });
      }
    }

    // 최종 경고 (Final Ruin Scenario)
    const intensity: 'critical' | 'high' | 'moderate' =
      totalDScore >= dTotalCritical ? 'critical' : totalDScore >= dTotalHigh ? 'high' : 'moderate';
    
    fullBadReport += '## Final Ruin Scenario\n\n';
    
    // Final Warnings (모든 경고 포함)
    const warnings = finalWarnings[intensity];
    warnings.forEach((w) => {
      fullBadReport += w + '\n\n';
    });

    // Critical 시 테마별 Final Ruin 시나리오 1종 + 실용적 조언
    const ruinThemes: Array<keyof typeof finalRuinScenarios> = ['corporatePurge', 'gaslightBackfire', 'dopamineBurnout'];
    if (intensity === 'critical') {
      const themeIdx = (Math.floor(m + n + p + s) + synergySeed) % ruinThemes.length;
      const theme = ruinThemes[themeIdx];
      const ruin = finalRuinScenarios[theme];
      if (ruin?.scenario) fullBadReport += ruin.scenario + '\n\n';
      if (ruin?.actionableTip) fullBadReport += ruin.actionableTip + '\n\n';
    }

    // 아키타입별 심층 분석 블록 추가
    const deepDives = archetypeDeepDives[archetype];
    if (deepDives && Array.isArray(deepDives)) {
      deepDives.forEach((dive) => {
        fullBadReport += dive;
      });
    } else {
      // 기본 아키타입별 최종 붕괴 시나리오
      switch (archetype) {
        case 'The Puppet Master':
          fullBadReport +=
            '최종 붕괴 시나리오에서 당신은 공식 직함은 유지하고 있을지 몰라도, 실제 정보와 신뢰는 이미 다른 축으로 이동해 있습니다. 그때가 되면 아무도 대놓고 공격하지 않지만, 아무도 진심으로 당신 곁에 남아 있지 않습니다. 당신을 중심으로 뭉치는 것이 아니라, **당신을 피해 서로 연합하는 구조**를 만들게 됩니다.\n\n';
          break;
        case 'The Silent Predator':
          fullBadReport +=
            '최종 붕괴 시나리오에서 당신은 공식적으로는 아무 책임도 지지 않습니다. 하지만, 가장 가까운 사람조차 이유를 설명하지 못한 채 **당신을 피하는 선택**을 하게 됩니다. 사람들은 당신이 한 말보다, 당신이 침묵했던 순간들을 더 오래 기억하게 됩니다.\n\n';
          break;
        case 'The Mirror Egoist':
          fullBadReport +=
            '최종 붕괴 시나리오에서 당신은 "나는 늘 베풀었는데, 사람들은 결국 배신했다"고 말하게 될 가능성이 큽니다. 그러나 타인의 입장에서는, 조용히 자신감을 잃어가던 시간이 훨씬 더 길게 기억될 것입니다.\n\n';
          break;
        case 'The Volatile Outlaw':
          fullBadReport +=
            '최종 붕괴 시나리오에서 당신은 "그땐 어쩔 수 없었다"는 문장을 반복하지만, 기록과 증거는 다른 이야기를 말하게 됩니다. 관계, 커리어, 평판 중 최소 하나는 급격하게 무너지고, 그 과정에서 법적 리스크가 현실화될 가능성이 높습니다.\n\n';
          break;
        default:
          fullBadReport +=
            '당신의 Dark Nature는 단일한 악역 캐릭터로 정리되기보다는, 상황에 따라 다른 얼굴을 꺼내 쓰는 **멀티 아키타입 구조**에 가깝습니다. 이는 통제된 상태에서는 유연성으로 작동하지만, 스트레스가 누적되면 어떤 얼굴이 튀어나올지 스스로도 예측하기 어려워질 수 있습니다.\n\n';
          break;
      }
    }

    // 최소 2,000자 이상 보장
    const minLength = 2000;
    let blockIndex = 0;
    while (fullBadReport.length < minLength && blockIndex < extraBadDepthBlocks.length) {
      fullBadReport += extraBadDepthBlocks[blockIndex];
      blockIndex++;
    }

    // 아키타입별 최종 붕괴 시나리오 (기존 로직 재사용)
    switch (archetype) {
      case 'The Puppet Master':
        fullBadReport +=
          '최종 붕괴 시나리오에서 당신은 공식 직함은 유지하고 있을지 몰라도, 실제 정보와 신뢰는 이미 다른 축으로 이동해 있습니다. 그때가 되면 아무도 대놓고 공격하지 않지만, 아무도 진심으로 당신 곁에 남아 있지 않습니다.\n\n';
        break;
      case 'The Silent Predator':
        fullBadReport +=
          '최종 붕괴 시나리오에서 당신은 공식적으로는 아무 책임도 지지 않습니다. 하지만, 가장 가까운 사람조차 이유를 설명하지 못한 채 **당신을 피하는 선택**을 하게 됩니다. 사람들은 당신이 한 말보다, 당신이 침묵했던 순간들을 더 오래 기억하게 됩니다.\n\n';
        break;
      case 'The Mirror Egoist':
        fullBadReport +=
          '최종 붕괴 시나리오에서 당신은 "나는 늘 베풀었는데, 사람들은 결국 배신했다"고 말하게 될 가능성이 큽니다. 그러나 타인의 입장에서는, 조용히 자신감을 잃어가던 시간이 훨씬 더 길게 기억될 것입니다.\n\n';
        break;
      case 'The Volatile Outlaw':
        fullBadReport +=
          '최종 붕괴 시나리오에서 당신은 "그땐 어쩔 수 없었다"는 문장을 반복하지만, 기록과 증거는 다른 이야기를 말하게 됩니다. 관계, 커리어, 평판 중 최소 하나는 급격하게 무너지고, 그 과정에서 법적 리스크가 현실화될 가능성이 높습니다.\n\n';
        break;
    }

    // 아키타입별 전략적 조언 추가
    if (archetypeContent) {
      fullBadReport += '\n\n## 전략적 조언\n\n';
      fullBadReport += archetypeContent.advice + '\n\n';
    }

    fullBadReport +=
      '※ 이 리포트는 법적·임상적 진단이 아니라, Dark Nature 경향성을 기반으로 한 심리적 시뮬레이션입니다.';
  }

  // archetypeId가 있으면 ARCHETYPE_CONTENT에서 headline·highlights 가져오기 (강도별 오버라이드 적용)
  let headline: string | undefined;
  let highlights: string[] | undefined;
  
  if (archetypeId) {
    const content = ARCHETYPE_CONTENT[archetypeId];
    if (content) {
      const intensity = getIntensity(totalDScore);
      const headlineOverride = content.intensityOverrides?.[intensity]?.headline;
      headline = headlineOverride ?? content.headline;
      highlights = content.highlights;
    }
  }

  return {
    totalDScore,
    archetype: archetypeDisplay, // 매트릭스 세분화 유형 표기 (UI·공유용)
    headline,
    highlights,
    goodReport,
    badTeaser,
    fullBadReport,
  };
}
