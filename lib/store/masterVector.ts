/**
 * Global Master Vector: 가중치 기반 다차원 벡터 합성
 *
 * V_master = Σ(V_m · W_m · R_m) / Σ(W_m · R_m)
 * - V_m: 모듈 결과 벡터 (Latent Trait Space)
 * - W_m: 신뢰 가중치 (Trust Weight)
 * - R_m: 최신성 가중치 (Recency) = e^(-λ·Δt)
 *
 * C (일관성 지수) = cos(V_old, V_new) → C ≤ 0.4 시 Anomaly
 */

/** 공통 차원 정의: Latent Trait Space (심리적 고정점) */
export const LATENT_DIMENSIONS = [
  "anxiety",         // 불안
  "control",         // 통제력
  "extraversion",    // 외향성
  "deliberation",    // 신중함
  "people_pleasing", // 타인 의향
  "impulsivity",     // 충동성
] as const;

export type LatentDimension = (typeof LATENT_DIMENSIONS)[number];

/** N차원 벡터 (0~1 정규화) */
export type LatentVector = Record<LatentDimension, number>;

function clamp(v: number) {
  return Math.max(0, Math.min(1, v));
}

/** 빈 벡터 (중립 0.5) */
export function zeroVector(): LatentVector {
  return Object.fromEntries(LATENT_DIMENSIONS.map((d) => [d, 0.5])) as LatentVector;
}

/** M1 (A,B,C,D) → Latent Space 투영 */
export function projectM1ToLatent(vector: Record<string, number | string>): LatentVector {
  const A = clamp(Number(vector.A ?? 0));
  const B = clamp(Number(vector.B ?? 0));
  const C = clamp(Number(vector.C ?? 0));
  const D = clamp(Number(vector.D ?? 0));
  return {
    anxiety: clamp(0.6 * A + 0.4 * C),
    control: clamp(0.7 * A + 0.3 * C),
    extraversion: clamp(0.5 - 0.3 * B),
    deliberation: clamp(1 - 0.6 * D - 0.2 * A),
    people_pleasing: B,
    impulsivity: D,
  };
}

/** M2 (p,a,sd 0~100) → Latent Space 투영 */
export function projectM2ToLatent(scores: {
  proactivity?: number;
  adaptability?: number;
  socialDistance?: number;
}): LatentVector {
  const p = clamp((scores.proactivity ?? 50) / 100);
  const a = clamp((scores.adaptability ?? 50) / 100);
  const sd = clamp((scores.socialDistance ?? 50) / 100);
  return {
    anxiety: clamp(0.3 * (1 - a)),
    control: clamp(0.5 + 0.3 * (p - 0.5)),
    extraversion: clamp(1 - sd),
    deliberation: a,
    people_pleasing: clamp(1 - sd),
    impulsivity: clamp(1 - a),
  };
}

/** 신뢰 가중치 W_m: 문항 수·정교도 기반 */
export const TRUST_WEIGHTS: Record<string, number> = {
  Module_1: 0.9,  // CAT + 정교한 인지 패턴
  Module_2: 0.8,  // 27 시나리오
  Module_3: 0.7,  // 이상/잠재력 (추후 확장)
};

/** 최신성 가중치 R_m = e^(-λ·Δt), Δt=일 단위 */
const LAMBDA = 0.02; // 감쇠계수: ~35일 후 약 0.5

export function recencyWeight(timestamp: string): number {
  const then = new Date(timestamp).getTime();
  const now = Date.now();
  const deltaDays = (now - then) / (1000 * 60 * 60 * 24);
  return Math.exp(-LAMBDA * deltaDays);
}

/** 가중치 합성: V_master = Σ(V_m · W_m · R_m) / Σ(W_m · R_m) */
export function synthesizeMasterVector(
  contributions: Array<{
    moduleId: string;
    vector: LatentVector;
    timestamp: string;
  }>
): LatentVector {
  if (contributions.length === 0) return zeroVector();

  let sumW = 0;
  const weighted = zeroVector();

  for (const { moduleId, vector, timestamp } of contributions) {
    const W = TRUST_WEIGHTS[moduleId] ?? 0.5;
    const R = recencyWeight(timestamp);
    const weight = W * R;
    sumW += weight;
    for (const dim of LATENT_DIMENSIONS) {
      weighted[dim] += vector[dim] * weight;
    }
  }

  if (sumW <= 0) return zeroVector();
  for (const dim of LATENT_DIMENSIONS) {
    weighted[dim] = clamp(weighted[dim] / sumW);
  }
  return weighted;
}

