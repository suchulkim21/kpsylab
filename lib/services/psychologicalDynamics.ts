/**
 * 심리 역동 분석: C < 0.6 시 '오류'가 아닌 '심리적 성장'/'상황적 페르소나' 해석
 *
 * Step 1: Differentiation - V_old vs V_new 최대 변화 차원 추출
 * Step 2: Narrative Model - Evolution | Contextual Persona | Critical Shift
 */

import type { LatentVector, LatentDimension } from "@/lib/store/masterVector";
import { LATENT_DIMENSIONS } from "@/lib/store/masterVector";

const DIMENSION_LABELS: Record<LatentDimension, string> = {
  anxiety: "불안",
  control: "통제력",
  extraversion: "외향성",
  deliberation: "신중함",
  people_pleasing: "타인 의향",
  impulsivity: "충동성",
};

export type NarrativeModel = "evolution" | "contextual_persona" | "critical_shift";

export interface DifferentiationResult {
  keyDeltas: Array<{ dimension: LatentDimension; label: string; delta: number; direction: "up" | "down" }>;
  maxDeltaDimension: LatentDimension | null;
  maxDeltaAbs: number;
}

export interface NarrativeResult {
  model: NarrativeModel;
  narrative: string;
  keywords: string;
}

/** Step 1: 가장 큰 변화 차원 추출 */
export function differentiate(
  vOld: LatentVector,
  vNew: LatentVector
): DifferentiationResult {
  const keyDeltas: DifferentiationResult["keyDeltas"] = [];
  let maxDeltaAbs = 0;
  let maxDeltaDimension: LatentDimension | null = null;

  for (const dim of LATENT_DIMENSIONS) {
    const delta = vNew[dim] - vOld[dim];
    const absDelta = Math.abs(delta);
    if (absDelta >= 0.1) {
      keyDeltas.push({
        dimension: dim,
        label: DIMENSION_LABELS[dim],
        delta,
        direction: delta > 0 ? "up" : "down",
      });
      if (absDelta > maxDeltaAbs) {
        maxDeltaAbs = absDelta;
        maxDeltaDimension = dim;
      }
    }
  }

  keyDeltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  return { keyDeltas, maxDeltaDimension, maxDeltaAbs };
}

/** 변화 양상에 따른 내러티브 모델 선택 */
export function selectNarrativeModel(
  vOld: LatentVector,
  vNew: LatentVector,
  deltaDays: number,
  diff: DifferentiationResult
): NarrativeModel {
  const { maxDeltaAbs, keyDeltas } = diff;

  const invertedCount = keyDeltas.filter((d) => Math.abs(d.delta) > 0.4).length;
  const hasFullFlip = Object.keys(vOld).some(
    (k) => Math.abs((vNew as Record<string, number>)[k] - (vOld as Record<string, number>)[k]) > 0.5
  );

  if (hasFullFlip || invertedCount >= 2) {
    return "critical_shift";
  }
  if (deltaDays > 30 && maxDeltaAbs < 0.4) {
    return "evolution";
  }
  return "contextual_persona";
}

/** Step 2: 해석 모델별 내러티브 생성 */
export function generateNarrative(
  model: NarrativeModel,
  diff: DifferentiationResult,
  deltaDays: number
): NarrativeResult {
  const top = diff.keyDeltas.slice(0, 2);
  const keywords = top
    .map(
      (d) =>
        `${DIMENSION_LABELS[d.dimension]} ${d.direction === "up" ? "급등" : "급락"}`
    )
    .join(", ");

  switch (model) {
    case "evolution":
      return {
        model: "evolution",
        keywords,
        narrative: `사용자의 심리적 기저가 경험을 통해 정교화되고 있습니다. 특히 ${top[0]?.label ?? "핵심 특성"}의 변화는 과거의 방어기제가 성숙한 대응 기제로 전환되었음을 시사합니다.`,
      };
    case "contextual_persona":
      return {
        model: "contextual_persona",
        keywords,
        narrative: `현재 사용자는 특정 환경(직장/사회)에서의 역할과 본연의 자아 사이에서 전략적 분리를 시도하고 있습니다. 두 결과의 차이는 오류가 아니라 상황 적응력의 결과입니다.`,
      };
    case "critical_shift":
      return {
        model: "critical_shift",
        keywords,
        narrative: `사용자는 현재 중대한 심리적 전환점에 서 있습니다. 기존의 행동 양식을 탈피하여 새로운 정체성을 형성하는 과정에서 나타나는 역동적인 신호입니다.`,
      };
  }
}

/** 통합: C < 0.6 시 전체 분석 파이프라인 */
export function analyzePsychologicalDynamics(
  vOld: LatentVector,
  vNew: LatentVector,
  deltaDays: number
): { diff: DifferentiationResult; narrative: NarrativeResult } | null {
  const diff = differentiate(vOld, vNew);
  if (diff.keyDeltas.length === 0) return null;

  const model = selectNarrativeModel(vOld, vNew, deltaDays, diff);
  const narrative = generateNarrative(model, diff, deltaDays);
  return { diff, narrative };
}
