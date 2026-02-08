import { assembleParagraphs } from "./engine";

interface M3Data {
    ideal: { stability: number; growth: number; relation: number; autonomy: number };
    potential: { stability: number; growth: number; relation: number; autonomy: number };
    strategy: string; // Alignment, Expansion, Correction, Pivot
    dominantGap: string; // stability, growth, relation, autonomy
    strongestPotential?: string; // 잠재력이 가장 높은 영역 (분석 엔진에서 산출)
}

/** 이상향에만 집중: 각 전략을 "이상향 달성" 관점에서만 서술 */
const STRATEGY_DEFINITIONS: Record<string, string> = {
    "Alignment": "당신이 바라신 **이상향**과 현재 에너지가 잘 맞춰져 있는 상태입니다. 이상향 달성을 위해 현재의 추진력을 유지·가속하는 것이 핵심입니다. 안주를 경계하고, 목표 난이도를 소폭 상향해 몰입을 유지하십시오.\n\n이 구간의 위험은 '잘 되고 있으니 유지하면 된다'는 무의식적 정체입니다. 정렬도가 높을수록 작은 도전이 성장을 좌우하므로, 한 달 단위로 1개의 도전 과제를 추가하고, 주간 회고에서 결과를 기록하는 방식이 효과적입니다.",
    "Expansion": "당신의 **이상향**에 비해 목표 설정이 보수적으로 제한된 상태로 읽힙니다. 이상향에 더 가까이 가려면, 인지적 한계선을 재설정하고 리스크 허용 범위를 단계적으로 확장하는 것이 필요합니다. 과거 실패에 대한 두려움을 줄이는 실험이 도움이 됩니다.\n\n확장 전략은 '한 번에 크게'가 아니라 '강점에서 작게'입니다. 가장 자신 있는 차원에서 한 단계 높은 목표를 4주간 실행하고, 그 성과를 다른 차원으로 옮기는 방식이 안정적입니다.",
    "Correction": "당신이 추구하는 **이상향**과 실제로 에너지를 쓰는 방향 사이에 오차가 감지됩니다. 타인의 기대나 사회적 압력이 목표를 흐리고 있을 수 있으므로, 동기 부여의 원천을 재검토하고 '진짜 나의 이상향'을 다시 맞추는 시간이 필요합니다.\n\n보정은 전면 수정이 아니라 우선순위 재배치입니다. 가장 괴리가 큰 한 차원에서만 목표와 행동을 다시 정의하고, 나머지는 유지하거나 소폭 조정하는 방식이 과부하를 줄입니다.",
    "Pivot": "현재의 삶의 궤적이 당신이 바라신 **이상향**과 반대 방향으로 진행되고 있는 구조적 불일치 상태로 읽힙니다. 부분 수정으로는 한계가 있으므로, 이상향을 기준으로 우선순위와 방향성을 전면 재설계하는 결단이 필요합니다.\n\n전환은 한 번에 전부 바꾸는 것이 아니라 한 차원을 먼저 안정시키는 것입니다. 3개월 동안 한 차원을 기반으로 고정하고, 나머지는 유지 수준으로 둔 뒤, 방향 전환의 마찰을 줄이는 전략이 필요합니다."
};

const DIMENSION_ANALYSIS: Record<string, string> = {
    "stability": "안정성 차원의 불일치는 '정적 평형'과 '동적 변화' 욕구 사이의 충돌을 의미합니다. 이는 모호한 상황에 대한 인내력 저하 및 만성적 예기 불안의 원인이 됩니다.\n\n안정성이 흔들릴 때는 루틴·재정·수면 같은 기반 요소가 동시에 흔들리는 경향이 있습니다. 이 영역을 재정비하면 나머지 차원으로의 에너지 전환이 수월해집니다.",
    "growth": "성장성 차원의 불일치는 자아 실현 욕구와 실제 실행 역량 간의 간극을 나타냅니다. 성장에 대한 강박이 오히려 실행을 마비시키는 '완벽주의적 지연' 현상을 점검해야 합니다.\n\n성장은 '큰 도전'이 아니라 '작은 지속성'으로 전환될 때 실제 성과로 이어집니다. 한 달에 하나의 학습·실험만 고정해도 격차가 빠르게 줄어듭니다.",
    "relation": "관계성 차원의 불일치는 친밀감 욕구와 자율성 욕구 사이의 '접근-회피 갈등'을 시사합니다. 애착 패턴의 불안정성이 관계의 질적 저하를 초래하고 있습니다.\n\n관계의 질을 회복하려면 연결의 '빈도'보다 '의미 있는 대화'의 횟수를 높이는 것이 효과적입니다. 핵심 인물 2~3명과의 연결을 먼저 고정하십시오.",
    "autonomy": "자율성 차원의 불일치는 통제 소재에 대한 갈등을 의미합니다. 자기 결정권에 대한 욕구와 환경적 제약 사이의 텐션이 지속적인 에너지 누수를 유발하고 있습니다.\n\n자율성은 고립이 아니라 선택권의 확보입니다. 작은 결정부터 '내 기준'을 명시하는 습관이 누적되면 방향성이 선명해집니다."
};

