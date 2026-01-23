import { AnalysisVariables } from "@growth-roadmap/types/module2";

export interface ExpertAdvice {
    title: string;
    todos: string[];
    growthAdvice: string;
}

export interface ReportResult {
    metrics: {
        input: number;
        processing: number;
        output: number;
    };
    labels: {
        input: string;
        processing: string;
        output: string;
    };
    ipoAnalysis: {
        input: string;
        processing: string;
        output: string;
    };
    typeAnalysis: string;
    predictiveSimulations: string[];
    latentTendencies: string[];
    psychologicalInsights: string;
    title: string;
    description: string;
    advice: ExpertAdvice;
    socialArchetype: {
        title: string;
        description: string;
    };
}

const TYPES = {
    // Input High
    "H-L-A": "통합적 통제형",
    "H-L-P": "분석적 관망형",
    "H-I-A": "유동적 행동형",
    "H-I-P": "수용적 조화형",

    // Input Low
    "L-L-A": "주도적 원칙형",
    "L-L-P": "전문적 탐구형",
    "L-I-A": "직관적 실행형",
    "L-I-P": "내향적 독립형",
};

// ... (lines 52-205 unchanged usually, but I'll skip to the socialArchetype part) ...



const TYPE_DESCRIPTIONS = {
    "H-L-A": "넓은 시야로 정보를 받아들이고, 이를 체계적으로 분석하여, 주도적으로 실행하는 리더형입니다. 모호한 상황에서도 질서를 만들어내며 조직을 목적지까지 이끄는 힘이 있습니다.",
    "H-L-P": "주변의 변화를 놓치지 않으면서도, 냉철한 논리로 상황을 판단합니다. 섣불리 움직이지 않고 가장 확실한 기회가 올 때까지 기다릴 줄 아는 전략가입니다.",
    "H-I-A": "타인에게 개방적이고 영감이 뛰어난 행동파입니다. 사람들의 마음을 움직이는 힘이 있으며, 기존의 틀을 깨는 혁신적인 시도를 즐깁니다.",
    "H-I-P": "데이터와 매뉴얼보다는 '이심전심'의 흐름을 믿으며, 어떤 환경에서도 물 흐르듯 적응하는 유연한 조율자입니다. 갈등을 부드럽게 중재하고 조화를 이끌어냅니다.",

    "L-L-A": "주변의 소음이나 불필요한 정보는 차단하고, 오직 자신의 신념과 논리에 따라 강력하게 밀고 나가는 뚝심 있는 개척자입니다.",
    "L-L-P": "자신만의 전문 분야에 깊이 몰입하며, 검증된 데이터와 논리가 아니면 움직이지 않는 완벽주의 성향의 전문가입니다.",
    "L-I-A": "복잡한 정보는 거두절미하고, 동물적인 감각과 직관으로 핵심을 찔러 빠르게 승부를 보는 해결사입니다.",
    "L-I-P": "외부의 시선에 흔들리지 않고, 홀로 깊이 사색하며 자신만의 독창적인 세계관을 구축하는 독립적인 사상가입니다."
};

function normalize(score: number): number {
    const min = -40;
    const max = 100;
    let normalized = ((score - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, Math.round(normalized)));
}

function getDetailedInputText(score: number): string {
    if (score >= 65) return `외부 자극을 차단하기보다 적극적으로 받아들이는 상태입니다. 타인의 감정이나 상황의 변화를 예민하게 감지하며, 새로운 정보를 거부감 없이 즉시 받아들입니다.`;
    if (score <= 35) return `자신에게 필요한 정보에만 집중하며, 불필요한 노이즈를 스스로 차단합니다. 감정 소모를 최소화하고 본질적인 데이터에 집중하는 효율적인 상태입니다.`;
    return `상황에 따라 정보를 받아들이거나 걸러내는 조절 능력이 뛰어납니다. 과도하게 예민하지도, 둔감하지도 않은 최적의 수용성을 유지하고 있습니다.`;
}

function getDetailedProcessingText(score: number): string {
    if (score >= 65) return `직관보다는 데이터와 인과관계를 중시합니다. 정해진 원칙과 규약을 따를 때 심리적 안정을 느끼며, 변수 없는 확실한 계획을 선호합니다.`;
    if (score <= 35) return `고정된 규칙에 얽매이지 않고, 그때그때 상황에 맞는 최적의 답을 직관적으로 찾아냅니다. '논리 부족'이 아닌 '압도적인 융통성'을 의미합니다.`;
    return `기본적인 원칙은 지키되, 상황이 바뀌면 유연하게 대처할 줄 압니다. 직관과 논리 사이에서 적절한 균형점을 찾습니다.`;
}

