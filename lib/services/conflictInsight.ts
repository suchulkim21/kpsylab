/**
 * 모순을 인사이트로: M1 vs M2 결과 충돌 시 '심리적 역동' 설명 생성
 * "사용자의 Module A 결과는 X이나, Module B에서는 Y. [사회적 상황]에서는 적극적이나 [개인적 공간]에서는 신중함..."
 */

const M1_LABELS: Record<string, string> = {
  A: "완벽주의적 통제",
  B: "타인의 인정에 대한 갈망",
  C: "감정 회피",
  D: "충동/회피",
};

const M2_PROFILE_HINTS: Record<string, { social: string; personal: string }> = {
  HLA: { social: "주도적 리더십 상황", personal: "혼자 있을 때의 통제 욕구" },
  HLP: { social: "분석·관망 상황", personal: "깊은 사고와 판단" },
  HIA: { social: "유동적 협업 상황", personal: "즉흥적 실행" },
  HIP: { social: "조화 추구 상황", personal: "수용과 적응" },
  LLA: { social: "원칙적 주장 상황", personal: "규칙 준수" },
  LLP: { social: "전문적 탐구 상황", personal: "독립적 학습" },
  LIA: { social: "직관적 실행 상황", personal: "빠른 결단" },
  LIP: { social: "내향적 독립 상황", personal: "개인 공간 선호" },
};

export interface ConflictInsightInput {
  m1Type: string;
  m2TypeCode: string;
  m2Scores?: { p: number; a: number; sd: number };
  consistencyScore?: number;
  /** C < 0.6: 심리적 성장/상황적 페르소나 */
  anomaly?: boolean;
  /** Differentiation 기반 내러티브 (심리 역동 분석) */
  dynamicsNarrative?: string;
}

/**
 * M1과 M2 결과가 논리적으로 충돌할 때 인사이트 문구 생성
 * 충돌 예: M1 B(타인 의존) + M2 고 socialDistance(사회적 거리) = "겉으로는 거리두지만 내면은 인정 갈망"
 */
export function getConflictInsight(input: ConflictInsightInput): string | null {
  const { m1Type, m2TypeCode, m2Scores, consistencyScore, anomaly, dynamicsNarrative } = input;
  const hint = M2_PROFILE_HINTS[m2TypeCode] ?? { social: "사회적 상황", personal: "개인적 공간" };
  const m1Label = M1_LABELS[m1Type] ?? m1Type;
  const p = m2Scores?.p ?? 50;
  const a = m2Scores?.a ?? 50;
  const sd = m2Scores?.sd ?? 50;
  const highP = p >= 60;
  const highA = a >= 60;
  const highSd = sd >= 60;

  if (anomaly) {
    const base = `재검사 결과가 이전과 달라 '심리적 성장' 또는 '상황별 페르소나 분리'가 감지되었습니다. 이는 오류가 아니라, ${hint.social}과 ${hint.personal}에서 다른 모습을 보이는 당신의 다면성을 반영합니다.`;
    return dynamicsNarrative ? `${base} ${dynamicsNarrative}` : `${base} KPSY LAB은 이러한 역동을 '시간 축의 심리 변화'로 기록하여 더 정밀한 프로파일을 구축합니다.`;
  }
  if ((consistencyScore ?? 1) >= 0.85) return null;

  const conflicts: string[] = [];

  if (m1Type === "A" && !highP) {
    conflicts.push(
      `무의식 방해 요인(M1)에서는 ${m1Label} 성향이 두드러지나, 시나리오 테스트(M2)에서는 주도적 행동보다 신중한 관망을 선택하는 경향이 있습니다. 이는 ${hint.social}에서는 완벽을 추구하다가도, ${hint.personal}에서는 실수를 피하려는 심리적 균형을 시사합니다.`
    );
  }
  if (m1Type === "B" && highSd) {
    conflicts.push(
      `M1에서는 타인의 인정에 대한 강한 갈망이 관찰되나, M2에서는 사회적 거리두기·독립적 선택을 선호합니다. 겉으로는 거리를 두는 듯하나, 내면에서는 인정받지 못할까 봐 조심하는 '역설적 자기보호'가 작동하고 있을 수 있습니다.`
    );
  }
  if (m1Type === "C" && highP) {
    conflicts.push(
      `감정 회피 성향(M1)이 강한 반면, 시나리오에서는 적극적·직접적 대응을 선택했습니다. ${hint.social}에서는 행동으로 표출하되, ${hint.personal}에서는 감정을 억제하는 상황별 페르소나 분리가 나타납니다.`
    );
  }
  if (m1Type === "D" && highA && !highP) {
    conflicts.push(
      `M1에서 충동·회피 성향이 있었으나, M2에서는 유연한 적응과 신중한 대안 탐색을 보였습니다. 외부 자극이 많은 상황에서는 속도감을 추구하다가도, 구조화된 시나리오에서는 더 신중한 판단을 내리는 심층 심리의 변화 과정을 보여줍니다.`
    );
  }

  return conflicts.length > 0 ? conflicts[0] : null;
}
