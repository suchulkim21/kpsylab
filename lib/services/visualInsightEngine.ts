/**
 * KPSY LAB 비주얼 인사이트 엔진
 * 심리 벡터를 직관적 시각(SVG/ASCII)과 뇌과학적 서사로 변환
 */

import type { LatentVector, LatentDimension } from "@/lib/store/masterVector";
import { LATENT_DIMENSIONS } from "@/lib/store/masterVector";
import { differentiate } from "./psychologicalDynamics";

const DIMENSION_LABELS: Record<LatentDimension, string> = {
  anxiety: "불안",
  control: "통제력",
  extraversion: "외향성",
  deliberation: "신중함",
  people_pleasing: "타인 의향",
  impulsivity: "충동성",
};

export type ChangePattern = "expansion" | "focus" | "shift";

export interface VisualInsightInput {
  userContext?: string;
  vectors: { prev: LatentVector; curr: LatentVector };
}

export interface VisualInsightOutput {
  visualMarker: { svg: string; ascii: string };
  changeAnalysis: {
    topDeltas: Array<{ label: string; delta: number; direction: "up" | "down" }>;
    pattern: ChangePattern;
    patternLabel: string;
    trajectorySummary: string;
  };
  neuroscienceNarrative: string;
  integrativeAdvice: string;
}

/** 변화 양상: Expansion(확장) | Focus(수렴) | Shift(전환) */
function classifyChangePattern(
  diff: ReturnType<typeof differentiate>
): ChangePattern {
  const { keyDeltas } = diff;
  if (keyDeltas.length === 0) return "shift";
  const upCount = keyDeltas.filter((d) => d.direction === "up").length;
  const downCount = keyDeltas.filter((d) => d.direction === "down").length;
  const maxAbs = Math.max(...keyDeltas.map((d) => Math.abs(d.delta)), 0);

  if (upCount >= 2 && downCount <= 1) return "expansion";
  if (downCount >= 2 && upCount <= 1) return "focus";
  return "shift";
}

const PATTERN_LABELS: Record<ChangePattern, string> = {
  expansion: "성장 (Expansion)",
  focus: "수렴 (Focus)",
  shift: "전환 (Shift)",
};

/** 뇌과학적 서사 생성 */
function buildNeuroscienceNarrative(
  topDeltas: VisualInsightOutput["changeAnalysis"]["topDeltas"],
  pattern: ChangePattern
): string {
  const dimA = topDeltas[0]?.label ?? "핵심 특성";
  const dimB = topDeltas[1]?.label ?? "보조 특성";
  switch (pattern) {
    case "expansion":
      return `현재 사용자의 뇌는 기존의 안정적인 패턴을 벗어나 새로운 가능성을 탐색하는 '가소성 극대화' 구간에 진입했습니다. ${dimA}의 신경 회로 재구조화가 전두엽 활성도의 변화를 동반하고 있습니다.`;
    case "focus":
      return `기존에 분산되었던 인지 자원이 특정 영역으로 수렴하는 과정이 관찰됩니다. ${dimA} 관련 뇌 영역의 효율적 재조직이 일어나고 있으며, 이는 심리적 에너지의 집중을 의미합니다.`;
    case "shift":
      return `사용자의 뇌는 기존의 안정적인 패턴을 벗어나 새로운 가능성을 탐색하는 '가소성 극대화' 구간에 진입했습니다. ${dimA}에서 ${dimB}로의 무게중심 이동은 신경 회로의 재구조화를 시사합니다.`;
    default:
      return `심리 벡터의 변화가 뇌의 가소성(Neuroplasticity)과 심리적 유연성의 산물로 해석됩니다.`;
  }
}

/** ASCII 게이지 바 생성 [---●---] */
function asciiGauge(value: number, width = 10): string {
  const idx = Math.round(value * width);
  const arr = Array(width + 1).fill("-");
  arr[Math.min(idx, width)] = "●";
  return `[${arr.join("")}]`;
}

/** ASCII 모드: 이전 vs 현재 비교 */
function generateAsciiVisual(
  prev: LatentVector,
  curr: LatentVector,
  topDims: LatentDimension[]
): string {
  const lines = topDims.slice(0, 4).map((dim) => {
    const p = prev[dim];
    const c = curr[dim];
    const label = DIMENSION_LABELS[dim];
    const delta = c - p;
    const arrow = delta > 0 ? "→" : "←";
    return `${label.padEnd(6)} 이전 ${asciiGauge(p)} 현재 ${asciiGauge(c)} ${arrow}`;
  });
  return lines.join("\n");
}

