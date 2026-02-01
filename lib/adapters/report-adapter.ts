/**
 * 리포트 어댑터
 * 각 모듈(M1, M2, MNPS)의 원시 결과를 UnifiedReportData로 변환
 */

import type { UnifiedReportData } from "@/types/report";
import { MODULE1_TEMPLATES, MNPS_TEMPLATES } from "@/lib/constants/report-templates";
import { getGrowthStrategy } from "@/app/growth-roadmap/lib/module1/analysisEngine";

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
export function adaptModule2(data: {
  title?: string;
  description?: string;
  metrics?: { input?: number; processing?: number; output?: number };
  labels?: { input?: string };
  advice?: { todos?: string[] };
}): UnifiedReportData {
  const metrics = data.metrics ?? { input: 0, processing: 0, output: 0 };
  const advice = data.advice;

  return {
    theme: "purple",
    moduleTitle: "사회적 아키타입 분석 (모듈 2)",
    coreTypeTitle: data.title ?? "알 수 없는 유형",
    totalScore: Math.round(metrics.input ?? 0),
    summary:
      (data.labels?.input ? `${data.labels.input} ` : "") +
      "수준의 입력 처리 능력",
    detailText: data.description ?? "",
    chartData: [
      { label: "입력", value: Math.round(metrics.input ?? 0) },
      { label: "처리", value: Math.round(metrics.processing ?? 0) },
      { label: "출력", value: Math.round(metrics.output ?? 0) },
    ],
    advice:
      advice?.todos && advice.todos.length > 0
        ? { title: "성장 조언", todos: advice.todos }
        : undefined,
  };
}