/** 이상향 달성을 위한 조언만 제시 */
const GAP_ADVICE: Record<string, string> = {
    "Alignment": "**이상향에 맞춘 조언**: 현재 추진력이 이상향과 잘 맞춰져 있습니다. 이 시기를 활용해 이상향 쪽으로 비약적 도약을 목표로 설정하십시오. 점진적 개선에 머무르지 마십시오.\n\n실행은 한 번에 크게가 아니라, 매주 작은 상향 조정으로 진행하십시오. 동일한 루틴에 '한 단계 위'만 추가하면, 정렬 상태를 유지하면서도 가속이 가능합니다.",
    "Expansion": "**이상향에 맞춘 조언**: 당신이 바라신 이상향을 달성할 수 있는 역량은 충분히 있습니다. 안전 마진을 과도하게 두는 습관을 줄이고, 이상향에 가까운 도전적 과제를 단계적으로 수행하십시오.\n\n확장 시에는 실패 비용이 낮은 실험을 먼저 배치하십시오. 성공 경험이 누적되면 이상향과의 심리적 거리감이 빠르게 축소됩니다.",
    "Correction": "**이상향에 맞춘 조언**: 현재 노력의 방향이 '진짜 나의 이상향'과 일치하는지 점검하십시오. 외부 잡음을 차단하고, 내면의 나침반(이상향)을 재보정하는 시간을 확보하십시오.\n\n보정의 핵심은 선택과 집중입니다. 가장 어긋난 차원 하나만 먼저 재정의하고, 그 외는 유지 수준으로 둬 과부하를 피하십시오.",
    "Pivot": "**이상향에 맞춘 조언**: 현재 경로가 이상향과 반대일 가능성이 높습니다. 잘못된 경로에서의 가속은 피로만 쌓입니다. 이상향을 기준으로 즉각적인 방향 전환을 검토하십시오.\n\n전환은 90일 단위로 설계하는 것이 안전합니다. 한 차원을 기반으로 고정한 뒤, 다음 차원으로 확장하는 순차적 전환이 가장 안정적입니다."
};

const DIM_LABEL: Record<string, string> = {
    stability: "안정성",
    growth: "성장성",
    relation: "관계성",
    autonomy: "자율성",
};

/** 잠재력 파악: potential 벡터에서 가장 높은 영역 요약 */
function getPotentialSummary(potential: M3Data["potential"], strongestPotential?: string): string {
    const dim = strongestPotential || (Object.entries(potential).sort(([, a], [, b]) => b - a)[0]?.[0]);
    if (!dim) return "현재 발휘하고 있는 잠재력이 4차원(안정·성장·관계·자율)에 반영되었습니다.";
    const label = DIM_LABEL[dim] ?? dim;
    return `현재 **잠재력**이 가장 높게 나타난 영역은 **${label}**입니다. 이상향과의 격차를 줄일 때 이 강점을 활용할 수 있습니다.`;
}

/** 피험자 이상향만 집중: ideal 벡터에서 도출한 이상향 요약 문장 */
function getIdealSummary(ideal: M3Data["ideal"]): string {
    const entries = Object.entries(ideal) as [keyof M3Data["ideal"], number][];
    const sorted = entries.sort(([, a], [, b]) => b - a);
    const top = sorted[0];
    const second = sorted[1];
    if (!top) return "당신이 선택한 이상향을 바탕으로 분석했습니다.";
    const topLabel = DIM_LABEL[top[0]];
    const secondLabel = second && second[1] > 0 ? DIM_LABEL[second[0]] : null;
    if (secondLabel && top[1] > 0 && second[1] > 0)
        return `당신이 선택한 **이상향**은 **${topLabel}**과 **${secondLabel}**을 가장 중시하는 상태로 읽힙니다. 본 리포트는 이 이상향에만 집중하여, 그 방향으로 나아가는 데 필요한 조언만 제시합니다.`;
    return `당신이 선택한 **이상향**은 **${topLabel}**을 가장 중시하는 상태로 읽힙니다. 본 리포트는 이 이상향에만 집중하여, 그 방향으로 나아가는 데 필요한 조언만 제시합니다.`;
}

