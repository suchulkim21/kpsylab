/**
 * KPSY LAB Report Generator Prompt
 * C < 0.6 시 AI에게 전달할 최종 프롬프트 구성
 */

export interface ReportGeneratorInput {
  vOld: Record<string, number>;
  vNew: Record<string, number>;
  consistencyScore: number;
  keyDeltas: Array<{ dimension: string; label: string; delta: number; direction: string }>;
  narrativeModel?: "evolution" | "contextual_persona" | "critical_shift";
}

/** 변화된 핵심 키워드 추출 (예: "통제권의 일시적 상실과 수용적 태도의 발현") */
export function extractChangeKeywords(
  keyDeltas: Array<{ dimension: string; label: string; delta: number; direction: string }>
): string {
  if (keyDeltas.length === 0) return "데이터 변화";
  const parts = keyDeltas.slice(0, 3).map((d) => {
    if (d.direction === "down") return `${d.label}의 완화`;
    return `${d.label}의 발현`;
  });
  return parts.join(", ");
}

export const REPORT_GENERATOR_SYSTEM_PROMPT = `당신은 KPSY LAB의 심층 분석가입니다. 아래의 Input_Data는 사용자의 이전 마스터 벡터와 이번 재검사 벡터의 비교 수치입니다. 두 데이터 사이의 **일관성 점수 C**가 낮게 측정되었습니다.

## 분석 지침
1. 사용자를 다그치거나 결과가 틀렸다고 말하지 마십시오.
2. 수치의 변화를 **'뇌과학적 가소성(Neuroplasticity)'**과 **'심리적 유연성'**의 관점에서 설명하십시오.
3. Master_Vector의 갱신이 사용자의 다른 테스트 결과(예: 대인관계, 직무 역량)에 어떤 긍정적인 '재해석'을 가져오는지 구체적으로 서술하십시오.
4. 최종 리포트는 '더 깊어진 자기 이해'를 축하하는 어조로 마무리하십시오.`;

export function buildReportGeneratorPrompt(input: ReportGeneratorInput): string {
  const keywords = extractChangeKeywords(input.keyDeltas);
  return `${REPORT_GENERATOR_SYSTEM_PROMPT}

## Input_Data
- $V_{old}$: ${JSON.stringify(input.vOld)}
- $V_{new}$: ${JSON.stringify(input.vNew)}
- 일관성 점수 C: ${input.consistencyScore.toFixed(2)}
- 변화된 핵심 키워드: "${keywords}"
${input.narrativeModel ? `- 선택된 해석 모델: ${input.narrativeModel}` : ""}

위 데이터를 바탕으로 200~300자 내외의 심리 역동 분석 문단을 작성하세요.`;
}
