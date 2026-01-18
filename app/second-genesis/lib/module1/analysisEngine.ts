import { generateModule1Content, generateSynthesizedItems } from "../content/module1";

export interface ResultItem {
    id: string;
    title: string; // 한 줄 요약 (한국어)
    content: string; // 상세 설명 (한국어)
}


/**
 * Module 1 (Depth Analysis) 전용 엔진
 * 최소 16개의 ResultItem을 반환합니다.
 */
export class Module1Engine {
    constructor(private data: any) { }

    public generateResults(): ResultItem[] {
        // 실제 피검자 데이터 기반으로 Module 1 분석 결과를 생성합니다.
        // data는 M1Data 형태이며, dominantType을 사용해 generateModule1Content를 호출합니다.
        const { dominantType } = (this.data || {}) as any;
        // Legacy item generator is deprecated.
        // We now use generateSynthesizedItems to get aggregated, structured analysis blocks.

        const results = generateSynthesizedItems(dominantType ?? "A");

        // No filler needed as we return fixed 5 rich blocks.
        return results;
    }
}

// 1. Interference Analysis Engine
export const analyzeInterference = (shadowData: string[]) => {

    const counts: Record<string, number> = {
        A: 0, // 성취 지향성
        B: 0, // 내면 결핍
        C: 0, // 감정 회피
        D: 0  // 현실 도피
    };

    let total = 0;
    shadowData.forEach(id => {
        const type = id.split('_')[1];
        if (counts[type] !== undefined) {
            counts[type]++;
            total++;
        }
    });

    // Client-Side Vectoring: Calculate normalized vector
    const vector = {
        A: total > 0 ? (counts.A / total).toFixed(2) : "0",
        B: total > 0 ? (counts.B / total).toFixed(2) : "0",
        C: total > 0 ? (counts.C / total).toFixed(2) : "0",
        D: total > 0 ? (counts.D / total).toFixed(2) : "0"
    };

    // Determine Dominant Interference Factor
    // Logic: Find max value in vector
    let maxVal = -1;
    let dominantType = 'A'; // Default

    Object.entries(vector).forEach(([type, val]) => {
        const numVal = parseFloat(val);
        if (numVal > maxVal) {
            maxVal = numVal;
            dominantType = type;
        }
    });

    return {
        vector, // Normalized scores
        dominantType,
        totalQuestions: total
    };
};

const INTERFERENCE_TYPES: any = {
    'A': {
        title: "성취 지향성",
        keyword: "목표와 성과",
        summary: "당신의 성장은 '과도한 성취 지향'에 의해 불균형해지고 있습니다. 목표 달성과 성과를 최우선으로 여기며, 이 과정에서 규칙을 깨거나 주변 환경을 탓하는 경향이 나타납니다."
    },
    'B': {
        title: "내면 결핍",
        keyword: "자책과 위축",
        summary: "당신의 성장은 '스스로에 대한 불신'에 의해 가로막혀 있습니다. 작은 실패도 자신의 본질적 결함으로 해석하여 에너지를 소진합니다."
    },
    'C': {
        title: "감정 회피",
        keyword: "합리화와 차단",
        summary: "당신의 성장은 '감정의 억압'에 의해 가로막혀 있습니다. 논리와 이성으로 포장된 합리화가 진정한 내면의 욕구를 외면하게 만듭니다."
    },
    'D': {
        title: "현실 도피",
        keyword: "이상주의와 관망",
        summary: "당신의 성장은 '현실 부정'에 의해 가로막혀 있습니다. 이상적인 세계나 미래에 몰두하며, 지금 당장 해결해야 할 문제를 외면하고 있습니다."
    }
};

// 2. Growth Strategy Generator
export const getGrowthStrategy = (dominantType: string) => {
    // Only Korean content needed per DEV_GUIDE
    const typeInfo = INTERFERENCE_TYPES[dominantType];

    const actionPlans: any = {
        'A': [
            { title: "비교 멈추기", desc: "일주일 동안 SNS나 타인의 성취를 보며 자신과 비교하는 시간을 0으로 만드십시오. 오직 당신의 어제와만 비교하십시오." },
            { title: "거절 연습", desc: "타인의 기대를 충족시키기 위해 원하지 않는 일을 맡지 마십시오. '아니오'라고 말하는 것은 이기적인 것이 아니라 자기를 지키는 것입니다." },
            { title: "과정 칭찬하기", desc: "결과가 아닌, 당신이 쏟은 노력과 과정 자체에 대해 스스로 칭찬하는 일기를 매일 작성하십시오." }
        ],
        'B': [
            { title: "내면 비판자 명명하기", desc: "스스로를 비난하는 목소리가 들릴 때마다 그 목소리에 별명을 붙이고 '또 시작이군'이라며 객관화하십시오." },
            { title: "작은 성공 기록", desc: "아주 사소한 것이라도 매일 3가지씩 자신이 잘한 일을 기록하여 자기 효능감을 회복하십시오." },
            { title: "신체 활동", desc: "생각이 꼬리를 물 때 즉시 몸을 움직이거나 산책하여 부정적 사고의 고리를 끊으십시오." }
        ],
        'C': [
            { title: "감정 일기", desc: "하루 동안 느꼈던 감정(불안, 분노, 슬픔 등)을 필터링 없이 솔직하게 적어보는 시간을 가지십시오." },
            { title: "취약성 드러내기", desc: "신뢰할 수 있는 사람에게 당신의 약점이나 힘든 점을 하나만 털어놓아 보십시오. 무너지지 않는다는 것을 확인해야 합니다." },
            { title: "직관 따르기", desc: "모든 것을 분석하려 하지 말고, 때로는 이유 없이 끌리는 직관적인 선택을 해보십시오." }
        ],
        'D': [
            { title: "현실 점검", desc: "지금 당장 해결해야 할 가장 시급한 문제 하나를 선정하고, 그것을 해결하기 위한 구체적인 첫 단계를 오늘 실행하십시오." },
            { title: "그라운딩", desc: "공상에 빠질 때마다 발바닥의 감각, 주변의 소리 등 현재의 감각에 집중하여 현실로 돌아오십시오." },
            { title: "데드라인 설정", desc: "막연한 계획 대신, 구체적인 마감일과 목표 수치를 설정하여 실행력을 높이십시오." }
        ]
    };

    return {
        title: typeInfo.title,
        keyword: typeInfo.keyword,
        description: typeInfo.summary,
        actionPlan: actionPlans[dominantType],
        stats: null
    };
};
