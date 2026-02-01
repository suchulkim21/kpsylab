/**
 * 리포트 어댑터
 * 각 모듈(M1, M2, MNPS)의 원시 결과를 UnifiedReportData로 변환
 * + Dependency-Based: masterVector 참조 시 동적 뉘앙스 적용
 */

import type { UnifiedReportData } from "@/types/report";
import type { MasterVector } from "@/lib/store/masterVector";
import { MODULE1_TEMPLATES, MNPS_TEMPLATES } from "@/lib/constants/report-templates";
import { getGrowthStrategy } from "@/app/growth-roadmap/lib/module1/analysisEngine";
import { calculateGapAnalysis } from "@/app/growth-roadmap/lib/analysis";
import { generateModule3Content } from "@/app/growth-roadmap/lib/content/module3";
import { getConflictInsight } from "@/lib/services/conflictInsight";
import { generatePsychologicalMapLog } from "@/lib/services/psychologicalMap";

export interface AdaptModule1Context {
  masterVector?: MasterVector;
  m2Data?: { typeCode: string; scores: { p: number; a: number; sd: number } };
  consistencyScore?: number;
  anomaly?: boolean;
  dynamicsNarrative?: string;
  /** 나만의 심리 지도용 */
  m1?: { dominantType: string; timestamp: string; isRetest?: boolean; previousType?: string };
  m2?: { typeCode?: string; timestamp: string };
  m3?: { timestamp: string };
  moduleHistory?: Array<{ moduleId: string; timestamp: string; dominantType?: string }>;
}

// 1. 마인드 아키텍터 모듈 1 변환기 (Context-Aware: masterVector로 뉘앙스 보정)
export function adaptModule1(
  data: {
    dominantType?: string;
    vector?: Record<string, number | string>;
    shadowData?: string[];
  },
  context?: AdaptModule1Context
): UnifiedReportData {
  const vector: Record<string, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    ...Object.entries(data.vector ?? {}).reduce((acc, [key, value]) => {
      acc[key as "A" | "B" | "C" | "D"] = Number(value) || 0;
      return acc;
    }, {} as Record<string, number>),
  };
  const sorted = Object.entries(vector).sort(([, a], [, b]) => b - a);
  const [dominant, subDominant] = sorted;
  const typeKey = (data.dominantType ?? dominant[0]) as "A" | "B" | "C" | "D";
  const template = MODULE1_TEMPLATES[typeKey];

  const shadow = data.shadowData ?? [];
  const shadowHints: string[] = [];
  if (shadow.includes("Q03_A") && shadow.includes("Q05_A")) {
    shadowHints.push(
      "업무 초반에 과도한 계획과 검토로 시작이 지연되는 패턴이 관찰됩니다."
    );
  }
  if (shadow.some((id) => id.includes("_D")) && vector.D >= 0.2) {
    shadowHints.push("자율적인 결정을 내릴 때 감정적 반응이 급변하는 경향이 있습니다.");
  }

  let detailBlocks = [
    template.desc,
    shadowHints.length ? `\n\n행동 패턴: ${shadowHints.join(" ")}` : "",
  ]
    .filter(Boolean)
    .join("");

  const mv = context?.masterVector;
  if (mv && mv.deliberation > 0.8) {
    detailBlocks +=
      "\n\n당신의 높은 신중함(deliberation) 성향이 이러한 패턴을 보완할 잠재력을 가지고 있습니다. 결론을 내리기 전 충분히 검토하는 습관을 유지하세요.";
  }

  const score = Math.round(vector[typeKey] * 100);
  const percentile = Math.max(1, 100 - score);
  const rarityBadge = `상위 ${percentile}% ${template.title} 성향`;

  const conflictInsight =
    context && (context.m2Data || context.anomaly)
      ? getConflictInsight({
          m1Type: typeKey,
          m2TypeCode: context.m2Data?.typeCode ?? "",
          m2Scores: context.m2Data?.scores,
          consistencyScore: context.consistencyScore,
          anomaly: context.anomaly,
          dynamicsNarrative: context.dynamicsNarrative,
        })
      : undefined;

  const NEXT_POSSIBILITY: Record<string, string> = {
    A: "완성보다 충분함을 아는 여유",
    B: "자기 확신 기반의 경계",
    C: "감정 수용과 함께하는 실행력",
    D: "의도적 멈춤과 깊은 성찰",
  };
  const journeySummary = `당신은 현재 ${template.title.split(" ")[0]}이라는 상태를 통과해 ${NEXT_POSSIBILITY[typeKey]}라는 가능성으로 나아가는 중입니다.`;

  const scriptureLog =
    context?.m1 && context.m1.timestamp
      ? generatePsychologicalMapLog({
          m1: context.m1,
          m2: context.m2,
          m3: context.m3,
          moduleHistory: context.moduleHistory,
        })
      : undefined;

  return {
    theme: "purple",
    moduleTitle: "성장 저해 요인 (마인드 아키텍터 M1)",
    coreTypeTitle: template.title,
    totalScore: score,
    summary: `${template.title} + ${subDominant ? `보조 ${subDominant[0]}` : "단일 성향"}`,
    journeySummary,
    scriptureLog,
    rarityBadge,
    detailText: detailBlocks,
    chartData: Object.entries(vector).map(([key, val]) => ({
      label: `유형 ${key}`,
      value: Math.round(val * 100),
    })),
    advice: {
      title: "실천 솔루션",
      todos: template.actionPlan,
    },
    conflictInsight,
  };
}

