/**
 * MNPS 규준 보정: 분포 분석 결과로부터 NORM_CONFIG 권장값 재산정
 * - get_mnps_norm_distribution() RPC 결과를 입력으로 받아,
 *   현재 highCutoff(75) vs 실제 상위 20%(p80) 비교 후 권장 Config 객체 생성
 */

export type DistributionStats = {
  n: number;
  mean: number | null;
  stddev: number | null;
  p10: number | null;
  p20: number | null;
  p30: number | null;
  p50: number | null;
  p70: number | null;
  p80: number | null;
  p90: number | null;
};

export type MnpsDistributionPayload = {
  raw_d_total: DistributionStats;
  traits: {
    machiavellianism: DistributionStats;
    narcissism: DistributionStats;
    psychopathy: DistributionStats;
    sadism: DistributionStats;
  };
};

/** NORM_CONFIG와 동일한 키 구조 (권장값 출력용) */
export type NormConfigRecommendation = {
  highCutoff: number;
  midCutoff: number;
  archetypeHighCutoff: number;
  subFactorHighCutoff: number;
  dTotalCritical: number;
  dTotalHigh: number;
};

/** 현재 코드의 NORM_CONFIG 타입과 호환 */
export type CurrentNormConfig = NormConfigRecommendation;

const MIN_SAMPLE = 10;

function roundToInt(value: number | null | undefined): number {
  if (value == null || Number.isNaN(value)) return 0;
  return Math.round(Number(value));
}

function clamp0_100(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * 분포 결과와 현재 NORM_CONFIG를 받아 권장 NORM_CONFIG 및 설명 메시지 반환
 */
export function recommendNormConfig(
  distribution: MnpsDistributionPayload | null,
  current: CurrentNormConfig
): {
  recommended: NormConfigRecommendation | null;
  suggestions: string[];
  distributionValid: boolean;
} {
  const suggestions: string[] = [];

  if (!distribution?.raw_d_total) {
    return {
      recommended: null,
      suggestions: ['분포 데이터가 없습니다.'],
      distributionValid: false,
    };
  }

  const raw = distribution.raw_d_total;
  const n = Number(raw.n) ?? 0;
  if (n < MIN_SAMPLE) {
    return {
      recommended: null,
      suggestions: [`샘플 수가 부족합니다 (현재 ${n}건, 최소 ${MIN_SAMPLE}건 권장). 데이터 축적 후 다시 분석하세요.`],
      distributionValid: false,
    };
  }

  const traits = distribution.traits;
  const traitKeys = ['machiavellianism', 'narcissism', 'psychopathy', 'sadism'] as const;
  const traitStats = traitKeys.map((k) => traits?.[k]).filter(Boolean) as DistributionStats[];

  // 상위 20% = p80, 상위 50% 하한 = p50, 중위 = p50
  const p80Raw = raw.p80 != null ? Number(raw.p80) : null;
  const p50Raw = raw.p50 != null ? Number(raw.p50) : null;
  const p30Raw = raw.p30 != null ? Number(raw.p30) : null;
  const p90Raw = raw.p90 != null ? Number(raw.p90) : null;

  // highCutoff: "상위 20% 구간 하한" = p80 (데이터 기준)
  const recommendedHighCutoff = p80Raw != null ? clamp0_100(roundToInt(p80Raw)) : current.highCutoff;
  // midCutoff: "중간 구간 하한" = p50 또는 p30 (중위~하위 경계)
  const recommendedMidCutoff = p50Raw != null ? clamp0_100(roundToInt(p50Raw)) : current.midCutoff;

  // 아키타입/SubFactor "높음" 임계: 4개 trait의 p80 평균
  let traitP80Avg: number | null = null;
  if (traitStats.length === 4 && traitStats.every((t) => t.p80 != null)) {
    const sum = traitStats.reduce((s, t) => s + (Number(t.p80) ?? 0), 0);
    traitP80Avg = sum / 4;
  }
  const recommendedArchetypeHigh = traitP80Avg != null ? clamp0_100(roundToInt(traitP80Avg)) : current.archetypeHighCutoff;
  const recommendedSubFactorHigh = recommendedArchetypeHigh;

  // D-Total 강도: critical = 상위 10% 근처(p90), high = 상위 20%(p80)
  const recommendedDTotalCritical = p90Raw != null ? clamp0_100(roundToInt(p90Raw)) : current.dTotalCritical;
  const recommendedDTotalHigh = p80Raw != null ? clamp0_100(roundToInt(p80Raw)) : current.dTotalHigh;

  const recommended: NormConfigRecommendation = {
    highCutoff: recommendedHighCutoff,
    midCutoff: recommendedMidCutoff,
    archetypeHighCutoff: recommendedArchetypeHigh,
    subFactorHighCutoff: recommendedSubFactorHigh,
    dTotalCritical: recommendedDTotalCritical,
    dTotalHigh: recommendedDTotalHigh,
  };

  // 현재 설정 vs 데이터 기반 권장값 비교 메시지
  if (p80Raw != null) {
    const diff = current.highCutoff - recommendedHighCutoff;
    if (Math.abs(diff) > 2) {
      suggestions.push(
      `highCutoff: 현재 ${current.highCutoff} → 권장 ${recommendedHighCutoff} (데이터 상위 20% 지점 p80=${p80Raw.toFixed(1)}). ${diff > 0 ? '현재가 더 높음: high 구간이 좁음.' : '현재가 더 낮음: high 구간이 넓음.'}`
      );
    }
  }
  if (p50Raw != null) {
    const diff = current.midCutoff - recommendedMidCutoff;
    if (Math.abs(diff) > 2) {
      suggestions.push(
      `midCutoff: 현재 ${current.midCutoff} → 권장 ${recommendedMidCutoff} (데이터 중위 p50=${p50Raw.toFixed(1)}).`
      );
    }
  }
  if (traitP80Avg != null) {
    const diff = current.archetypeHighCutoff - recommendedArchetypeHigh;
    if (Math.abs(diff) > 2) {
      suggestions.push(
      `archetypeHighCutoff: 현재 ${current.archetypeHighCutoff} → 권장 ${recommendedArchetypeHigh} (4개 trait p80 평균=${traitP80Avg.toFixed(1)}).`
      );
    }
  }
  if (p90Raw != null) {
    const diff = current.dTotalCritical - recommendedDTotalCritical;
    if (Math.abs(diff) > 2) {
      suggestions.push(
      `dTotalCritical: 현재 ${current.dTotalCritical} → 권장 ${recommendedDTotalCritical} (데이터 상위 10% p90=${p90Raw.toFixed(1)}).`
      );
    }
  }

  if (suggestions.length === 0) {
    suggestions.push('현재 NORM_CONFIG가 데이터 분포와 크게 어긋나지 않습니다. 필요 시 p80/p50 값을 참고해 수동 조정하세요.');
  }

  return {
    recommended,
    suggestions,
    distributionValid: true,
  };
}

/**
 * 권장 NORM_CONFIG를 darkNatureScoring.ts에 붙여넣을 수 있는 객체 리터럴 문자열로 반환
 */
export function formatNormConfigAsCode(config: NormConfigRecommendation): string {
  return `export const NORM_CONFIG = {
  highCutoff: ${config.highCutoff},
  midCutoff: ${config.midCutoff},
  archetypeHighCutoff: ${config.archetypeHighCutoff},
  subFactorHighCutoff: ${config.subFactorHighCutoff},
  dTotalCritical: ${config.dTotalCritical},
  dTotalHigh: ${config.dTotalHigh},
} as const;`;
}