function getGapText(gap: number): string {
    if (gap < 20) return "통계적으로 유의미하지 않은 수준이며, 적응적인 긴장 상태를 유지하고 있습니다.";
    if (gap < 50) return "주의가 필요한 수준으로, 특정 상황에서 내적 갈등 및 인지 부조화를 유발할 수 있습니다.";
    return "매우 심각한 수준으로, 의사결정 프로세스를 교란시키는 주요 저해 요인으로 작용하고 있습니다.";
}

export interface Module3ResultItem {
    id: string;
    title: string;
    content: string;
}

// ----- 마인드 아키텍터 통합 리포트: 이상향에만 집중. 4섹션 구조. -----
// 피험자의 이상향 파악 및 그에 맞는 조언만 제시. 잠재력 = 실행력 − 방해 요인.

function buildSection1_ContextualOntology(data: M3Data): string {
    const idealSummary = getIdealSummary(data.ideal);
    return `**[SECTION 1] 당신의 이상향에 기반한 서언**

${idealSummary}

아래 현상은 **고정된 성격**이 아니라, **당신이 바라신 방향(이상향)**과 현재 에너지 배분 사이의 관계로 읽힙니다. 본 리포트는 **이상향에 더 가까이 가기 위한** 한 장의 지도로 활용하십시오.

이 서언은 이후 섹션(방해 요인, 현재 실행 구조, 잠재력 로드맵)과 자연스럽게 연결됩니다. 이상향이 선명할수록, 방해 요인과 실행 전략은 더 구체적으로 조정될 수 있습니다.`;
}

function buildSection2_Interference(data: M3Data): string {
    const dim = data.dominantGap || "growth";
    const dimLabel = DIM_LABEL[dim] ?? dim;
    const dimAnalysis = DIMENSION_ANALYSIS[dim] ?? "";
    const gapDesc = getGapText(50);
    const potentialSummary = getPotentialSummary(data.potential, data.strongestPotential);
    return `**[SECTION 2] 방해 요인: 이상향 달성을 막는 요인**

${potentialSummary}

당신의 **이상향**과 현재 잠재력 사이에 감지된 격차는, **이상향에 더 가까이 가는 것**을 막는 방해 요인(Interference)의 한 단면으로 해석할 수 있습니다. ${gapDesc}

**${dimLabel}** 영역에서 두드러지는 이 불일치는, 의지 부재가 아니라 **맥락적 배경**이 있을 가능성이 높습니다. 예를 들어 실행 기능 과부하나 실패에 대한 예기 불안이 과활성화되면, "바라신 방향"과 "실제로 쓰는 에너지" 사이에 체계적 오차가 생깁니다. ${dimAnalysis}

이 기제는 고쳐야 할 단점이 아니라 **이상향 쪽으로 에너지가 잘 흐르지 않게 하는** 현재의 적응 패턴으로 보는 것이 적절합니다. 방해 요인을 식별·제어했을 때 같은 구조가 이상향 쪽으로 다른 출력을 낼 수 있습니다.

다음 섹션에서는 이 간섭을 줄였을 때의 **현재 실행 구조**를 점검하고, 어떤 전략이 가장 효과적인지 연결합니다.`;
}

function buildSection3_Performance(data: M3Data): string {
    const strategy = STRATEGY_DEFINITIONS[data.strategy] ? data.strategy : "Alignment";
    const def = STRATEGY_DEFINITIONS[strategy];
    return `**[SECTION 3] 현재 실행 구조: 이상향 대비 현재 상태**

현재 발휘하고 있는 에너지가 **당신의 이상향**과 얼마나 정렬되어 있는지가 핵심입니다. 벡터 분석 결과, 현재 구조는 **${strategy}** 구간으로 읽힙니다.

${def}

에너지가 어디에 집중되고 있는지, 그 방향이 이상향에 얼마나 가까운지는 아래 '이상향 달성을 위한 로드맵'과 함께 참고하십시오.

이 단계에서 중요한 것은 “지금의 구조가 나쁘다/좋다”가 아니라, **이상향을 기준으로 정렬되어 있는지**입니다. 정렬을 높이면 같은 노력으로 더 큰 결과가 나옵니다.`;
}

