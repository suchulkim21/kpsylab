/**
 * Consistency Auditor: 재검사 데이터 통합 및 일관성 유지
 * - Delta Detection: 변화 지점 식별
 * - Global State Update: 전역 프로필 갱신
 * - Cross-Reference Validation: 모듈 간 충돌 검사
 * - Narrative Syncing: 진화 내러티브 생성
 */

import { updateM1Global } from "@/lib/store/userGlobalVector";

export interface RetestContext {
  targetModule: string;
  isRetest: boolean;
  previousResult?: { type: string; vector: Record<string, number | string> };
  newResult: { type: string; vector: Record<string, number | string> };
}

export interface AuditOutput {
  delta: { typeChanged: boolean; prevType: string; newType: string };
  evolutionNarrative: string;
  crossReferenceWarnings: string[];
}

/**
 * 1. 변화 감지 (Delta Detection)
 */
export function detectDelta(
  previous: { type: string; vector?: Record<string, unknown> },
  current: { type: string; vector?: Record<string, unknown> }
): { typeChanged: boolean; prevType: string; newType: string } {
  const typeChanged = previous.type !== current.type;
  return {
    typeChanged,
    prevType: previous.type,
    newType: current.type,
  };
}

/**
 * 2. 전역 상태 업데이트 + 3. Cross-Reference 검증 (간단 버전)
 * M1 재검사 시 호출: 전역 프로필 갱신 및 dirty flag 설정
 */
export function applyRetestAndPropagate(context: RetestContext): AuditOutput {
  const delta = context.previousResult
    ? detectDelta(
        { type: context.previousResult.type, vector: context.previousResult.vector },
        { type: context.newResult.type, vector: context.newResult.vector }
      )
    : { typeChanged: false, prevType: "", newType: context.newResult.type };

  // 전역 프로필 갱신
  updateM1Global(context.newResult, {
    isRetest: context.isRetest,
    previousType: context.previousResult?.type,
  });

  // 진화 내러티브
  const evolutionNarrative = buildEvolutionNarrative(delta, context);

  // 충돌 경고 (추후 M2, M3 데이터와 교차 검증 시 확장)
  const crossReferenceWarnings: string[] = [];
  if (delta.typeChanged) {
    crossReferenceWarnings.push(
      `M1 유형이 ${delta.prevType}에서 ${delta.newType}로 변경됨. M2/M3 결과지가 새 유형 관점에서 재해석될 수 있습니다.`
    );
  }

  return { delta, evolutionNarrative, crossReferenceWarnings };
}

/**
 * 4. 내러티브 동기화: "이전 검사에서는 X였으나, 이번 검사에서 Y가 더 명확해졌습니다"
 */
function buildEvolutionNarrative(
  delta: { typeChanged: boolean; prevType: string; newType: string },
  context: RetestContext
): string {
  if (!context.isRetest || !delta.typeChanged) {
    return "";
  }
  const typeLabels: Record<string, string> = {
    A: "완벽주의적 통제형",
    B: "타인 의존형",
    C: "감정 회피형",
    D: "충동적 행동형",
  };
  const prevLabel = typeLabels[delta.prevType] ?? delta.prevType;
  const newLabel = typeLabels[delta.newType] ?? delta.newType;
  return `이전 검사에서는 ${prevLabel} 성향이 주로 관찰되었으나, 이번 재검사를 통해 ${newLabel} 성향이 더 명확히 드러났습니다. 새로운 통찰이 기존 데이터와 결합되어 진화된 결과입니다.`;
}

/**
 * 리포트 상단에 표시할 "진화 배너" 텍스트 (재검사 시)
 */
export function getEvolutionBannerText(globalProfile: {
  m1?: { isRetest?: boolean; previousType?: string; dominantType?: string };
}): string | null {
  const m1 = globalProfile.m1;
  if (!m1?.isRetest || !m1.previousType || m1.previousType === m1.dominantType)
    return null;
  return buildEvolutionNarrative(
    {
      typeChanged: true,
      prevType: m1.previousType,
      newType: m1.dominantType ?? "",
    },
    { targetModule: "Module_1", isRetest: true, newResult: { type: m1.dominantType ?? "", vector: {} } }
  );
}
