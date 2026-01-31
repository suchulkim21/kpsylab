/**
 * 다이내믹 프로파일 매트릭스 (Dynamic Profile Matrix)
 *
 * 결정 로직 (determineArchetype 기준):
 * - DARK_APEX: 4개 특성 모두 ≥ 75
 * - ALL_LOW: 1등(최대치) < 50
 * - Pure: gap ≥ 15이고 1등 ≥ 60 → PRIMARY_PURE
 * - HYBRID_MID: 1등 < 60 (격차 15 미만)
 * - 그 외: PRIMARY_SECONDARY (예: MACH_NARC)
 */

import type { DarkTrait } from './darkNatureScoring';
import type { DarkTraitScores } from './darkNatureScoring';

/** MNPS 아키타입 ID (16+종 정밀 판별용) */
export type MnpsArchetypeId =
  | 'MACH_PURE' | 'MACH_NARC' | 'MACH_PSYCH' | 'MACH_SAD'
  | 'NARC_PURE' | 'NARC_MACH' | 'NARC_PSYCH' | 'NARC_SAD'
  | 'PSYCH_PURE' | 'PSYCH_MACH' | 'PSYCH_NARC' | 'PSYCH_SAD'
  | 'SAD_PURE'   | 'SAD_MACH'   | 'SAD_NARC'   | 'SAD_PSYCH'
  | 'DARK_APEX'  | 'ALL_LOW'    | 'HYBRID_MID';

/** 지배-보조 격차에 따른 프로파일 유형 */
export type ProfileType = 'Pure' | 'Hybrid' | 'Mixed';

/** D-Total 구간에 따른 전체 강도 */
export type Intensity = 'Extreme' | 'High' | 'Moderate' | 'Low';

/** 매트릭스 산출 결과 */
export interface ProfileMatrixResult {
  /** MNPS 아키타입 ID (정밀 판별용) */
  archetypeId: MnpsArchetypeId;
  /** 지배 성향 (1위) */
  dominant: DarkTrait;
  /** 보조 성향 (2위). Pure일 때만 의미 있음(보조도 고려) */
  auxiliary: DarkTrait | null;
  /** 지배 - 보조 점수 차이 */
  gap: number;
  /** Pure / Hybrid / Mixed */
  profileType: ProfileType;
  /** D-Total 구간 */
  intensity: Intensity;
  /** 매트릭스 아키타입 키 (콘텐츠 매핑·확장용) */
  archetypeKey: string;
  /** 한글 표기명 */
  archetypeLabelKo: string;
  /** 영문 표기명 (선택) */
  archetypeLabelEn: string;
  /** 밸런스형 여부 (All Moderate) */
  isBalanced: boolean;
  /** 레거시 아키타입 (contentLibrary 키와 매핑용) */
  legacyArchetypeKey: string;
}

const PURE_GAP = 20;
const HYBRID_GAP = 10;
const MID_LOW = 40;
const MID_HIGH = 60;
const HIGH_CUTOFF = 70;
const EXTREME_DTOTAL = 85;
const HIGH_DTOTAL = 70;
const MODERATE_DTOTAL = 40;

/** 정밀 판별용: Pure 조건 gap ≥ 15, 1등 ≥ 60 */
const PURE_GAP_PRECISE = 15;
const PURE_MIN_SCORE = 60;
/** All Low: 1등(최대치) < 50 */
const ALL_LOW_MAX = 50;
/** Dark Apex: 4개 모두 ≥ 75 */
const DARK_APEX_MIN = 75;
/** Hybrid Mid: 1등 < 60 */
const HYBRID_MID_MAX = 60;

const TRAIT_PREFIX: Record<DarkTrait, string> = {
  machiavellianism: 'MACH',
  narcissism: 'NARC',
  psychopathy: 'PSYCH',
  sadism: 'SAD',
};
const PREFIX_TO_TRAIT: Record<string, DarkTrait> = {
  MACH: 'machiavellianism',
  NARC: 'narcissism',
  PSYCH: 'psychopathy',
  SAD: 'sadism',
};

/**
 * 점수 분포를 분석하여 16+종의 아키타입 중 하나를 결정하는 정밀 판별 함수
 */
