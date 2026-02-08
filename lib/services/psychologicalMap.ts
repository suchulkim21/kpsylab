/**
 * 나만의 심리 지도: 문장형 로그 (Sentence Log)
 * "당신이 지금까지 걸어온 심리적 궤적" 요약
 */

import type { ModuleHistoryEntry } from "@/lib/store/userGlobalVector";

const M1_TYPE_MOMENTS: Record<string, string> = {
  A: "완벽주의를 마주했고",
  B: "타인의 시선에 대한 갈망을 마주했고",
  C: "감정 회피를 마주했고",
  D: "충동과 회피를 마주했고",
};

const M1_TYPE_TRANSFORM: Record<string, string> = {
  A: "그 완벽주의를 통제력으로 바꾸어",
  B: "그 갈망을 자기 확신으로 바꾸어",
  C: "그 회피를 감정 수용으로 바꾸어",
  D: "그 회피를 의도적 행동으로 바꾸어",
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
  } catch {
    return "";
  }
}

/** 모듈 이력 항목 (result는 선택적 — 로그 생성 시 미사용) */
export type ModuleHistoryEntryLike = Pick<ModuleHistoryEntry, "moduleId" | "timestamp"> & Partial<Pick<ModuleHistoryEntry, "result" | "dominantType">>;

export interface PsychologicalMapInput {
  m1?: { dominantType: string; timestamp: string; isRetest?: boolean; previousType?: string };
  m2?: { typeCode?: string; timestamp: string };
  m3?: { timestamp: string };
  moduleHistory?: ModuleHistoryEntryLike[];
}

/**
 * "2025년 12월, 당신은 불안을 마주했고(M1), 2026년 2월, 그 불안을 통제력으로 바꾸어(재검사), 지금은 누구보다 단단한 자아의 중심(마스터 벡터)을 세웠습니다."
 */
export function generatePsychologicalMapLog(input: PsychologicalMapInput): string {
  const segments: string[] = [];
  const now = new Date();
  const nowStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;

  if (!input.m1) {
    return "당신의 심리적 여정이 기록되기 시작했습니다.";
  }

  const m1Date = formatDate(input.m1.timestamp);
  const moment = M1_TYPE_MOMENTS[input.m1.dominantType] ?? "내면을 마주했고";
  segments.push(`${m1Date}, 당신은 ${moment}(M1)`);

  if (input.m1.isRetest && input.m1.previousType) {
    const transform = M1_TYPE_TRANSFORM[input.m1.dominantType] ?? "그 상태를 성숙으로 바꾸어";
    segments.push(`${nowStr}, ${transform}(재검사)`);
  }

  if (input.m2?.timestamp) {
    const m2Date = formatDate(input.m2.timestamp);
    segments.push(`${m2Date}, 사회적 자기(M2)를 탐색했고`);
  }

  if (input.m3?.timestamp) {
    const m3Date = formatDate(input.m3.timestamp);
    segments.push(`${m3Date}, 이상과 잠재력(M3)을 그렸고`);
  }

  segments.push("지금은 통합된 마스터 벡터를 통해 단단한 자아의 중심을 세우고 있습니다.");

  return segments.join(", ");
}
