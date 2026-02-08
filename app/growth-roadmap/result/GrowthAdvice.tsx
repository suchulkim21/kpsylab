import React from 'react';
import { GapAnalysisResult } from '@growth-roadmap/lib/analysis';
import { DIMENSION_TIPS, getDimName, getResultVariantIndex, getDimensionTip } from '@growth-roadmap/lib/content/resultContent';

interface GrowthAdviceProps {
    result: GapAnalysisResult;
}

const GrowthAdvice: React.FC<GrowthAdviceProps> = ({ result }) => {
    const gapDim = result.dimensions.dominantGap;
    const strongDim = result.dimensions.strongestPotential;
    const variantIndex = getResultVariantIndex(result);
    const gapTips = DIMENSION_TIPS[gapDim];
    const strongTips = DIMENSION_TIPS[strongDim];

    return (
        <div className="glass-panel p-6 rounded-xl overflow-y-auto max-h-[600px]">
            {/* 원인 요약 */}
            <section className="mb-6">
                <h3 className="text-lg font-bold mb-2">현재 읽힌 괴리</h3>
                <p className="text-gray-300">{result.causeExplanation}</p>
            </section>

            {/* 성장 방안: 괴리 최대 차원별 구체 조언 */}
            <section className="mb-6">
                <h3 className="text-lg font-bold mb-2">
                    성장 방안 — <strong>{getDimName(gapDim)}</strong> 영역
                </h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {gapTips?.improve.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            </section>

            {/* 피해야 할 행동: 해당 차원 기준 */}
            <section className="mb-6">
                <h3 className="text-lg font-bold mb-2">피해야 할 행동</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {gapTips?.avoid.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            </section>

            {/* 강점 활용: 잠재력 최대 차원 */}
            <section>
                <h3 className="text-lg font-bold mb-2">
                    강점 활용 — <strong>{getDimName(strongDim)}</strong> 영역
                </h3>
                <p className="text-gray-300">{getDimensionTip(strongDim, variantIndex, 'leverage') || strongTips?.leverage?.[0] || '해당 영역의 강점을 다른 차원 개선에 연결해 보십시오.'}</p>
            </section>
        </div>
    );
};

export default GrowthAdvice;
