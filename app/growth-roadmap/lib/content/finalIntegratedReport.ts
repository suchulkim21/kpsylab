/**
 * 최종 통합 리포트: 질의 1·2·3 종합 + 피검자 이상향 달성에 도움이 되는 조언
 */

import { generateModule3Content } from "./module3";
import { getModule2SystemSummary, determineTypeCode, TYPE_DISPLAY_NAMES } from "./module2";

const M1_TYPE_LABEL: Record<string, string> = {
  A: "성취 지향",
  B: "내면 결핍",
  C: "감정 회피",
  D: "현실 도피",
};

export interface M1Input {
  dominantType?: string;
  shadowData?: string[];
}

export interface M2Input {
  typeCode?: string;
  scores?: { proactivity?: number; adaptability?: number; socialDistance?: number };
  analysis?: { proactivity?: number; adaptability?: number; socialDistance?: number };
}

export interface M3Input {
  ideal: { stability: number; growth: number; relation: number; autonomy: number };
  potential: { stability: number; growth: number; relation: number; autonomy: number };
  strategy?: string;
  dominantGap?: string;
  strongestPotential?: string;
}

export interface IntegratedReportResult {
  summary: string;
  detailText: string;
  coreTypeTitle: string;
  adviceTodos: string[];
}

function normalizeM2Scores(m2: M2Input | null): { p: number; a: number; sd: number } {
  if (!m2) return { p: 50, a: 50, sd: 50 };
  const s = m2.scores ?? m2.analysis ?? {};
  const norm = (v: number) => Math.max(0, Math.min(100, Math.round(((Number(v) + 40) / 140) * 100)));
  return {
    p: norm(s.proactivity ?? 50),
    a: norm(s.adaptability ?? 50),
    sd: norm(s.socialDistance ?? 50),
  };
}

function getM2TypeCode(m2: M2Input | null): string {
  if (m2?.typeCode) return m2.typeCode;
  const scores = normalizeM2Scores(m2);
  return determineTypeCode(scores);
}