// 2. MNPS 변환기
export function adaptMNPS(data: {
  archetype?: string;
  dTotal?: number;
  traitScores?: {
    machiavellianism?: number;
    narcissism?: number;
    psychopathy?: number;
    sadism?: number;
  };
}): UnifiedReportData {
  const typeKey = data.archetype ?? "ALL_LOW";
  const template = MNPS_TEMPLATES[typeKey] ?? {
    title: typeKey,
    desc: "분석된 유형입니다.",
  };
  const traits = data.traitScores ?? {};

  const dTotal = Math.round(data.dTotal ?? 0);
  const percentile = Math.max(1, 100 - dTotal);
  const rarityBadge =
    percentile <= 10
      ? `100명 중 ${percentile}명만 나오는 희귀 유형`
      : `상위 ${percentile}% ${template.title} 유형`;

  return {
    theme: "cyan",
    moduleTitle: "MNPS (다크 테트라드 분석)",
    coreTypeTitle: template.title,
    totalScore: dTotal,
    summary: "내면의 어두운 본성 프로파일링 결과",
    detailText: template.desc,
    rarityBadge,
    chartData: [
      { label: "마키아벨리즘", value: Math.round(traits.machiavellianism ?? 0) },
      { label: "나르시시즘", value: Math.round(traits.narcissism ?? 0) },
      { label: "사이코패시", value: Math.round(traits.psychopathy ?? 0) },
      { label: "가학성", value: Math.round(traits.sadism ?? 0) },
    ],
  };
}

// 3. 모듈 2 변환기 (이미 텍스트가 있는 경우)
type Module2Input = {
  title?: string;
  description?: string;
  summary?: string;
  metrics?: { input?: number; processing?: number; output?: number };
  chartData?: { label: string; value: number }[];
  advice?: { title?: string; todos?: string[] };
};

export function adaptModule2(data: Module2Input): UnifiedReportData {
  const metrics = data.metrics ?? { input: 0, processing: 0, output: 0 };
  const chartData =
    data.chartData ??
    [
      { label: "입력", value: Math.round(metrics.input ?? 0) },
      { label: "처리", value: Math.round(metrics.processing ?? 0) },
      { label: "출력", value: Math.round(metrics.output ?? 0) },
    ];
  const advice = data.advice?.todos?.length
    ? {
        title: data.advice.title ?? "성장 조언",
        todos: data.advice.todos,
      }
    : undefined;

  const inputScore = Math.round(metrics.input ?? 0);
  const percentile = Math.max(1, 100 - inputScore);

  return {
    theme: "purple",
    moduleTitle: "사회적 아키타입 분석 (모듈 2)",
    coreTypeTitle: data.title ?? "알 수 없는 사회적 유형",
    totalScore: inputScore,
    rarityBadge: `상위 ${percentile}% ${data.title ?? "사회적"} 유형`,
    summary: data.summary ?? `${data.title ?? "사회적 유형"}의 입력 처리 역량`,
    detailText: data.description ?? "",
    chartData,
    advice,
  };
}

type Module3Input = {
  ideal?: { stability: number; growth: number; relation: number; autonomy: number };
  potential?: { stability: number; growth: number; relation: number; autonomy: number };
  strategy?: string;
  dominantGap?: string;
};

const GAP_DIMENSIONS: Record<string, string> = {
  stability: "안정성",
  growth: "성장성",
  relation: "관계성",
  autonomy: "자율성",
};

export function adaptModule3(data: Module3Input): UnifiedReportData {
  const ideal = data.ideal ?? { stability: 0, growth: 0, relation: 0, autonomy: 0 };
  const potential =
    data.potential ?? { stability: 0, growth: 0, relation: 0, autonomy: 0 };
  const analysis = calculateGapAnalysis(ideal, potential);
  const strategy = data.strategy ?? analysis.strategy;
  const dominantGap = data.dominantGap ?? analysis.dimensions.dominantGap;
  const detailText = generateModule3Content({
    ideal,
    potential,
    strategy,
    dominantGap,
  });
  const chartData = [
    { label: "안정성", value: Math.round((ideal.stability + potential.stability) / 2) },
    { label: "성장성", value: Math.round((ideal.growth + potential.growth) / 2) },
    { label: "관계성", value: Math.round((ideal.relation + potential.relation) / 2) },
    { label: "자율성", value: Math.round((ideal.autonomy + potential.autonomy) / 2) },
  ];
  const adviceTodos = [
    `Alignment 점수 ${analysis.alignmentScore}% – ${analysis.causeExplanation || "내면 벡터 간 불일치 집중 확인"}`,
    `집중 조정 차원: ${GAP_DIMENSIONS[dominantGap] ?? dominantGap}`,
    `전략 제언: ${strategy}`,
  ];

  const alignScore = analysis.alignmentScore;
  const percentile = Math.max(1, 100 - alignScore);

  return {
    theme: "purple",
    moduleTitle: "이상향 vs 잠재력 재구성 (모듈 3)",
    coreTypeTitle: `${strategy} 전략`,
    totalScore: alignScore,
    rarityBadge: `상위 ${percentile}% 벡터 정렬 유형`,
    summary: `벡터 격차 ${Math.round(analysis.totalGap)}점 / Alignment ${analysis.alignmentScore}%`,
    detailText,
    chartData,
    advice: {
      title: "전략적 제언",
      todos: adviceTodos,
    },
  };
}
