import { ScenarioOption } from "@growth-roadmap/types/module2";

/**
 * 답변 일관성 검증 및 신뢰도 계산
 */

export interface ConsistencyResult {
    reliabilityScore: number; // 0-100 신뢰도 점수
    consistencyLevel: 'high' | 'medium' | 'low'; // 일관성 수준
    issues: string[]; // 발견된 일관성 문제
    recommendation: string; // 권장 사항
}

/**
 * 답변 일관성을 검증하고 신뢰도 점수를 계산합니다.
 */
export function checkAnswerConsistency(
    selections: ScenarioOption[],
    phaseSelections: { phase1: ScenarioOption[]; phase2: ScenarioOption[]; phase3: ScenarioOption[] }
): ConsistencyResult {
    const issues: string[] = [];
    let reliabilityScore = 100;

    // 1. 점수 분포 균등성 검증 (랜덤 선택 감지)
    const totalScores = {
        proactivity: 0,
        adaptability: 0,
        socialDistance: 0
    };

    selections.forEach(opt => {
        if (opt.weight.proactivity) totalScores.proactivity += opt.weight.proactivity;
        if (opt.weight.adaptability) totalScores.adaptability += opt.weight.adaptability;
        if (opt.weight.socialDistance) totalScores.socialDistance += opt.weight.socialDistance;
    });

    const total = totalScores.proactivity + totalScores.adaptability + totalScores.socialDistance;
    
    if (total > 0) {
        const pPercent = (totalScores.proactivity / total) * 100;
        const aPercent = (totalScores.adaptability / total) * 100;
        const sdPercent = (totalScores.socialDistance / total) * 100;

        // 세 변수가 모두 30-40% 범위에 있으면 랜덤 선택 가능성
        const isBalanced = 
            pPercent >= 25 && pPercent <= 45 &&
            aPercent >= 25 && aPercent <= 45 &&
            sdPercent >= 25 && sdPercent <= 45;

        if (isBalanced) {
            reliabilityScore -= 20;
            issues.push("답변 패턴이 비정상적으로 균등합니다. 일부 답변이 무작위로 선택되었을 가능성이 있습니다.");
        }
    }

    // 2. Phase 간 일관성 검증
    const phase1Dominant = getDominantTrait(phaseSelections.phase1);
    const phase2Dominant = getDominantTrait(phaseSelections.phase2);
    const phase3Dominant = getDominantTrait(phaseSelections.phase3);

    // Phase 1과 2는 유사한 패턴을 보여야 함 (자극 제어와 심리적 저항은 연관됨)
    if (phase1Dominant && phase2Dominant && phase1Dominant !== phase2Dominant) {
        const phase1Score = getTraitScore(phaseSelections.phase1, phase1Dominant);
        const phase2Score = getTraitScore(phaseSelections.phase2, phase2Dominant);
        
        // 점수 차이가 너무 크면 일관성 문제
        if (Math.abs(phase1Score - phase2Score) > 30) {
            reliabilityScore -= 15;
            issues.push("Phase 1과 Phase 2 간 답변 패턴이 크게 다릅니다.");
        }
    }

    // 3. 반복 패턴 검증 (같은 유형의 선택이 너무 많거나 적으면 이상)
    const selectionTypes = selections.map(opt => opt.type);
    const typeCounts: Record<string, number> = {};
    selectionTypes.forEach(type => {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const totalSelections = selections.length;
    const expectedCount = totalSelections / 3; // 각 타입당 약 1/3

    Object.entries(typeCounts).forEach(([type, count]) => {
        const deviation = Math.abs(count - expectedCount) / expectedCount;
        if (deviation > 0.5) { // 50% 이상 편차
            reliabilityScore -= 10;
            issues.push(`${type} 유형의 선택이 비정상적으로 많거나 적습니다.`);
        }
    });

    // 4. 점수 범위 검증 (너무 극단적인 값은 의심)
    if (total > 0) {
        const maxScore = Math.max(totalScores.proactivity, totalScores.adaptability, totalScores.socialDistance);
        const minScore = Math.min(totalScores.proactivity, totalScores.adaptability, totalScores.socialDistance);
        
        // 최대값과 최소값의 차이가 너무 작으면 (랜덤), 너무 크면 (극단적) 문제
        const range = maxScore - minScore;
        const rangePercent = (range / total) * 100;
        
        if (rangePercent < 10) {
            reliabilityScore -= 25;
            issues.push("답변 점수가 비정상적으로 균등합니다. 무작위 선택 가능성이 높습니다.");
        } else if (rangePercent > 80) {
            reliabilityScore -= 10;
            issues.push("답변 점수가 비정상적으로 극단적입니다.");
        }
    }

    // 신뢰도 점수 범위 조정 (0-100)
    reliabilityScore = Math.max(0, Math.min(100, reliabilityScore));

    // 일관성 수준 결정
    let consistencyLevel: 'high' | 'medium' | 'low';
    let recommendation: string;

    if (reliabilityScore >= 75) {
        consistencyLevel = 'high';
        recommendation = "답변이 매우 일관적입니다. 분석 결과의 신뢰도가 높습니다.";
    } else if (reliabilityScore >= 50) {
        consistencyLevel = 'medium';
        recommendation = "일부 답변이 일관적이지 않을 수 있습니다. 더 정확한 분석을 위해 추가 질문에 답변하시겠습니까?";
    } else {
        consistencyLevel = 'low';
        recommendation = "답변의 일관성이 낮습니다. 분석 정확도를 높이기 위해 추가 질문에 답변하는 것을 권장합니다.";
    }

    return {
        reliabilityScore: Math.round(reliabilityScore),
        consistencyLevel,
        issues,
        recommendation
    };
}

/**
 * 선택에서 지배적인 특성을 찾습니다.
 */
function getDominantTrait(selections: ScenarioOption[]): 'proactivity' | 'adaptability' | 'socialDistance' | null {
    if (selections.length === 0) return null;

    const scores = {
        proactivity: 0,
        adaptability: 0,
        socialDistance: 0
    };

    selections.forEach(opt => {
        if (opt.weight.proactivity) scores.proactivity += opt.weight.proactivity;
        if (opt.weight.adaptability) scores.adaptability += opt.weight.adaptability;
        if (opt.weight.socialDistance) scores.socialDistance += opt.weight.socialDistance;
    });

    const maxScore = Math.max(scores.proactivity, scores.adaptability, scores.socialDistance);
    
    if (maxScore === scores.proactivity) return 'proactivity';
    if (maxScore === scores.adaptability) return 'adaptability';
    if (maxScore === scores.socialDistance) return 'socialDistance';
    
    return null;
}

/**
 * 특정 특성의 점수를 계산합니다.
 */
function getTraitScore(selections: ScenarioOption[], trait: 'proactivity' | 'adaptability' | 'socialDistance'): number {
    let score = 0;
    selections.forEach(opt => {
        if (opt.weight[trait]) score += opt.weight[trait];
    });
    return score;
}

/**
 * 분석 결과에 미치는 영향 설명 생성
 */
export function getImpactExplanation(reliabilityScore: number): string {
    if (reliabilityScore >= 80) {
        return "높은 신뢰도로 인해 분석 결과가 매우 정확합니다. 제시된 인사이트와 권장사항을 신뢰할 수 있습니다.";
    } else if (reliabilityScore >= 60) {
        return "보통 수준의 신뢰도입니다. 대부분의 분석 결과는 신뢰할 수 있으나, 일부 세부 사항은 실제와 다를 수 있습니다.";
    } else if (reliabilityScore >= 40) {
        return "낮은 신뢰도로 인해 분석 결과의 정확도가 제한적입니다. 전체적인 패턴은 참고할 수 있으나, 세부 해석은 주의가 필요합니다.";
    } else {
        return "매우 낮은 신뢰도입니다. 분석 결과가 실제 특성을 정확히 반영하지 못할 가능성이 높습니다. 추가 질문에 답변하여 정확도를 높이는 것을 강력히 권장합니다.";
    }
}

