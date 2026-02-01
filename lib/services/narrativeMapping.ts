/**
 * 데이터 블록 → 인생의 키워드 (Block to Narrative)
 * 심리 지표를 '삶의 사건'과 연결하는 스토리텔링
 */

export type NarrativeKey =
  | "섬세한 안테나"
  | "심리의 파동"
  | "내면의 대화"
  | "뿌리 깊은 나무"
  | "흐르는 강물"
  | "단단한 원석";

export interface NarrativeMapping {
  dataBlock: string;
  keyword: NarrativeKey;
  phrase: string;
}

const M1_TYPE_LABELS: Record<string, string> = {
  A: "완벽주의",
  B: "타인 의존",
  C: "감정 회피",
  D: "충동/회피",
};

/** 높은 불안 수치 → '섬세한 안테나' */
export function mapAnxietyToNarrative(anxietyScore: number): NarrativeMapping | null {
  if (anxietyScore < 0.6) return null;
  return {
    dataBlock: "높은 불안 수치",
    keyword: "섬세한 안테나",
    phrase: "당신의 불안은 고통이 아니라, 주변의 미세한 변화를 감지하는 예민한 안테나입니다.",
  };
}

/** 재검사 수치 변화 → '심리의 파동' */
export function mapRetestChangeToNarrative(
  prevType: string,
  currType: string,
  dimensionLabel: string
): NarrativeMapping {
  return {
    dataBlock: "재검사 수치 변화",
    keyword: "심리의 파동",
    phrase: `지난 검사보다 높아진 ${dimensionLabel}은 당신이 세상과 연결되기로 결심한 용기의 증거입니다.`,
  };
}

/** 벡터 불일치 → '내면의 대화' */
export function mapVectorMismatchToNarrative(
  typeA: string,
  typeB: string
): NarrativeMapping {
  const labelA = M1_TYPE_LABELS[typeA] ?? typeA;
  const labelB = M1_TYPE_LABELS[typeB] ?? typeB;
  return {
    dataBlock: "벡터 불일치",
    keyword: "내면의 대화",
    phrase: `두 결과의 차이는 당신 안의 '${labelA}하는 나'와 '${labelB}하는 나'가 대화하고 있음을 뜻합니다.`,
  };
}

/** 영웅의 여정 단계 라벨 */
export const JOURNEY_STAGES = {
  departure: "출발",
  ordeal: "시련",
  return: "귀환",
} as const;

export function getJourneyStageLabel(stage: keyof typeof JOURNEY_STAGES): string {
  return JOURNEY_STAGES[stage];
}