/** SVG: 겹친 레이더 (이전=점선, 현재=실선) */
function generateSvgRadar(
  prev: LatentVector,
  curr: LatentVector,
  size = 120
): string {
  const center = size / 2;
  const radius = center - 10;
  const dims = LATENT_DIMENSIONS;
  const n = dims.length;

  const toPoint = (vec: LatentVector, r: number) => (i: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const val = vec[dims[i]] ?? 0.5;
    const r2 = r * val;
    return {
      x: center + r2 * Math.cos(angle),
      y: center + r2 * Math.sin(angle),
    };
  };

  const prevPoints = dims.map((_, i) => toPoint(prev, radius)(i));
  const currPoints = dims.map((_, i) => toPoint(curr, radius)(i));

  const polyToPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  const axisLines = dims
    .map((_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const ex = center + radius * Math.cos(angle);
      const ey = center + radius * Math.sin(angle);
      return `<line x1="${center}" y1="${center}" x2="${ex}" y2="${ey}" stroke="#374151" stroke-width="0.5" opacity="0.6"/>`;
    })
    .join("\n");

  const prevPath = polyToPath(prevPoints);
  const currPath = polyToPath(currPoints);

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="currGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#22c55e;stop-opacity:0.8"/>
      <stop offset="100%" style="stop-color:#22c55e;stop-opacity:0.3"/>
    </linearGradient>
    <linearGradient id="prevGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#9ca3af;stop-opacity:0.3"/>
      <stop offset="100%" style="stop-color:#9ca3af;stop-opacity:0.1"/>
    </linearGradient>
  </defs>
  ${axisLines}
  <path d="${prevPath}" fill="url(#prevGrad)" stroke="#9ca3af" stroke-width="1.5" stroke-dasharray="4 2"/>
  <path d="${currPath}" fill="url(#currGrad)" stroke="#22c55e" stroke-width="2"/>
</svg>`;
}

/** 통합 제언 (한 문장) */
function buildIntegrativeAdvice(
  topDims: LatentDimension[],
  pattern: ChangePattern
): string {
  const dim = DIMENSION_LABELS[topDims[0]];
  switch (pattern) {
    case "expansion":
      return `재검사 결과는 사회적 관계·직무 역량 테스트에서 '탐색적 태도'의 강화로 재해석될 수 있습니다.`;
    case "focus":
      return `이 변화는 대인관계 테스트 결과와 결합 시 '에너지 집중'의 긍정적 측면으로 해석됩니다.`;
    case "shift":
      return `Master_Vector 갱신에 따라 다른 테스트 결과들이 '전환기의 적응력' 관점에서 새롭게 해석됩니다.`;
    default:
      return `통합 프로필이 갱신되어 더 정밀한 자기 이해가 가능해졌습니다.`;
  }
}

/** 비주얼 인사이트 엔진 메인 */
export function generateVisualInsight(input: VisualInsightInput): VisualInsightOutput {
  const { vectors } = input;
  const diff = differentiate(vectors.prev, vectors.curr);
  const topDims = diff.keyDeltas.slice(0, 2).map((d) => d.dimension);
  const allTopDims = diff.keyDeltas.length >= 2
    ? [diff.keyDeltas[0].dimension, diff.keyDeltas[1].dimension]
    : LATENT_DIMENSIONS.slice(0, 2);

  const pattern = classifyChangePattern(diff);
  const topDeltas = diff.keyDeltas.slice(0, 2).map((d) => ({
    label: d.label,
    delta: d.delta,
    direction: d.direction,
  }));

  const fromLabel = topDeltas[0]?.label ?? "이전 상태";
  const toLabel = topDeltas[1]?.label ?? "현재 상태";
  const trajectorySummary =
    topDeltas.length >= 2
      ? `"${fromLabel}"에서 "${toLabel}"로의 무게중심 이동`
      : `"${fromLabel}"의 유의미한 변화`;

  return {
    visualMarker: {
      svg: generateSvgRadar(vectors.prev, vectors.curr),
      ascii: generateAsciiVisual(vectors.prev, vectors.curr, allTopDims),
    },
    changeAnalysis: {
      topDeltas,
      pattern,
      patternLabel: PATTERN_LABELS[pattern],
      trajectorySummary: `핵심 변화: ${trajectorySummary}`,
    },
    neuroscienceNarrative: buildNeuroscienceNarrative(topDeltas, pattern),
    integrativeAdvice: buildIntegrativeAdvice(allTopDims, pattern),
  };
}