function getDetailedOutputText(score: number): string {
    if (score >= 65) return `자신이 상황을 통제하고 이끌어가야 직성이 풀립니다. 리스크를 감수하고서라도 먼저 행동하는 리더형입니다.`;
    if (score <= 35) return `섣불리 나서기보다 흐름을 지켜보며 가장 안전한 타이밍을 기다립니다. 서포트 역할이나 리스크 관리에서 빛을 발합니다.`;
    return `무작정 앞장서지도, 뒤로 숨지도 않습니다. 상황이 요구하면 리더가 되지만, 굳이 필요 없다면 조용히 제 몫을 해내는 합리적 포지션입니다.`;
}

function getPredictiveSimulations(typeCode: string): string[] {
    const sims = {
        "H-L-A": ["위기 상황: 당황하기보다 즉시 비상 대책을 수립하고 팀원들에게 명확한 지시를 내립니다.", "협업: 목표가 불분명하면 답답해하며, 자신이 직접 프로세스를 정리하려 듭니다.", "갈등: 감정적인 호소보다는 논리적인 해결책을 제시하여 상대를 설득합니다."],
        "H-L-P": ["위기 상황: 섣불리 움직이지 않고 상황을 끝까지 관찰한 뒤, 결정적인 한 방을 준비합니다.", "협업: 남들이 놓친 디테일한 오류를 잡아내는 품질 관리자 역할을 자처합니다.", "갈등: 직접 대립하기보다는 규정이나 팩트를 근거로 자신의 정당성을 입증합니다."],
        "H-I-A": ["위기 상황: 기존의 매뉴얼을 버리고 기발한 임기응변으로 상황을 반전시킵니다.", "협업: 분위기 메이커로서 팀의 사기를 높이지만, 세부적인 계획 수립은 귀찮아할 수 있습니다.", "갈등: 논리적 언쟁보다는 인간적인 호소나 유머로 상황을 부드럽게 넘깁니다."],
        "H-I-P": ["위기 상황: 주변 사람들의 동요를 먼저 진정시키고, 다 같이 살 수 있는 공생의 길을 모색합니다.", "협업: 의견이 대립할 때 양쪽의 입장을 모두 이해하며 중재안을 만들어냅니다.", "갈등: 싸움을 극도로 싫어하여, 자신이 조금 손해를 보더라도 평화를 지키려 합니다."],

        "L-L-A": ["위기 상황: 주변의 만류나 우려를 무시하고, 자신이 옳다고 믿는 방식대로 정면 돌파합니다.", "협업: 타인의 간섭을 싫어하며, 독자적인 권한이 주어졌을 때 최고의 성과를 냅니다.", "갈등: 타협하지 않으며, 자신의 원칙이 지켜질 때까지 물러서지 않습니다."],
        "L-L-P": ["위기 상황: 자신의 영역을 침범받지 않도록 방어막을 치고, 문제가 지나가기를 조용히 기다립니다.", "협업: 명확하게 할당된 자신의 업무만 완벽하게 수행하며, 불필요한 회의를 싫어합니다.", "갈등: 감정 섞인 비난에는 무대응으로 일관하며, 냉정한 침묵으로 상대를 제압합니다."],
        "L-I-A": ["위기 상황: 긴 설명 없이 본능적으로 위험을 감지하고, 남들보다 한 박자 빠르게 탈출하거나 대응합니다.", "협업: 복잡한 절차를 생략하고 핵심만 빠르게 처리하며, 느린 팀원을 답답해할 수 있습니다.", "갈등: 말보다는 행동으로 결과를 증명하여 상대의 입을 다물게 합니다."],
        "L-I-P": ["위기 상황: 세상이 뒤집혀도 자신만의 페이스를 잃지 않으며, 독창적인 관점에서 해법을 찾습니다.", "협업: 집단적 사고에 휩쓸리지 않고, 남들이 보지 못하는 이면을 지적합니다.", "갈등: 겉으로는 동의하는 척하면서 속으로는 자신만의 생각을 고수합니다."]
    };
    return sims[typeCode as keyof typeof sims] || ["상황에 따라 유연하게 대처합니다."];
}

