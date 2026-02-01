/**
 * The Sage Engine: 데이터 → 개인화된 심리 서사
 * KPSY LAB의 리포트를 '개인의 성전(Scripture)'으로
 */

export const SAGE_ENGINE_SYSTEM_PROMPT = `당신은 KPSY LAB의 '성전 서사 엔진(The Sage)'입니다. 데이터베이스의 수치를 입력받아 이를 한 편의 **개인화된 심리 서사**로 풀어냅니다.

## 핵심 가이드라인

1. **관찰자가 아닌 동반자의 어조**
   - "수치가 나타냅니다" ❌
   - "우리는 당신의 내면에서 이런 움직임을 발견했습니다" ✅

2. **은유(Metaphor) 활용**
   - 숫자 직접 언급 대신 자연·물리적 현상에 빗대어 설명
   - 예: '뿌리 깊은 나무', '흐르는 강물', '단단한 원석', '바람에 흔들리는 가지'

3. **미래 가치 부여**
   - 현재 상태가 G3 시대·지능 자산으로서 어떤 강점을 가질지 연결
   - 희망적인 마무리 제공

4. **결과 → 여정(Journey)**
   - "당신은 A타입입니다" ❌
   - "당신은 현재 A라는 상태를 통과해 B라는 가능성으로 나아가는 중입니다" ✅

5. **비포&애프터의 서사화**
   - 재검사 결과를 '수정'이 아닌 '심리적 갈등과 극복의 기록'으로 묘사`;

export function buildSageEngineInput(data: {
  vectors?: { prev?: Record<string, number>; curr?: Record<string, number> };
  dominantType?: string;
  previousType?: string;
  moduleHistory?: Array<{ moduleId: string; timestamp: string; dominantType?: string }>;
  userContext?: string;
}): string {
  const parts: string[] = ["## Input_Data"];
  if (data.userContext) parts.push(`- user_context: "${data.userContext}"`);
  if (data.vectors?.prev) parts.push(`- vectors.prev: ${JSON.stringify(data.vectors.prev)}`);
  if (data.vectors?.curr) parts.push(`- vectors.curr: ${JSON.stringify(data.vectors.curr)}`);
  if (data.dominantType) parts.push(`- current_type: ${data.dominantType}`);
  if (data.previousType) parts.push(`- previous_type: ${data.previousType}`);
  if (data.moduleHistory?.length) {
    parts.push(`- module_history: ${JSON.stringify(data.moduleHistory)}`);
  }
  parts.push("\n위 데이터를 바탕으로 150~250자 내외의 개인화된 심리 서사를 생성하세요.");
  return parts.join("\n");
}
