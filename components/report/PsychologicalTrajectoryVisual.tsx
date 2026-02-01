"use client";

import type { VisualInsightOutput } from "@/lib/services/visualInsightEngine";

interface PsychologicalTrajectoryVisualProps {
  data: VisualInsightOutput;
  /** true면 SVG, false면 ASCII 폴백 */
  preferSvg?: boolean;
  className?: string;
}

/**
 * 심리 궤적 시각화 컴포넌트
 * - SVG: dangerouslySetInnerHTML로 직접 주입 (이전=점선, 현재=실선)
 * - ASCII: 폰트 모노스페이스 텍스트
 */
export default function PsychologicalTrajectoryVisual({
  data,
  preferSvg = true,
  className = "",
}: PsychologicalTrajectoryVisualProps) {
  const { visualMarker, changeAnalysis, neuroscienceNarrative, integrativeAdvice } = data;

  return (
    <div className={`rounded-xl border border-gray-800 bg-gray-900/50 p-6 ${className}`}>
      {/* 시각적 지표 */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-400 mb-3 flex items-center">
          <span className="w-1 h-4 bg-emerald-500 rounded-full mr-2" />
          심리의 궤적
        </h4>
        {preferSvg && visualMarker.svg ? (
          <div
            className="inline-block"
            dangerouslySetInnerHTML={{ __html: visualMarker.svg }}
          />
        ) : (
          <pre className="text-xs font-mono text-gray-400 whitespace-pre-wrap bg-black/30 p-4 rounded-lg overflow-x-auto">
            {visualMarker.ascii}
          </pre>
        )}
      </div>

      {/* 변화 분석 */}
      <div className="mb-4">
        <p className="text-sm text-gray-300 leading-relaxed">
          {changeAnalysis.trajectorySummary}
        </p>
        <p className="mt-1 text-xs text-emerald-400/80 font-medium">
          패턴: {changeAnalysis.patternLabel}
        </p>
      </div>

      {/* 뇌과학적 해석 */}
      <div className="mb-4 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
        <p className="text-sm text-emerald-100/90 leading-relaxed">
          {neuroscienceNarrative}
        </p>
      </div>

      {/* 통합적 제언 */}
      <p className="text-xs text-gray-400 italic">
        {integrativeAdvice}
      </p>
    </div>
  );
}