function buildSection4_Potential(data: M3Data): string {
    const strategy = GAP_ADVICE[data.strategy] ? data.strategy : "Alignment";
    const roadmap = GAP_ADVICE[strategy];
    return `**[SECTION 4] 잠재력 로드맵: 이상향 달성을 위한 실행 계획**

**잠재력 = 실행력 − 방해 요인**에 따르면, 방해 요인을 제어했을 때 **이상향 쪽으로** 에너지가 더 잘 흐를 수 있습니다. 아래는 **당신의 이상향에만** 맞춘 행동 지침입니다.

${roadmap}

본 로드맵은 판단이나 처벌이 아니라, **이상향에 더 가까이 가기 위한** 실험적 프로토콜로 활용하십시오.

이상향은 멀리 있는 목표가 아니라, 작은 행동의 반복으로 당겨오는 구조입니다. 오늘 정한 한 가지 행동이 30일 뒤 구조를 바꾸는 기점이 됩니다.`;
}

/** 통합 리포트 본문: 이상향에만 집중, 4섹션 구조 */
export function generateModule3Content(data: M3Data): string {
    const blocks = [
        { id: "s1", content: buildSection1_ContextualOntology(data) },
        { id: "s2", content: buildSection2_Interference(data) },
        { id: "s3", content: buildSection3_Performance(data) },
        { id: "s4", content: buildSection4_Potential(data) },
    ];
    return assembleParagraphs(blocks);
}

/** Module3 결과용: 이상향 요약 먼저, 이후 전략·격차·이상향 달성 조언만 */
export function generateModule3Items(data: M3Data): Module3ResultItem[] {
    const strategy = STRATEGY_DEFINITIONS[data.strategy] ? data.strategy : "Alignment";
    const dim = data.dominantGap || "growth";
    const dimLabel = DIM_LABEL[dim] ?? dim;
    const idealSummary = getIdealSummary(data.ideal);
    const potentialSummary = getPotentialSummary(data.potential, data.strongestPotential);

    const strategyDef = STRATEGY_DEFINITIONS[strategy];
    const gapDetail = DIMENSION_ANALYSIS[dim] ?? "";
    const roadmap = GAP_ADVICE[strategy];
    return [
        {
            id: "m3-0",
            title: "당신의 이상향 요약",
            content: `${idealSummary}\n\n이상향이 선명할수록 선택의 기준이 단순해지고, 불확실성이 줄어듭니다. 이상향에 맞는 행동 1개를 정하고 30일간 반복하면 정렬도가 올라갑니다.`
        },
        {
            id: "m3-0b",
            title: "현재 잠재력 파악",
            content: `${potentialSummary}\n\n강점 영역은 성공 경험이 바로 쌓이는 구간이므로, 행동 지속성이 높습니다. 강점에서 작은 성공을 먼저 만들고, 그 에너지를 격차가 큰 영역으로 옮기십시오.`
        },
        {
            id: "m3-1",
            title: "이상향 달성 전략",
            content: `이상향과 잠재력 분석 결과, **${strategy}** 관점이 가장 시급합니다.\n\n${strategyDef}\n\n전략 실행은 4주 단위가 적합합니다. 1주차에 규칙을 정하고, 2~4주차에 반복과 피드백으로 고정하십시오.`
        },
        {
            id: "m3-2",
            title: "이상향과의 격차 (주요 영역)",
            content: `**${dimLabel}** 영역에서 격차가 두드러집니다. ${getGapText(50)}\n\n${gapDetail}\n\n이 영역의 방해 요인을 줄이기 위해, 오늘 당장 할 수 있는 행동 하나를 정하고 7일간 반복하십시오.`
        },
        {
            id: "m3-3",
            title: "이상향에 맞춘 행동 지침",
            content: `${roadmap}\n\n방해 요인이 줄어들면 같은 노력으로도 더 높은 결과가 나옵니다. 이상향은 먼 곳에 있는 것이 아니라, 작은 행동의 반복으로 당겨오는 구조입니다.`
        }
    ];
}
