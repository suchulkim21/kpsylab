import { ScenarioOption, AnalysisVariables } from "@/types/module2";

export function calculateAnalysis(selectedOptions: ScenarioOption[]): AnalysisVariables {
    const result: AnalysisVariables = {
        proactivity: 0,
        adaptability: 0,
        socialDistance: 0,
    };

    if (selectedOptions.length === 0) {
        return result;
    }

    selectedOptions.forEach((option) => {
        // Module 2 uses 'weight' for these variables
        if (option.weight.proactivity) result.proactivity += option.weight.proactivity;
        if (option.weight.adaptability) result.adaptability += option.weight.adaptability;
        if (option.weight.socialDistance) result.socialDistance += option.weight.socialDistance;
    });

    return result;
}

export function calculateIntermediateResult(phase: number, options: ScenarioOption[]) {
    // Calculate dominant trait for this specific batch
    let proactivity = 0;
    let adaptability = 0;
    let socialDistance = 0;

    options.forEach(opt => {
        if (opt.weight.proactivity) proactivity += opt.weight.proactivity;
        if (opt.weight.adaptability) adaptability += opt.weight.adaptability;
        if (opt.weight.socialDistance) socialDistance += opt.weight.socialDistance;
    });

    const maxScore = Math.max(proactivity, adaptability, socialDistance);

    let trait = "";
    let description = "";

    // Phase 3 Special Logic: Social Archetype (Phase 3 corresponds to the 3rd batch, index 2 usually)
    // But let's assume 'phase' argument matches the visual phase: 1, 2, 3.
    // Based on SCENARIOS, Theme 3 is Social Archetype.

    if (phase === 3) {
        // Simple threshold logic or comparison
        const isHighP = proactivity > 0; // Using 0 as baseline for relative weights
        const isHighA = adaptability > 0;
        const isHighSD = socialDistance > 0;

        // This logic is approximate based on previous snippets, ensuring we cover the 4 combinations mentioned
        // Legacy snippet: "isHighP && isHighSD" -> Builder
        if (proactivity >= adaptability && socialDistance >= adaptability) {
            trait = "체제 구축가 (Builder)";
            description = "당신은 무질서한 상황에서 규칙을 만들고 타인을 이끄는 리더형입니다. 효율과 성과를 중시하며, 감정보다는 논리와 체계를 신뢰합니다.";
        } else if (proactivity >= socialDistance && adaptability >= socialDistance) {
            trait = "체제 혁신가 (Innovator)";
            description = "당신은 기존의 틀을 깨고 새로운 가치를 창출하는 혁신가형입니다. 변화를 두려워하지 않으며, 유연한 사고로 문제를 해결합니다.";
        } else if (adaptability >= proactivity && adaptability >= socialDistance) { // Assuming high adaptability, low SD
            trait = "체제 순응가 (Navigator)";
            description = "당신은 어떤 시스템에서도 빠르게 적응하고 실리를 챙기는 유연한 유형입니다. 관계를 중시하며 갈등을 피하고 조화를 추구합니다.";
        } else {
            trait = "체제 독립가 (Independent)";
            description = "당신은 조직의 논리보다 자신의 원칙을 중요시하는 독립적인 유형입니다. 타인에게 휘둘리지 않으며 자신만의 길을 묵묵히 걸어갑니다.";
        }
    } else {
        if (maxScore === proactivity) {
            trait = "주도적 개입";
            description = "당신은 상황을 관망하기보다 직접 통제하고 변화시키려 합니다. 위기 상황에서 리더십을 발휘하는 유형입니다.";
        } else if (maxScore === adaptability) {
            trait = "유연한 적응";
            description = "당신은 상황의 변화에 맞춰 자신을 빠르게 변화시킵니다. 고집을 부리기보다 흐름을 타는 것을 선호합니다.";
        } else {
            trait = "거리두기/관찰";
            description = "당신은 즉각적으로 반응하기보다 한 발 물러서서 상황을 분석합니다. 감정적 동요를 최소화하고 객관성을 유지합니다.";
        }
    }

    return {
        dominantTrait: trait,
        description: description,
        scores: { proactivity, adaptability, socialDistance }
    };
}