/** 코사인 유사도 C = (V_old · V_new) / (|V_old| |V_new|), 0~1 스케일 */
export function cosineSimilarity(a: LatentVector, b: LatentVector): number {
  const raw = cosineSimilarityRaw(a, b);
  return clamp((raw + 1) / 2);
}

/** 원본 코사인 (-1~1) */
export function cosineSimilarityRaw(a: LatentVector, b: LatentVector): number {
  let dot = 0, normA = 0, normB = 0;
  for (const dim of LATENT_DIMENSIONS) {
    dot += a[dim] * b[dim];
    normA += a[dim] * a[dim];
    normB += b[dim] * b[dim];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom < 1e-9 ? 1 : dot / denom;
}

/** C < 0.6 → 유의미 변화 (심리적 성장/상황적 페르소나) */
export const ANOMALY_THRESHOLD = 0.6;

export function isAnomaly(cosineRaw: number): boolean {
  return cosineRaw < ANOMALY_THRESHOLD;
}

// --- 하위 호환: MasterVector (기존 구조) ---

export interface MasterVector {
  perfectionism: number;
  people_pleasing: number;
  emotional_avoidance: number;
  impulsivity: number;
  proactivity: number;
  adaptability: number;
  social_distance: number;
  deliberation: number;
  anxiety: number;
  ego_dependence: number;
}

/** LatentVector → MasterVector (레거시 매핑) */
export function latentToMasterVector(lv: LatentVector): MasterVector {
  return {
    perfectionism: lv.control,
    people_pleasing: lv.people_pleasing,
    emotional_avoidance: lv.anxiety * 0.5,
    impulsivity: lv.impulsivity,
    proactivity: lv.extraversion,
    adaptability: lv.deliberation,
    social_distance: 1 - lv.extraversion,
    deliberation: lv.deliberation,
    anxiety: lv.anxiety,
    ego_dependence: lv.people_pleasing,
  };
}

export const DEFAULT_MASTER: MasterVector = latentToMasterVector(zeroVector());

/** M1 vector → Partial MasterVector (기존 호환) */
export function m1ToTraits(vector: Record<string, number | string>): Partial<MasterVector> {
  const lv = projectM1ToLatent(vector);
  return latentToMasterVector(lv);
}

/** M2 scores → Partial MasterVector (기존 호환) */
export function m2ToTraits(scores: {
  proactivity?: number;
  adaptability?: number;
  socialDistance?: number;
}): Partial<MasterVector> {
  const lv = projectM2ToLatent(scores);
  return latentToMasterVector(lv);
}

/** 레거시: 단순 병합 (호출부에서 synthesizeMasterVector 사용 권장) */
export function mergeIntoMasterVector(
  current: MasterVector,
  m1Traits?: Partial<MasterVector>,
  m2Traits?: Partial<MasterVector>
): MasterVector {
  const next = { ...current };
  if (m1Traits) {
    for (const [k, v] of Object.entries(m1Traits)) {
      if (typeof v === "number" && k in next) (next as Record<string, number>)[k] = clamp(v);
    }
  }
  if (m2Traits) {
    for (const [k, v] of Object.entries(m2Traits)) {
      if (typeof v === "number" && k in next) (next as Record<string, number>)[k] = clamp(v);
    }
  }
  return next;
}

/** M1 vs M2 일관성: Latent Space 코사인 (0~1) */
export function computeConsistencyScore(
  m1: { dominantType: string; vector: Record<string, number> } | undefined,
  m2: { typeCode: string; scores: { p: number; a: number; sd: number } } | undefined
): number {
  if (!m1 || !m2) return 1;
  const v1 = projectM1ToLatent(m1.vector);
  const v2 = projectM2ToLatent({
    proactivity: m2.scores.p,
    adaptability: m2.scores.a,
    socialDistance: m2.scores.sd,
  });
  return cosineSimilarity(v1, v2);
}

/** 재검사 시 V_old vs V_new 코사인 → Anomaly 여부 */
export function computeRetestConsistency(
  prevVector: Record<string, number | string>,
  newVector: Record<string, number | string>
): { cosineRaw: number; consistencyScore: number; isAnomaly: boolean } {
  const vOld = projectM1ToLatent(prevVector);
  const vNew = projectM1ToLatent(newVector);
  const cosineRaw = cosineSimilarityRaw(vOld, vNew);
  return {
    cosineRaw,
    consistencyScore: clamp((cosineRaw + 1) / 2),
    isAnomaly: isAnomaly(cosineRaw),
  };
}