export function determineArchetype(
  scores: DarkTraitScores,
  _dTotal: number
): MnpsArchetypeId {
  const values = Object.values(scores);
  const allHigh = values.every((s) => s >= DARK_APEX_MIN);
  if (allHigh) return 'DARK_APEX';

  const maxScore = Math.max(...values);
  if (maxScore < ALL_LOW_MAX) return 'ALL_LOW';

  const sortedTraits = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [primary, secondary] = sortedTraits;
  const pTrait = primary[0] as keyof typeof TRAIT_PREFIX;
  const pScore = primary[1];
  const sScore = secondary[1];
  const gap = pScore - sScore;

  if (gap >= PURE_GAP_PRECISE && pScore >= PURE_MIN_SCORE) {
    return `${TRAIT_PREFIX[pTrait]}_PURE` as MnpsArchetypeId;
  }
  if (pScore < HYBRID_MID_MAX) return 'HYBRID_MID';

  const sTrait = secondary[0] as keyof typeof TRAIT_PREFIX;
  return `${TRAIT_PREFIX[pTrait]}_${TRAIT_PREFIX[sTrait]}` as MnpsArchetypeId;
}

/** MnpsArchetypeId → 아키타입 키·한글·영문 (16종 + DARK_APEX / ALL_LOW / HYBRID_MID) */
const MNPS_ARCHETYPE_ID_TO_DISPLAY: Record<MnpsArchetypeId, { key: string; ko: string; en: string }> = {
  MACH_PURE: { key: 'TheColdArchitect', ko: '차가운 설계자', en: 'The Cold Architect' },
  MACH_NARC: { key: 'TheStageDirector', ko: '무대 연출가', en: 'The Stage Director' },
  MACH_PSYCH: { key: 'TheTacticalGambler', ko: '전술적 승부사', en: 'The Tactical Gambler' },
  MACH_SAD: { key: 'TheSmilingTrap', ko: '웃는 덫', en: 'The Smiling Trap' },
  NARC_PURE: { key: 'TheGlassEmperor', ko: '유리 황제', en: 'The Glass Emperor' },
  NARC_MACH: { key: 'TheCultLeader', ko: '교주형 리더', en: 'The Cult Leader' },
  NARC_PSYCH: { key: 'TheGoldenStorm', ko: '황금 폭풍', en: 'The Golden Storm' },
  NARC_SAD: { key: 'TheToxicDiva', ko: '독성 디바', en: 'The Toxic Diva' },
  PSYCH_PURE: { key: 'TheImpulseEngine', ko: '충동 엔진', en: 'The Impulse Engine' },
  PSYCH_MACH: { key: 'TheCrisisProfiteer', ko: '위기 사냥꾼', en: 'The Crisis Profiteer' },
  PSYCH_NARC: { key: 'TheChaosPerformer', ko: '혼돈의 공연자', en: 'The Chaos Performer' },
  PSYCH_SAD: { key: 'TheWildBeast', ko: '야수', en: 'The Wild Beast' },
  SAD_PURE: { key: 'TheIronHand', ko: '강철 손', en: 'The Iron Hand' },
  SAD_MACH: { key: 'TheSilentPredator', ko: '침묵의 포식자', en: 'The Silent Predator' },
  SAD_NARC: { key: 'TheCruelJudge', ko: '잔혹한 심판관', en: 'The Cruel Judge' },
  SAD_PSYCH: { key: 'TheBloodHunter', ko: '피의 사냥꾼', en: 'The Blood Hunter' },
  DARK_APEX: { key: 'TheDarkApex', ko: '다크 에이펙스', en: 'Dark Apex' },
  ALL_LOW: { key: 'TheClearMirror', ko: '맑은 거울', en: 'The Clear Mirror' },
  HYBRID_MID: { key: 'TheGreyWalker', ko: '회색 여행자', en: 'The Grey Walker' },
};

/**
 * 아키타입 ID만으로 표시 정보·레거시 키 반환 (assembleReport에서 재계산 없이 사용)
 */
export function getDisplayFromArchetypeId(id: MnpsArchetypeId): {
  archetypeKey: string;
  archetypeLabelKo: string;
  archetypeLabelEn: string;
  legacyArchetypeKey: string;
} {
  const display = MNPS_ARCHETYPE_ID_TO_DISPLAY[id];
  const legacyArchetypeKey = display
    ? (LEGACY_ARCHETYPE_MAP[display.key] ?? 'Mixed Strategic Profile')
    : 'Mixed Strategic Profile';
  return {
    archetypeKey: display?.key ?? `Unknown_${id}`,
    archetypeLabelKo: display?.ko ?? id,
    archetypeLabelEn: display?.en ?? id,
    legacyArchetypeKey,
  };
}