function getLatentTendencies(typeCode: string): string[] {
    const tendencies = {
        "H-L-A": ["독단성 주의: 자신의 판단이 너무 명확하여 타인의 의견을 묵살할 위험이 있습니다.", "번아웃: 모든 것을 통제하려다 에너지가 고갈될 수 있습니다."],
        "H-L-P": ["실행 지체: 분석만 하다가 행동할 타이밍을 놓칠 수 있습니다.", "냉소적 태도: 타인의 열정을 비합리적이라며 깎아내릴 수 있습니다."],
        "H-I-A": ["용두사미: 시작은 거창하지만 뒷심이 부족하여 마무리가 약할 수 있습니다.", "충동성: 기분에 따라 중요한 결정을 번복할 위험이 있습니다."],
        "H-I-P": ["우유부단: 모두를 만족시키려다 결국 아무런 결정도 내리지 못할 수 있습니다.", "감정 과잉: 타인의 감정을 자신의 것처럼 느껴 쉽게 지칠 수 있습니다."],

        "L-L-A": ["소통 단절: '내 말이 법'이라는 태도로 주변을 숨 막히게 할 수 있습니다.", "고립: 도움을 요청하는 것을 나약함으로 여겨 혼자 짐을 짊어질 수 있습니다."],
        "L-L-P": ["변화 거부: 익숙한 방식만 고집하여 새로운 기회를 거부할 수 있습니다.", "수동적 공격: 불만이 있어도 말하지 않고 비협조적인 태도로 일관할 수 있습니다."],
        "L-I-A": ["무모함: 근거 없는 자신감으로 리스크가 큰 도박을 할 수 있습니다.", "변덕: 기준이 명확하지 않아 주변 사람들이 혼란스러워할 수 있습니다."],
        "L-I-P": ["현실 도피: 자신만의 세계에 갇혀 실제 문제를 외면할 수 있습니다.", "비사교성: 타인과의 교류를 시간 낭비로 여겨 사회적 기회를 놓칠 수 있습니다."]
    };
    return tendencies[typeCode as keyof typeof tendencies] || ["특별한 잠재적 위험이 감지되지 않았습니다."];
}

