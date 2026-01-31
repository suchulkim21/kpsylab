import {
  MNPS_QUESTIONS,
  VALIDATION_QUESTION_IDS,
  type Question,
} from '@/app/mnps/test/questions';

// ==========================================
// 1. 설정 및 상수 (Config)
// ==========================================

export const NORM_CONFIG = {
  // 질문 강화로 인해 점수 하향 조정 (75 -> 70)
  highCutoff: 70,
  midCutoff: 40,
  archetypeHighCutoff: 70, // Pure Type 판별 기준 등
  subFactorHighCutoff: 70,
  dTotalCritical: 85,
  dTotalHigh: 70,
};

export const D_SCORE_CONFIG = {
  traitWeights: {
    machiavellianism: 1.0,
    narcissism: 0.9,
    psychopathy: 1.1,
    sadism: 1.0,
  },
  subFactorWeights: {
    egoism: 0.9,
    moralDisengagement: 1.0,
    entitlement: 1.0,
    spitefulness: 1.1,
  },
  // Inter-correlation 보너스 (최대 20점)
  interCorrelationCoeff: 0.2,
  interCorrelationMax: 20,
};

// ==========================================
// 2. 타입 정의 (Types)
// ==========================================

// 16종 + 특수 유형 아키타입 ID
export type MnpsArchetypeId =
  // Machiavellianism Dominant
  | 'MACH_PURE'
  | 'MACH_NARC'
  | 'MACH_PSYCH'
  | 'MACH_SAD'
  // Narcissism Dominant
  | 'NARC_PURE'
  | 'NARC_MACH'
  | 'NARC_PSYCH'
  | 'NARC_SAD'
  // Psychopathy Dominant
  | 'PSYCH_PURE'
  | 'PSYCH_MACH'
  | 'PSYCH_NARC'
  | 'PSYCH_SAD'
  // Sadism Dominant
  | 'SAD_PURE'
  | 'SAD_MACH'
  | 'SAD_NARC'
  | 'SAD_PSYCH'
  // Special
  | 'DARK_APEX'
  | 'ALL_LOW'
  | 'HYBRID_MID';

export interface DarkNatureResult {
  traitScores: {
    machiavellianism: number;
    narcissism: number;
    psychopathy: number;
    sadism: number;
  };
  subFactorScores: Record<string, number>;
  dTotal: number; // 표출용 (0~100)
  rawDTotal: number; // 내부용 (Uncapped)
  isExtremeTop: boolean; // 상위 1% 태그용
  archetype: MnpsArchetypeId; // 세분화된 아키타입

  analysisAccuracy: number;
  validationScore: number;
  consistencySpread: number;
  responseTimePenalty: boolean;
}

export interface ScoreOptions {
  validationScores?: number; // 외부에서 계산된 검증 점수 (0~100, 있다면)
  responseTimeMs?: number; // 총 응답 시간 (ms)
  questionCount?: number; // 문항 수 (보통 42)
}

// ==========================================
// 3. 헬퍼 함수 (Helpers)
// ==========================================

/**
 * Raw D-Total을 표출용(0~100)으로 매핑 (Sigmoid-like Soft Truncation)
 */
export function mapRawDTotalToDisplay(raw: number): number {
  if (raw <= 90) return Math.max(0, raw);
  // 90점 초과 시 압축 (tanh 사용)
  const excess = raw - 90;
  const compressed = 10 * Math.tanh(excess / 15);
  return Math.min(99.9, 90 + compressed);
}

/**
 * 점수 분포를 분석하여 16+종의 아키타입 중 하나를 결정하는 정밀 판별 함수
 */
function determineArchetype(scores: {
  machiavellianism: number;
  narcissism: number;
  psychopathy: number;
  sadism: number;
}): MnpsArchetypeId {
  const values = Object.values(scores);
  const maxScore = Math.max(...values);

  // (A) Dark Apex: 모든 수치가 매우 높음 (모두 70점 이상)
  if (values.every((s) => s >= 70)) return 'DARK_APEX';

  // (B) Clear Mirror: 모든 수치가 낮음 (최대 점수가 50점 미만)
  if (maxScore < 50) return 'ALL_LOW';

  // 3. 점수 정렬 (내림차순) -> [['traitName', score], ...]
  const sortedTraits = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  const [primary, secondary] = sortedTraits;
  const pTrait = primary[0];
  const pScore = primary[1];
  const sTrait = secondary[0];
  const sScore = secondary[1];

  const prefixMap: Record<string, string> = {
    machiavellianism: 'MACH',
    narcissism: 'NARC',
    psychopathy: 'PSYCH',
    sadism: 'SAD',
  };

  // (C) Pure Type 판정: 1등과 2등 차이가 15점 이상 (압도적 지배)
  // 단, 1등 점수가 너무 낮으면(60 미만) Pure로 보지 않고 Hybrid Mid로 처리
  if (pScore >= 60 && pScore - sScore >= 15) {
    return `${prefixMap[pTrait]}_PURE` as MnpsArchetypeId;
  }

  // (D) Hybrid Type 결정
  if (pScore < 60) return 'HYBRID_MID';

  // 일반 Hybrid 조합 (예: MACH_NARC)
  return `${prefixMap[pTrait]}_${prefixMap[sTrait]}` as MnpsArchetypeId;
}

// ==========================================
// 4. 메인 채점 함수 (Main Function)
// ==========================================

