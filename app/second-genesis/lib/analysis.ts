// src/lib/analysis.ts

export type AnalysisVector = {
    stability: number; // 안정성
    growth: number;    // 성장성
    relation: number;  // 관계성
    autonomy: number;  // 자율성
};

export type StrategyType = 'Alignment' | 'Expansion' | 'Correction' | 'Pivot';

// GapDetail provides additional insight for UI
export type GapDetail = {
    gapScore: number; // total gap (0-400)
    causeExplanation: string; // human readable explanation of dominant gap
};

export type GapAnalysisResult = {
    ideal: AnalysisVector;
    potential: AnalysisVector;
    gapScores: AnalysisVector;
    totalGap: number;
    alignmentScore: number; // 0-100%
    strategy: StrategyType;
    dimensions: {
        dominantGap: string; // 가장 차이가 큰 영역
        strongestPotential: string; // 잠재력이 가장 높은 영역
    };
    // New fields for content enhancement
    gapScore: number;
    causeExplanation: string;
};

export function calculateGapAnalysis(ideal: AnalysisVector, potential: AnalysisVector): GapAnalysisResult {
    // 1. Calculate Gaps per dimension
    const gapScores: AnalysisVector = {
        stability: Math.abs(ideal.stability - potential.stability),
        growth: Math.abs(ideal.growth - potential.growth),
        relation: Math.abs(ideal.relation - potential.relation),
        autonomy: Math.abs(ideal.autonomy - potential.autonomy)
    };

    // 2. Total Gap (sum of absolute differences)
    const totalGap = Object.values(gapScores).reduce((a, b) => a + b, 0);

    // 3. Alignment Score (inverse of total gap)
    const maxGap = 400; // max possible sum (4 dimensions * 100)
    const alignmentScore = Math.max(0, Math.round(((maxGap - totalGap) / maxGap) * 100));

    // 4. Determine Strategy
    let strategy: StrategyType = 'Alignment';
    if (alignmentScore >= 80) {
        strategy = 'Alignment'; // 일치: 가속화
    } else if (alignmentScore >= 60) {
        strategy = 'Expansion'; // 확장: 잠재력 강화
    } else if (alignmentScore >= 40) {
        strategy = 'Correction'; // 보정: 방향 수정
    } else {
        strategy = 'Pivot'; // 전환: 전면 재검토
    }

    // 5. Identify Key Dimensions
    const getMaxKey = (obj: AnalysisVector) =>
        Object.entries(obj).reduce((a, b) => (a[1] > b[1] ? a : b))[0];

    const dominantGap = getMaxKey(gapScores);
    const strongestPotential = getMaxKey(potential);

    // 6. Create human readable cause explanation based on dominant gap
    const causeMap: Record<string, string> = {
        stability: '안정성 차이가 가장 큽니다. 현재 상황이 목표와 얼마나 일치하는지 검토가 필요합니다.',
        growth: '성장성 차이가 가장 큽니다. 잠재력을 더욱 발휘할 방안을 모색해야 합니다.',
        relation: '관계성 차이가 가장 큽니다. 대인 관계와 협업 측면에서 조정이 필요합니다.',
        autonomy: '자율성 차이가 가장 큽니다. 스스로 결정하고 행동하는 능력을 강화해야 합니다.'
    };
    const causeExplanation = causeMap[dominantGap] || '';

    // 7. Return enriched result
    return {
        ideal,
        potential,
        gapScores,
        totalGap,
        alignmentScore,
        strategy,
        dimensions: {
            dominantGap,
            strongestPotential
        },
        gapScore: totalGap,
        causeExplanation
    };
}