function getExpertAdvice(typeCode: string): ExpertAdvice {
    const advice = {
        "H-L-A": {
            title: "독단적인 리더가 아닌, '함께하는 비저너리'가 되세요.",
            todos: [
                "매주 금요일, 팀원들의 감정 상태를 묻는 시간 가지기",
                "결정하기 전에 '반대 의견'을 의무적으로 하나씩 청취하기",
                "완벽하지 않은 아이디어도 허용하는 브레인스토밍 시간 갖기"
            ],
            growthAdvice: "당신의 논리와 실행력은 훌륭한 무기입니다. 하지만 진정한 리더십은 '내가 틀릴 수도 있다'는 가능성을 열어둘 때 완성됩니다. 때로는 효율성보다 '사람의 마음'이 더 큰 성과를 가져옴을 기억하세요."
        },
        "H-L-P": {
            title: "분석을 멈추고, 때로는 '직감'에 몸을 맡겨보세요.",
            todos: [
                "정보가 70%만 모였을 때 과감하게 실행해보기",
                "하루에 한 번, 논리적 이유 없이 좋아서 하는 일 찾기",
                "비판적인 멘트보다 칭찬의 말을 먼저 건네는 연습하기"
            ],
            growthAdvice: "완벽한 타이밍은 오지 않습니다. 당신의 분석은 이미 충분히 날카로우니, 이제는 불확실성 속으로 한 발짝 내딛는 용기가 필요합니다. 실패조차도 당신에게는 훌륭한 데이터가 될 것입니다."
        },
        "H-I-A": {
            title: "열정의 불꽃을 '지속 가능한 빛'으로 만드세요.",
            todos: [
                "일을 벌이기 전에 '마무리 계획'부터 세우기",
                "즉흥적인 약속 대신 일정을 기록하고 지키는 습관 들이기",
                "흥분된 상태에서는 중요한 결정을 하루 미루기"
            ],
            growthAdvice: "당신의 에너지는 주변을 밝히는 힘이 있습니다. 하지만 그 빛이 너무 강렬해서 스스로를 태워버리지 않도록 주의하세요. '꾸준함'이라는 무기를 장착한다면 당신은 세상을 바꿀 수 있습니다."
        },
        "H-I-P": {
            title: "모두를 위한 평화보다, '나를 위한 선택'을 하세요.",
            todos: [
                "하루에 한 번, 사소한 것이라도 '거절'하는 연습하기",
                "타인의 하소연을 들을 때 '감정 쓰레기통'이 되지 않도록 거리 두기",
                "내 의견을 말할 때 '죄송하지만'이라는 수식어 빼기"
            ],
            growthAdvice: "당신의 공감 능력은 축복이지만, 자칫하면 당신의 영혼을 갉아먹는 족쇄가 될 수 있습니다. 남을 배려하는 만큼 당신 자신도 배려받을 자격이 있음을 잊지 마세요. 단단한 자아가 선행되어야 진정한 조화도 가능합니다."
        },

        "L-L-A": {
            title: "강철 같은 신념에 '유연함'이라는 완충제를 더하세요.",
            todos: [
                "나와 전혀 다른 관심사를 가진 사람과 대화해보기",
                "내 방식이 비효율적이어도 타인의 방식을 한 번쯤 따라주기",
                "논쟁에서 이기는 것보다 관계를 지키는 것을 목표로 삼기"
            ],
            growthAdvice: "당신의 뚝심은 존경스럽지만, 때로는 부러지지 않기 위해 휘어질 줄도 알아야 합니다. 세상에는 논리로 설명되지 않는 가치들이 존재함을 받아들인다면, 당신의 영향력은 훨씬 더 넓어질 것입니다."
        },
        "L-L-P": {
            title: "당신의 전문성을 '세상 밖으로' 연결하세요.",
            todos: [
                "나의 지식을 비전공자도 알기 쉽게 설명하는 글 써보기",
                "동료의 실수에 대해 해결책을 제시하되, 비난하지 않기",
                "익숙한 환경을 벗어나 새로운 모임에 한 달에 한 번 참여하기"
            ],
            growthAdvice: "깊이 있는 지식은 고립된 탑 안에서가 아니라, 사람들과 나눌 때 진정한 가치를 발휘합니다. 당신의 기준을 타인에게 강요하지 않고, 지식의 다리가 되어준다면 당신은 대체 불가능한 존재가 될 것입니다."
        },
        "L-I-A": {
            title: "빠른 승부수 뒤에 '숨 고르기' 시간을 두세요.",
            todos: [
                "말하기 전에 3초만 더 생각하고 뱉는 습관 들이기",
                "단기적인 이득보다 장기적인 신뢰 관계를 먼저 고려하기",
                "규칙이나 절차를 무시하지 않고 존중하는 태도 보이기"
            ],
            growthAdvice: "당신의 직관과 속도는 타의 추종을 불허하지만, 혼자서만 빨리 간다면 결국 외로워질 수 있습니다. 주변 사람들과 발만 맞춰도 당신은 훨씬 더 멀리 갈 수 있습니다. 속도보다 방향을 점검하는 시간을 가지세요."
        },
        "L-I-P": {
            title: "내면의 우주에서 나와 '현실의 땅'을 밟으세요.",
            todos: [
                "하루에 30분, 아무 생각 없이 걷거나 운동하며 현실 감각 깨우기",
                "추상적인 아이디어를 구체적인 결과물로 만들어 공개하기",
                "친한 친구에게 내 속마음을 솔직하게 털어놓기"
            ],
            growthAdvice: "당신의 독창적인 사상은 인류의 보물이 될 수 있지만, 머릿속에만 머문다면 공상에 불과합니다. 현실과의 접점을 두려워하지 마세요. 당신의 생각이 세상과 만날 때 비로소 꽃을 피울 것입니다."
        }
    };
    return advice[typeCode as keyof typeof advice] || {
        title: "균형 잡힌 성장을 위한 첫걸음",
        todos: ["자신의 강점을 파악하고 기록하기", "스트레스 상황에서 한 템포 쉬어가기", "주변 사람들과 긍정적인 대화 나누기"],
        growthAdvice: "당신은 무한한 잠재력을 가지고 있습니다. 작은 변화부터 시작해보세요."
    };
}