/**
 * 4개 트레이트 점수 정렬 (내림차순)
 */
function getOrderedTraits(scores: DarkTraitScores): { key: DarkTrait; value: number }[] {
  const entries: { key: DarkTrait; value: number }[] = [
    { key: 'machiavellianism', value: scores.machiavellianism },
    { key: 'narcissism', value: scores.narcissism },
    { key: 'psychopathy', value: scores.psychopathy },
    { key: 'sadism', value: scores.sadism },
  ];
  return entries.sort((a, b) => b.value - a.value);
}

/**
 * D-Total 구간 → Intensity (강도별 메시지 분기용)
 */
export function getIntensity(dTotal: number): Intensity {
  if (dTotal >= EXTREME_DTOTAL) return 'Extreme';
  if (dTotal >= HIGH_DTOTAL) return 'High';
  if (dTotal >= MODERATE_DTOTAL) return 'Moderate';
  return 'Low';
}

/**
 * 4개 특성 모두 40~60 구간인지 (밸런스형)
 */
function isAllModerate(scores: DarkTraitScores): boolean {
  const { machiavellianism: m, narcissism: n, psychopathy: p, sadism: s } = scores;
  return (
    m >= MID_LOW && m <= MID_HIGH &&
    n >= MID_LOW && n <= MID_HIGH &&
    p >= MID_LOW && p <= MID_HIGH &&
    s >= MID_LOW && s <= MID_HIGH
  );
}

/**
 * (지배, 보조, Pure/Hybrid) → 아키타입 키·한글·영문
 * 확장 시 이 테이블만 추가하면 됨.
 */
const ARCHETYPE_MATRIX: Record<
  DarkTrait,
  Partial<Record<DarkTrait | 'Pure', { key: string; ko: string; en: string }>>
> = {
  machiavellianism: {
    Pure: { key: 'TheColdArchitect', ko: '차가운 설계자', en: 'The Cold Architect' },
    narcissism: { key: 'TheStageDirector', ko: '무대 연출가', en: 'The Stage Director' },
    psychopathy: { key: 'TheTacticalGambler', ko: '전술적 승부사', en: 'The Tactical Gambler' },
    sadism: { key: 'TheSmilingTrap', ko: '웃는 덫', en: 'The Smiling Trap' },
  },
  narcissism: {
    Pure: { key: 'TheGlassEmperor', ko: '유리 황제', en: 'The Glass Emperor' },
    machiavellianism: { key: 'TheCultLeader', ko: '교주형 리더', en: 'The Cult Leader' },
    psychopathy: { key: 'TheGoldenStorm', ko: '황금 폭풍', en: 'The Golden Storm' },
    sadism: { key: 'TheToxicDiva', ko: '독성 디바', en: 'The Toxic Diva' },
  },
  psychopathy: {
    Pure: { key: 'TheImpulseEngine', ko: '충동 엔진', en: 'The Impulse Engine' },
    machiavellianism: { key: 'TheCrisisProfiteer', ko: '위기 사냥꾼', en: 'The Crisis Profiteer' },
    narcissism: { key: 'TheChaosCharmer', ko: '혼란의 매력가', en: 'The Chaos Charmer' },
    sadism: { key: 'TheWildBeast', ko: '야수', en: 'The Wild Beast' },
  },
  sadism: {
    Pure: { key: 'TheSilentPredator', ko: '침묵형 포식자', en: 'The Silent Predator' },
    machiavellianism: { key: 'TheSmilingTrap', ko: '웃는 덫', en: 'The Smiling Trap' },
    narcissism: { key: 'TheToxicDiva', ko: '독성 디바', en: 'The Toxic Diva' },
    psychopathy: { key: 'TheWildBeast', ko: '야수', en: 'The Wild Beast' },
  },
};

/** 밸런스형 단일 아키타입 */
const BALANCED_ARCHETYPE = { key: 'TheGreyWalker', ko: '회색 여행자', en: 'The Grey Walker' };

