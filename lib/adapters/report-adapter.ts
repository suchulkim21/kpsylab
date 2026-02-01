/**
 * 리포트 어댑터
 * 각 모듈(M1, M2, MNPS)의 원시 결과를 UnifiedReportData로 변환
 */

import type { UnifiedReportData } from "@/types/report";
import { MODULE1_TEMPLATES, MNPS_TEMPLATES } from "@/lib/constants/report-templates";
import { getGrowthStrategy } from "@/app/growth-roadmap/lib/module1/analysisEngine";
import { calculateGapAnalysis } from "@/app/growth-roadmap/lib/analysis";
import { generateModule3Content } from "@/app/growth-roadmap/lib/content/module3";

// 1. 마인드 아키텍터 모듈 1 변환기
export function adaptModule1(data: {
  dominantType?: string;
  vector?: Record<string, string | number>;
}): UnifiedReportData {
  const typeKey = data.dominantType ?? "A";
  const template = MODULE1_TEMPLATES[typeKey] ?? {
    title: "알 수 없는 유형",
    desc: "",
  };
  const vector = data.vector ?? { A: 0, B: 0, C: 0, D: 0 };

  const strategy = getGrowthStrategy(typeKey);
  const actionPlan = strategy.actionPlan as
    | { title: string; desc: string }[]
    | undefined;
  const todos = actionPlan?.map((a) => `${a.title}: ${a.desc}`) ?? [];

  return {
    theme: "purple",
    moduleTitle: "성장 저해 요인 (마인드 아키텍터 M1)",
    coreTypeTitle: template.title,
    totalScore: Math.round(
      (Number(vector[typeKey as keyof typeof vector] ?? 0) * 100)
    ),
    summary: "당신의 성장을 가로막는 가장 큰 심리적 장벽입니다.",
    detailText: template.desc,
    chartData: Object.entries(vector).map(([key, val]) => ({
      label: `유형 ${key}`,
      value: Math.round(Number(val) * 100),
    })),
    advice: todos.length > 0 ? { title: "실천 과제", todos } : undefined,
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

  return {
    theme: "cyan",
    moduleTitle: "MNPS (다크 테트라드 분석)",
    coreTypeTitle: template.title,
    totalScore: Math.round(data.dTotal ?? 0),
    summary: "내면의 어두운 본성 프로파일링 결과",
    detailText: template.desc,
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

  return {
    theme: "purple",
    moduleTitle: "사회적 아키타입 분석 (모듈 2)",
    coreTypeTitle: data.title ?? "알 수 없는 사회적 유형",
    totalScore: Math.round(metrics.input ?? 0),
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

  return {
    theme: "purple",
    moduleTitle: "이상향 vs 잠재력 재구성 (모듈 3)",
    coreTypeTitle: `${strategy} 전략`,
    totalScore: analysis.alignmentScore,
    summary: `벡터 격차 ${Math.round(analysis.totalGap)}점 / Alignment ${analysis.alignmentScore}%`,
    detailText,
    chartData,
    advice: {
      title: "전략적 제언",
      todos: adviceTodos,
    },
  };
}