function getSocialArchetype(p: number, a: number, sd: number): { title: string; description: string } {
    // Logic based on Normalized Scores (0-100)
    // Priority: Builder (High P/SD) > Innovator (High P/A) > Navigator (High A, Low SD) > Independent (High SD)

    if (p >= 60 && sd >= 50) {
        return {
            title: "체제 구축 유형",
            description: "당신은 무질서한 상황에서 규칙을 만들고 타인을 이끄는 리더형입니다. 조직의 안정을 최우선으로 하며, 명확한 위계와 절차를 선호합니다."
        };
    }
    if (p >= 60 && a >= 50) {
        return {
            title: "체제 혁신 유형",
            description: "당신은 기존의 틀을 깨고 새로운 가치를 창출하는 혁신가형입니다. 불합리한 관행에 도전하며, 더 나은 방법을 찾아내는 데 에너지를 쏟습니다."
        };
    }
    if (a >= 60 && sd < 50) {
        return {
            title: "체제 순응 유형",
            description: "당신은 어떤 시스템에서도 빠르게 적응하고 실리를 챙기는 유연한 유형입니다. 불필요한 충돌을 피하고, 흐름을 타며 자신의 이익을 극대화합니다."
        };
    }
    // Default or High SD
    return {
        title: "체제 독립 유형",
        description: "당신은 조직의 논리보다 자신의 원칙을 중요시하는 독립적인 유형입니다. 타인에게 의존하거나 휘둘리지 않으며, 자신만의 독자적인 영역을 구축합니다."
    };
}

export function generateReport(rawVariables: AnalysisVariables): ReportResult {
    const proactivity = normalize(rawVariables.proactivity);
    const adaptability = normalize(rawVariables.adaptability);
    const socialDistance = normalize(rawVariables.socialDistance);

    // IPO 모델 매핑
    const inputScore = Math.round(((100 - socialDistance) + adaptability) / 2);
    const processingScore = Math.round((proactivity + (100 - adaptability)) / 2);
    const outputScore = proactivity;

    // 상세 텍스트 생성 (IPO Analysis는 이제 객체로 반환하여 UI에서 개별 매칭 가능하게 함)
    const ipoAnalysis = {
        input: getDetailedInputText(inputScore),
        processing: getDetailedProcessingText(processingScore),
        output: getDetailedOutputText(outputScore)
    };

    // 유형 코드 생성 (H/L - L/I - A/P)
    const isInputHigh = inputScore >= 50;
    const isProcessLogical = processingScore >= 50;
    const isOutputActive = outputScore >= 50;

    const typeCode = `${isInputHigh ? 'H' : 'L'}-${isProcessLogical ? 'L' : 'I'}-${isOutputActive ? 'A' : 'P'}`;
    const title = TYPES[typeCode as keyof typeof TYPES] || "알 수 없는 유형";
    const typeAnalysis = TYPE_DESCRIPTIONS[typeCode as keyof typeof TYPE_DESCRIPTIONS] || "복합적인 성향이 어우러져 있어 단정짓기 어려운 다면적인 성격입니다.";

    // 동적 라벨 생성
    const labels = {
        input: isInputHigh ? "입력 (수용성)" : "입력 (선별성)",
        processing: isProcessLogical ? "처리 (논리성)" : "처리 (직관성)",
        output: isOutputActive ? "출력 (주도성)" : "출력 (신중성)"
    };

    // 추가 분석 데이터 생성
    const predictiveSimulations = getPredictiveSimulations(typeCode);
    const latentTendencies = getLatentTendencies(typeCode);
    const advice = getExpertAdvice(typeCode);

    // 심층 통찰
    const insightList = [];
    if (socialDistance > 70) insightList.push("방어 기제 [철벽]: 타인에게 곁을 잘 내주지 않습니다.");
    else if (socialDistance < 30) insightList.push("방어 기제 [개방]: 사람을 믿고 의지하는 편입니다.");

    if (adaptability > 70) insightList.push("회복 탄력성 [최상]: 어떤 상황에서도 유연하게 대처합니다.");
    else if (adaptability < 30) insightList.push("회복 탄력성 [경직]: 예상치 못한 변화에 스트레스를 받습니다.");

    if (proactivity > 70) insightList.push("에너지 [폭발적]: 목표를 향해 거침없이 돌진합니다.");
    else if (proactivity < 30) insightList.push("에너지 [신중함]: 돌다리도 두드려보고 건너는 성격입니다.");

    const psychologicalInsights = insightList.length > 0 ? insightList.join("\n") : "전반적으로 모난 곳 없이 균형 잡힌 심리 상태입니다.";

    const description = `9단계 심층 분석 완료.\n당신의 의사결정 패턴은 '${title}' 계열입니다.`;

    // Social Archetype Calculation
    const socialArchetype = getSocialArchetype(proactivity, adaptability, socialDistance);

    return {
        metrics: { input: inputScore, processing: processingScore, output: outputScore },
        labels,
        ipoAnalysis, // 객체로 반환
        typeAnalysis,
        predictiveSimulations, // 추가됨
        latentTendencies, // 추가됨
        psychologicalInsights,
        title,
        description,
        advice, // Structured advice object
        socialArchetype // New Field
    };
}
