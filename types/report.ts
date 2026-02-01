/**
 * 통합 리포트 데이터 타입
 * MNPS, 마인드 아키텍터 M1/M2/M3 등 모든 분석 결과가 최종적으로 변환되는 형태
 */

export interface ChartData {
  label: string;
  value: number; // 0 ~ 100
}

export interface AdviceItem {
  title: string;
  todos: string[];
}

/** MNPS, 마인드 아키텍터 모두 이 형태로 변환됩니다. */
export interface UnifiedReportData {
  theme: "cyan" | "purple"; // cyan(MNPS), purple(마인드 아키텍터)
  moduleTitle: string; // 예: "성장 저해 요인 분석"
  coreTypeTitle: string; // 예: "완벽주의적 통제형"
  summary: string; // 한 줄 요약
  detailText: string; // 상세 설명
  totalScore: number; // 종합 점수 (0~100)

  chartData: ChartData[]; // 차트용 데이터
  advice?: AdviceItem; // (선택) 조언/솔루션
}