/** All Low (1등 < 40) 단일 아키타입 */
const CLEAR_MIRROR_ARCHETYPE = { key: 'TheClearMirror', ko: '맑은 거울', en: 'The Clear Mirror' };

/**
 * 레거시 아키타입 키 매핑 (contentLibrary의 archetypeIntros / archetypeDeepDives 키)
 * 새 매트릭스 키 → 기존 12종 중 가장 가까운 키
 */
const LEGACY_ARCHETYPE_MAP: Record<string, string> = {
  TheColdArchitect: 'Strategic Game Architect',
  TheStageDirector: 'The Puppet Master',
  TheTacticalGambler: 'Cold Crisis Operator',
  TheSmilingTrap: 'Social Predator',
  TheGlassEmperor: 'High-Impact Ego Architect',
  TheCultLeader: 'The Puppet Master',
  TheGoldenStorm: 'The Mirror Egoist',
  TheToxicDiva: 'Social Predator',
  TheImpulseEngine: 'The Volatile Outlaw',
  TheCrisisProfiteer: 'Cold Crisis Operator',
  TheChaosCharmer: 'The Volatile Outlaw',
  TheWildBeast: 'The Volatile Outlaw',
  TheSilentPredator: 'The Silent Predator',
  TheGreyWalker: 'Mixed Strategic Profile',
  TheClearMirror: 'Mixed Strategic Profile',
  TheIronHand: 'Social Predator',
  TheCruelJudge: 'Social Predator',
  TheBloodHunter: 'The Volatile Outlaw',
  TheDarkApex: 'Strategic Game Architect',
};

/** archetypeId에서 지배/보조 특성 추출 */
function getDominantAuxiliaryFromId(
  archetypeId: MnpsArchetypeId,
  ordered: { key: DarkTrait; value: number }[]
): { dominant: DarkTrait; auxiliary: DarkTrait | null } {
  const top1 = ordered[0]!.key;
  const top2 = ordered[1]!.key;
  if (archetypeId === 'DARK_APEX' || archetypeId === 'ALL_LOW' || archetypeId === 'HYBRID_MID') {
    return { dominant: top1, auxiliary: archetypeId === 'DARK_APEX' ? top2 : null };
  }
  const [primary, secondary] = archetypeId.split('_');
  const dominant = PREFIX_TO_TRAIT[primary!] ?? top1;
  const auxiliary = secondary === 'PURE' ? null : (PREFIX_TO_TRAIT[secondary!] ?? null);
  return { dominant, auxiliary };
}

/**
 * 다이내믹 프로파일 매트릭스 산출 (determineArchetype 정밀 판별 기준 사용)
 */
export function getProfileMatrix(
  traitScores: DarkTraitScores,
  dTotal: number
): ProfileMatrixResult {
  const archetypeId = determineArchetype(traitScores, dTotal);
  const ordered = getOrderedTraits(traitScores);
  const top1 = ordered[0]!;
  const top2 = ordered[1]!;
  const gap = top1.value - top2.value;
  const intensity = getIntensity(dTotal);
  const display = MNPS_ARCHETYPE_ID_TO_DISPLAY[archetypeId];
  const { dominant, auxiliary } = getDominantAuxiliaryFromId(archetypeId, ordered);

  const profileType: ProfileType =
    archetypeId.endsWith('_PURE') ? 'Pure'
    : archetypeId === 'HYBRID_MID' || archetypeId === 'ALL_LOW' ? 'Mixed'
    : gap < HYBRID_GAP ? 'Hybrid' : 'Mixed';

  const isBalanced = archetypeId === 'HYBRID_MID' && isAllModerate(traitScores);
  const legacyKey = LEGACY_ARCHETYPE_MAP[display.key] ?? 'Mixed Strategic Profile';

  return {
    archetypeId,
    dominant,
    auxiliary,
    gap,
    profileType,
    intensity,
    archetypeKey: display.key,
    archetypeLabelKo: display.ko,
    archetypeLabelEn: display.en,
    isBalanced,
    legacyArchetypeKey: legacyKey,
  };
}

/**
 * 상세 아키타입 코드 반환 (API·디버깅용)
 * determineArchetype과 동일한 ID 형식 반환 (MACH_PURE, MACH_NARC, ALL_LOW 등)
 */
export function getDetailedArchetype(scores: DarkTraitScores): MnpsArchetypeId {
  return determineArchetype(scores, 0);
}