/** 질의 1·2·3을 종합하고, 이상향 달성에 초점을 맞춘 최종 리포트 본문 생성 */
export function generateIntegratedReportContent(
  m1: M1Input | null,
  m2: M2Input | null,
  m3: M3Input
): IntegratedReportResult {
  const m1Type = (m1?.dominantType ?? "A").toUpperCase();
  const m1Label = M1_TYPE_LABEL[m1Type] ?? "무의식 방해 요인";
  const m2Code = getM2TypeCode(m2);
  const m2Name =
    TYPE_DISPLAY_NAMES[m2Code as keyof typeof TYPE_DISPLAY_NAMES] ?? "대인 행동 유형";
  const m2Summary = getModule2SystemSummary(m2Code);

  const m3Content = generateModule3Content({
    ideal: m3.ideal,
    potential: m3.potential,
    strategy: m3.strategy ?? "Alignment",
    dominantGap: m3.dominantGap ?? "growth",
    strongestPotential: m3.strongestPotential,
  });

  const section1 = `**[1단계 종합] 무의식 병목**
질의 1에서 감지된 방해 요인은 **${m1Label}** 축에 가깝게 읽혔습니다. 이상향을 이루려면 이 패턴이 언제 에너지를 빼앗는지 인식하는 것이 첫 걸음입니다.

이 단계는 “지금 나를 막는 습관”을 찾는 과정입니다. 무의식 병목은 성과와 관계, 감정 처리 방식에 반복적으로 영향을 주며, 결국 실행을 늦추거나 과도한 소모를 유발합니다. 따라서 이 요인을 인식하는 순간, 이후 단계의 해석이 명확해집니다.

여기서의 핵심은 정답이 아니라 **패턴 인식**입니다. 같은 상황에서 반복되는 반응을 기록하면, 다음 단계의 전략 설계가 더 쉬워집니다.`;

  const section2 = `**[2단계 종합] 대인·행동 패턴**
질의 2 결과, 당신의 사회적 아키텍처는 **${m2Name}**으로 요약됩니다. ${m2Summary}

이 영역은 ‘입력-처리-출력’이라는 흐름으로 구성되며, 정보 수용 방식과 행동 개시 타이밍이 가장 뚜렷하게 드러납니다. 같은 환경에서도 어떤 사람은 바로 실행하고, 어떤 사람은 안전을 확보한 뒤 움직입니다. 당신의 패턴은 이 구조로 설명됩니다.

이상향에 다가가기 위해 이 강점을 활용하고, 약점은 보완할 수 있습니다. 강점은 확장 레버로, 약점은 방해 요인으로 작동하므로, 두 축을 함께 관리해야 합니다.`;

  const section3 = `**[3단계 종합] 질의 3 분석 결과 — 이상향과 잠재력**

아래는 질의 3(이상향·잠재력) 문항 분석을 반영한 내용입니다. 이 단계는 **이상향의 좌표**와 **현재 잠재력의 벡터**를 분리해 읽고, 그 사이의 방해 요인을 줄이는 데 초점을 둡니다.

이상향은 방향이고, 잠재력은 엔진입니다. 방향이 선명하고 엔진이 안정적으로 작동할 때 성취가 발생합니다. 아래 내용은 이상향 기준으로 판단을 정렬하기 위한 로드맵입니다.

${m3Content}`;

  const section4 = `**[이상향 달성을 위한 종합 조언]**
- **질의 1**: ${m1Label} 패턴이 올라올 때, "지금 내가 피하는 것은 무엇인가?"를 한 번 묻고, 이상향에 도움이 되는 작은 행동 하나만 선택해 보십시오.
- **질의 2**: ${m2Name}의 강점(입력·처리·출력 중 높은 축)을 이상향을 위한 협업·실행·관계에 의도적으로 쓰고, 약한 축은 한 달에 한 가지 습관만 추가해 보십시오.
- **질의 3**: 이상향과의 격차가 큰 영역부터 "한 달 안에 할 수 있는 한 가지"만 정해 실행하십시오. 잠재력이 높은 영역은 그대로 활용하면 됩니다.

이 조언은 각각 독립적인 조각이 아니라, 하나의 시스템으로 연결됩니다. 무의식 병목을 줄이면 대인 행동의 마찰이 낮아지고, 그 결과 이상향에 더 빨리 정렬됩니다.

본 리포트는 당신을 규정하지 않습니다. 이상향에 더 가까이 가기 위한 **한 장의 지도**로 활용하십시오.`;

  const section5 = `**[통합 설계] 3축 정렬을 위한 시스템 재구성**
이상향을 기준으로 보면, **무의식 병목(질의 1)**은 '방해', **대인 패턴(질의 2)**은 '흐름', **이상향-잠재력(질의 3)**은 '방향'입니다. 방해를 줄이고 흐름을 정렬하며 방향을 고정할 때, 잠재력은 실행력으로 전환됩니다.

정렬의 우선순위는 간단합니다. (1) 방해를 가장 많이 일으키는 패턴 하나를 인식하고, (2) 대인 패턴에서 마찰을 줄이는 행동 하나를 정하고, (3) 이상향에 맞는 행동 하나를 고정하십시오. 이 순서가 바뀌면 에너지 누수가 커집니다.`;

  const section6 = `**[실행 프로토콜] 90일 구조화**
**1~30일**: 방해 요인 제거 기간. ${m1Label} 패턴이 발생하는 순간을 기록하고, 즉시 작은 행동 1개로 전환하십시오.
**31~60일**: 흐름 정렬 기간. ${m2Name} 강점을 이용해 협업·실행 루틴을 고정하고, 약한 축은 한 가지 습관으로만 보완하십시오.
**61~90일**: 방향 고정 기간. 이상향과의 격차가 큰 영역에서 "한 달 안에 할 수 있는 한 가지"를 반복하십시오.

90일 후에는 구조가 바뀌어 있습니다. 이 시점부터는 이상향을 기준으로 목표 난이도를 한 단계 올리는 것이 다음 설계의 핵심입니다.`;

  const detailText = [section1, section2, section3, section4, section5, section6].join("\n\n---\n\n");

  const idealEntries = Object.entries(m3.ideal).sort(([, a], [, b]) => b - a);
  const topDim = idealEntries[0]?.[0];
  const dimLabel = { stability: "안정성", growth: "성장성", relation: "관계성", autonomy: "자율성" }[topDim ?? "growth"] ?? "이상향";

  const summary = `질의 1·2·3을 종합한 결과입니다. 무의식 병목(${m1Label}), 대인 패턴(${m2Name}), 이상향·잠재력 격차를 한꺼번에 살펴, **${dimLabel}**을 중시하는 당신의 이상향 달성에 도움이 되도록 조언을 정리했습니다. 이 리포트는 간섭·흐름·방향을 정렬하는 구조를 제시합니다.`;

  const adviceTodos = [
    `[1단계] ${m1Label} 패턴 인식 시, 이상향에 도움이 되는 작은 행동 하나 선택하기`,
    `[2단계] ${m2Name} 강점을 이상향을 위한 협업·실행에 활용하기`,
    `[3단계] 격차가 큰 영역에서 "한 달 안에 할 한 가지" 실행하기`,
  ];

  return {
    summary,
    detailText,
    coreTypeTitle: `종합 · 이상향 중심 (${m1Label} / ${m2Name})`,
    adviceTodos,
  };
}
