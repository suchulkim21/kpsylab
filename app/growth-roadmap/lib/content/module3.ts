import { TextBlock, assembleParagraphs } from "./engine";

interface M3Data {
    ideal: { stability: number; growth: number; relation: number; autonomy: number };
    potential: { stability: number; growth: number; relation: number; autonomy: number };
    strategy: string; // Alignment, Expansion, Correction, Pivot
    dominantGap: string; // stability, growth, relation, autonomy
}

const STRATEGY_DEFINITIONS: Record<string, string> = {
    "Alignment": "일치 전략은 의식적 목표와 무의식적 잠재력이 동기화된 상태를 의미합니다. 내적 마찰 계수가 최소화된 고효율 구간이므로, 현재의 실행 속도를 가속화하는 '선형적 성장 모델'을 채택해야 합니다. 안주하려는 경향을 경계하고, 목표의 난이도를 상향 조정하여 몰입 상태를 유지하는 것이 핵심입니다.",
    "Expansion": "확장 전략은 잠재 역량 대비 의식적 목표 설정이 보수적으로 제한된 '과소 평가' 상태를 시사합니다. 무의식은 더 넓은 영역으로의 확장을 지향하고 있으나, 과거 실패 데이터나 인지적 제약으로 인해 '자기 효능감'이 억제되어 있습니다. 인지적 한계선을 재설정하고, 리스크 허용 범위를 단계적으로 확장해야 할 시점입니다.",
    "Correction": "보정 전략은 의식적 지향점과 잠재적 욕구 간의 벡터 오차가 감지되는 상태입니다. 이는 사회적 압력이나 타인의 기대가 내재화된 '외재적 동기'에 의해 목표가 설정되었을 가능성을 강하게 시사합니다. 현재 진행 중인 과업을 일시 중단하고, 동기 부여의 원천을 재검토하는 '원점 재조정'이 필요합니다.",
    "Pivot": "전환 전략은 현재의 삶의 궤적이 본질적 기질과 반대 방향으로 진행되고 있는 '구조적 불일치' 상태를 나타냅니다. 이는 만성적인 내적 갈등과 '가면 증후군'을 유발하는 고위험 단계입니다. 부분적인 수정으로는 해결이 불가능하며, 삶의 우선순위와 방향성을 전면적으로 재설계하는 '피봇팅' 결단이 요구됩니다."
};

const DIMENSION_ANALYSIS: Record<string, string> = {
    "stability": "안정성 차원의 불일치는 '정적 평형'과 '동적 변화' 욕구 사이의 충돌을 의미합니다. 이는 모호한 상황에 대한 인내력 저하 및 만성적 예기 불안의 원인이 됩니다.",
    "growth": "성장성 차원의 불일치는 자아 실현 욕구와 실제 실행 역량 간의 간극을 나타냅니다. 성장에 대한 강박이 오히려 실행을 마비시키는 '완벽주의적 지연' 현상을 점검해야 합니다.",
    "relation": "관계성 차원의 불일치는 친밀감 욕구와 자율성 욕구 사이의 '접근-회피 갈등'을 시사합니다. 애착 패턴의 불안정성이 관계의 질적 저하를 초래하고 있습니다.",
    "autonomy": "자율성 차원의 불일치는 통제 소재에 대한 갈등을 의미합니다. 자기 결정권에 대한 욕구와 환경적 제약 사이의 텐션이 지속적인 에너지 누수를 유발하고 있습니다."
};

const GAP_ADVICE: Record<string, string> = {
    "Alignment": "현재는 '최적화된 추진력 상태'입니다. 외부 저항이 최소화된 이 시기를 활용하여 최대의 지렛대 효과를 창출하십시오. 점진적 개선이 아닌 '비약적 도약'을 목표로 설정해야 합니다.",
    "Expansion": "귀하의 수용 역량은 현재 설정된 목표를 초과합니다. '안전 마진'을 과도하게 설정하는 습관을 폐기하고, 실패 확률이 존재하는 '도전적 과제'를 의도적으로 수행하여 잠재력의 임계치를 확장하십시오.",
    "Correction": "방향성 감각의 재설정이 필요합니다. 현재의 노력이 '잘못된 지도'를 보고 달리는 것과 같지 않은지 점검하십시오. 외부의 잡음을 차단하고, 내면의 나침반을 재보정하는 고립의 시간을 확보하십시오.",
    "Pivot": "현재 감지되는 심리적 고통은 '임계점 초과 신호'입니다. 회귀를 두려워하지 말고 경로를 이탈하십시오. 잘못된 경로에서의 가속은 파국을 앞당길 뿐입니다. 즉각적인 중단과 방향 전환이 가장 효율적인 전략입니다."
};

function getGapText(gap: number): string {
    if (gap < 20) return "통계적으로 유의미하지 않은 수준이며, 적응적인 긴장 상태를 유지하고 있습니다.";
    if (gap < 50) return "주의가 필요한 수준으로, 특정 상황에서 내적 갈등 및 인지 부조화를 유발할 수 있습니다.";
    return "매우 심각한 수준으로, 의사결정 프로세스를 교란시키는 주요 저해 요인으로 작용하고 있습니다.";
}

export function generateModule3Content(data: M3Data): string {
    const strategy = STRATEGY_DEFINITIONS[data.strategy] ? data.strategy : "Alignment";
    const dim = data.dominantGap || "growth";

    const blocks: TextBlock[] = [
        {
            id: "m3_intro",
            // Removed .split('(')[0] logic as values are purely Korean
            content: `이상향과 잠재력 간의 벡터 분석 결과, 귀하에게는 **'${STRATEGY_DEFINITIONS[strategy].split('은')[0].trim()}'**이 가장 시급한 솔루션으로 도출되었습니다.\n\n${STRATEGY_DEFINITIONS[strategy]}`
        },
        {
            id: "m3_gap_analysis",
            content: `**벡터 불일치 분석**\n\n특히 **${dim === 'stability' ? '안정성' : dim === 'growth' ? '성장성' : dim === 'relation' ? '관계성' : '자율성'}** 영역에서 감지된 불일치는 ${getGapText(50)} \n\n${DIMENSION_ANALYSIS[dim]}`
        },
        {
            id: "m3_core_advice",
            content: `**전술적 행동 지침**\n\n${GAP_ADVICE[strategy]}`
        }
    ];

    return assembleParagraphs(blocks);
}