export function scoreDarkNature(
  answers: Record<string, number>,
  options: ScoreOptions = {}
): DarkNatureResult {
  // --- 1. Trait & SubFactor 점수 계산 ---
  const traitSums: Record<string, { sum: number; count: number }> = {
    machiavellianism: { sum: 0, count: 0 },
    narcissism: { sum: 0, count: 0 },
    psychopathy: { sum: 0, count: 0 },
    sadism: { sum: 0, count: 0 },
  };

  const subFactorSums: Record<string, { sum: number; count: number }> = {
    egoism: { sum: 0, count: 0 },
    moralDisengagement: { sum: 0, count: 0 },
    entitlement: { sum: 0, count: 0 },
    spitefulness: { sum: 0, count: 0 },
  };

  MNPS_QUESTIONS.forEach((q: Question) => {
    if (q.category === 'validation') return;

    let score = answers[q.id] ?? 0;
    if (score === 0) return;

    if (q.isReverse) score = 6 - score;

    // 선형 변환 (1~5 -> 0~100): (score - 1) * 25
    const normalizedScore = (score - 1) * 25;

    if (q.trait && traitSums[q.trait]) {
      traitSums[q.trait].sum += normalizedScore;
      traitSums[q.trait].count += 1;
    }

    if (q.subFactor && subFactorSums[q.subFactor]) {
      subFactorSums[q.subFactor].sum += normalizedScore;
      subFactorSums[q.subFactor].count += 1;
    }
  });

  const traitScores = {
    machiavellianism: traitSums.machiavellianism.count
      ? traitSums.machiavellianism.sum / traitSums.machiavellianism.count
      : 0,
    narcissism: traitSums.narcissism.count
      ? traitSums.narcissism.sum / traitSums.narcissism.count
      : 0,
    psychopathy: traitSums.psychopathy.count
      ? traitSums.psychopathy.sum / traitSums.psychopathy.count
      : 0,
    sadism: traitSums.sadism.count
      ? traitSums.sadism.sum / traitSums.sadism.count
      : 0,
  };

  const subFactorScores: Record<string, number> = {};
  Object.keys(subFactorSums).forEach((k) => {
    subFactorScores[k] = subFactorSums[k].count
      ? subFactorSums[k].sum / subFactorSums[k].count
      : 0;
  });

  // --- 2. D-Total 계산 (가중치 + Inter-correlation) ---
  let weightedSum = 0;
  let maxWeightedSum = 0;

  Object.entries(traitScores).forEach(([key, score]) => {
    const weight =
      D_SCORE_CONFIG.traitWeights[
        key as keyof typeof D_SCORE_CONFIG.traitWeights
      ] ?? 1;
    weightedSum += score * weight;
    maxWeightedSum += 100 * weight;
  });

  Object.entries(subFactorScores).forEach(([key, score]) => {
    const weight =
      D_SCORE_CONFIG.subFactorWeights[
        key as keyof typeof D_SCORE_CONFIG.subFactorWeights
      ] ?? 1;
    weightedSum += score * weight;
    maxWeightedSum += 100 * weight;
  });

  const baseScore =
    maxWeightedSum > 0 ? (weightedSum / maxWeightedSum) * 100 : 0;

  const traitAvg =
    Object.values(traitScores).reduce((a, b) => a + b, 0) / 4;
  const interBonus = Math.min(
    D_SCORE_CONFIG.interCorrelationMax,
    traitAvg * D_SCORE_CONFIG.interCorrelationCoeff
  );

  const rawDTotal = baseScore + interBonus;
  const dTotal = mapRawDTotalToDisplay(rawDTotal);
  const isExtremeTop = rawDTotal > 100;

  // --- 3. 아키타입 결정 ---
  const archetype = determineArchetype(traitScores);

  // --- 4. 분석 정확도 & 검증 ---
  let validationScore = 0;
  if (options.validationScores !== undefined) {
    validationScore = options.validationScores;
  } else {
    const vQuestions = MNPS_QUESTIONS.filter((q) =>
      VALIDATION_QUESTION_IDS.includes(q.id)
    );
    let vSum = 0;
    const vMax = vQuestions.length * 5;
    vQuestions.forEach((q) => {
      let s = answers[q.id] ?? 3;
      if (q.isReverse) s = 6 - s;
      vSum += s;
    });
    validationScore = vMax > 0 ? (vSum / vMax) * 100 : 50;
  }

  const tValues = Object.values(traitScores);
  const consistencySpread =
    tValues.length > 0 ? Math.max(...tValues) - Math.min(...tValues) : 0;

  let accuracyBase = 80;
  if (validationScore >= 80) accuracyBase += 10;
  else if (validationScore < 50) accuracyBase -= 20;
  if (consistencySpread < 15) accuracyBase -= 15;

  let responseTimePenalty = false;
  if (options.responseTimeMs != null && options.questionCount != null) {
    const avgTime = options.responseTimeMs / options.questionCount;
    if (avgTime < 800) {
      accuracyBase -= 30;
      responseTimePenalty = true;
    }
  }

  const analysisAccuracy = Math.min(99, Math.max(50, accuracyBase));

  return {
    traitScores,
    subFactorScores,
    dTotal,
    rawDTotal,
    isExtremeTop,
    archetype,
    analysisAccuracy,
    validationScore,
    consistencySpread,
    responseTimePenalty,
  };
}
