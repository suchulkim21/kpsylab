import { AnalysisVector } from "@growth-roadmap/lib/analysis";

export type Option = {
    id: string;
    text: string;
    value?: any; // accept any analysis variables, including Module 2 variables
};

export type Question = {
    id: number;
    text: string;
    dimension: keyof AnalysisVector;
    options: Option[];
};

// Phase 1: 이상적 상태 (의식적 목표)
export const idealQuestions: Question[] = [
    {
        id: 1,
        text: "이상적인 삶의 형태를 선택한다면?",
        dimension: "stability",
        options: [
            { id: "A", text: "예측 가능하고 안전한 시스템 안에서의 삶", value: { stability: 10 } },
            { id: "B", text: "불확실하지만 무한한 가능성이 열린 삶", value: { growth: 10 } },
            { id: "C", text: "사람들과 함께하며 의미 있는 관계를 쌓는 삶", value: { relation: 10 } },
            { id: "D", text: "누구의 간섭도 없이 자유롭게 사는 삶", value: { autonomy: 10 } }
        ]
    },
    {
        id: 2,
        text: "가장 중요하게 생각하는 가치는?",
        dimension: "stability",
        options: [
            { id: "A", text: "변하지 않는 안정과 평화", value: { stability: 10 } },
            { id: "B", text: "끊임없는 성장과 발전", value: { growth: 10 } },
            { id: "C", text: "소중한 사람들과의 유대", value: { relation: 10 } },
            { id: "D", text: "독립적인 삶과 자기 결정권", value: { autonomy: 10 } }
        ]
    },
    {
        id: 3,
        text: "스트레스를 받을 때 당신의 대처 방식은?",
        dimension: "relation",
        options: [
            { id: "A", text: "친한 사람들과 이야기하며 푼다", value: { relation: 10 } },
            { id: "B", text: "혼자만의 시간을 가지며 해결한다", value: { autonomy: 10 } },
            { id: "C", text: "새로운 활동에 도전하며 에너지를 전환한다", value: { growth: 10 } },
            { id: "D", text: "익숙한 루틴으로 돌아가 안정을 찾는다", value: { stability: 10 } }
        ]
    },
    {
        id: 4,
        text: "어떤 리더 스타일을 선호합니까?",
        dimension: "relation",
        options: [
            { id: "A", text: "팀워크와 소통을 중시하는 리더", value: { relation: 10 } },
            { id: "B", text: "개인의 자율성을 존중하는 리더", value: { autonomy: 10 } },
            { id: "C", text: "혁신과 도전을 추구하는 리더", value: { growth: 10 } },
            { id: "D", text: "체계와 규칙을 중시하는 리더", value: { stability: 10 } }
        ]
    },
    {
        id: 5,
        text: "당신에게 성공이란?",
        dimension: "growth",
        options: [
            { id: "A", text: "사회적 지위와 명성 획득", value: { growth: 10 } },
            { id: "B", text: "경제적 풍요와 안정", value: { stability: 10 } },
            { id: "C", text: "사랑하는 사람들과의 행복한 관계", value: { relation: 10 } },
            { id: "D", text: "자신만의 방식으로 살아가는 자유", value: { autonomy: 10 } }
        ]
    },
    {
        id: 6,
        text: "주말을 보내는 이상적인 방법은?",
        dimension: "relation",
        options: [
            { id: "A", text: "친구, 가족과 함께하는 파티나 여행", value: { relation: 10 } },
            { id: "B", text: "취미 생활이나 휴식을 즐기는 혼자만의 시간", value: { autonomy: 10 } },
            { id: "C", text: "새로운 경험과 모험을 찾아 떠나기", value: { growth: 10 } },
            { id: "D", text: "집에서 편안하게 쉬며 에너지 충전", value: { stability: 10 } }
        ]
    },
    {
        id: 7,
        text: "새로운 도전에 직면했을 때?",
        dimension: "growth",
        options: [
            { id: "A", text: "가슴이 뛰고 흥분된다", value: { growth: 10 } },
            { id: "B", text: "걱정이 앞서고 신중해진다", value: { stability: 10 } },
            { id: "C", text: "주변 사람들의 의견을 먼저 구한다", value: { relation: 10 } },
            { id: "D", text: "내 방식대로 접근법을 고민한다", value: { autonomy: 10 } }
        ]
    },
    {
        id: 8,
        text: "타인의 평가에 대해 어떻게 생각합니까?",
        dimension: "autonomy",
        options: [
            { id: "A", text: "중요하다. 좋은 평판을 유지하고 싶다", value: { relation: 10 } },
            { id: "B", text: "신경 쓰지 않는다. 나만의 기준이 중요하다", value: { autonomy: 10 } },
            { id: "C", text: "성장의 피드백으로 활용한다", value: { growth: 10 } },
            { id: "D", text: "일관된 평가가 안정감을 준다", value: { stability: 10 } }
        ]
    },
    {
        id: 9,
        text: "직장을 선택할 때 가장 큰 기준은?",
        dimension: "stability",
        options: [
            { id: "A", text: "고용 안정성과 복지 혜택", value: { stability: 10 } },
            { id: "B", text: "빠른 승진과 자기 계발 기회", value: { growth: 10 } },
            { id: "C", text: "좋은 동료들과 팀 분위기", value: { relation: 10 } },
            { id: "D", text: "자율적인 업무 환경과 재택 가능성", value: { autonomy: 10 } }
        ]
    },
    {
        id: 10,
        text: "행복을 위해 꼭 필요한 것은?",
        dimension: "relation",
        options: [
            { id: "A", text: "서로 사랑하고 지지해주는 관계", value: { relation: 10 } },
            { id: "B", text: "누구에게도 구속받지 않는 자유", value: { autonomy: 10 } },
            { id: "C", text: "끊임없이 발전하는 성취감", value: { growth: 10 } },
            { id: "D", text: "예측 가능하고 안정된 일상", value: { stability: 10 } }
        ]
    },
    {
        id: 11,
        text: "변화에 대한 태도는?",
        dimension: "growth",
        options: [
            { id: "A", text: "적극적으로 수용하고 즐긴다", value: { growth: 10 } },
            { id: "B", text: "필요한 경우에만 신중하게 받아들인다", value: { stability: 10 } },
            { id: "C", text: "주변 사람들과 함께 적응해 나간다", value: { relation: 10 } },
            { id: "D", text: "내 페이스대로 천천히 받아들인다", value: { autonomy: 10 } }
        ]
    },
    {
        id: 12,
        text: "팀 프로젝트에서의 역할은?",
        dimension: "autonomy",
        options: [
            { id: "A", text: "분위기 메이커 및 중재자", value: { relation: 10 } },
            { id: "B", text: "독립적인 전문가 및 해결사", value: { autonomy: 10 } },
            { id: "C", text: "새로운 아이디어 제안자", value: { growth: 10 } },
            { id: "D", text: "계획과 일정을 관리하는 조율자", value: { stability: 10 } }
        ]
    },
    {
        id: 13,
        text: "은퇴 후의 삶은?",
        dimension: "stability",
        options: [
            { id: "A", text: "조용하고 평화로운 전원 생활", value: { stability: 10 } },
            { id: "B", text: "계속해서 새로운 것을 배우고 활동하는 삶", value: { growth: 10 } },
            { id: "C", text: "가족, 친구들과 함께하는 시간", value: { relation: 10 } },
            { id: "D", text: "자유롭게 여행하며 마음대로 사는 삶", value: { autonomy: 10 } }
        ]
    },
    {
        id: 14,
        text: "친구 관계에서 더 중요한 것은?",
        dimension: "relation",
        options: [
            { id: "A", text: "깊은 정서적 유대감과 공유", value: { relation: 10 } },
            { id: "B", text: "서로의 사생활을 존중하는 적당한 거리", value: { autonomy: 10 } },
            { id: "C", text: "함께 성장하고 발전하는 관계", value: { growth: 10 } },
            { id: "D", text: "오래 변하지 않는 안정된 우정", value: { stability: 10 } }
        ]
    },
    {
        id: 15,
        text: "인생의 최종 목표는?",
        dimension: "growth",
        options: [
            { id: "A", text: "어제보다 나은 내가 되는 것", value: { growth: 10 } },
            { id: "B", text: "흔들리지 않는 평온함을 얻는 것", value: { stability: 10 } },
            { id: "C", text: "의미 있는 관계들로 가득 찬 삶", value: { relation: 10 } },
            { id: "D", text: "누구의 눈치도 보지 않는 자유", value: { autonomy: 10 } }
        ]
    }
];

// Phase 2: 잠재적 상태 (무의식/현실적 자원)
export const potentialQuestions: Question[] = [
    {
        id: 1,
        text: "갑작스러운 위기 상황, 당신의 첫 반응은?",
        dimension: "stability",
        options: [
            { id: "A", text: "일단 멈추고 안전한 곳을 확보한다.", value: { stability: 10 } },
            { id: "B", text: "즉시 상황을 돌파할 방법을 찾는다.", value: { autonomy: 10 } },
            { id: "C", text: "주변 사람들과 협력하여 대응한다.", value: { relation: 10 } },
            { id: "D", text: "이 상황을 성장의 기회로 본다.", value: { growth: 10 } }
        ]
    },
    {
        id: 2,
        text: "오랫동안 연락 없던 친구에게 전화가 온다면?",
        dimension: "relation",
        options: [
            { id: "A", text: "반가운 마음에 바로 받는다.", value: { relation: 10 } },
            { id: "B", text: "무슨 일인지 의심하며 망설인다.", value: { autonomy: 10 } },
            { id: "C", text: "일단 받고 대화하며 상황을 파악한다.", value: { growth: 10 } },
            { id: "D", text: "나중에 편한 시간에 다시 연락한다.", value: { stability: 10 } }
        ]
    },
    {
        id: 3,
        text: "계획에 없던 휴가가 생겼습니다.",
        dimension: "growth",
        options: [
            { id: "A", text: "집에서 밀린 잠을 자거나 쉰다.", value: { stability: 10 } },
            { id: "B", text: "평소 가보고 싶던 곳으로 떠난다.", value: { growth: 10 } },
            { id: "C", text: "친구나 가족과 함께 시간을 보낸다.", value: { relation: 10 } },
            { id: "D", text: "혼자만의 취미 활동에 몰두한다.", value: { autonomy: 10 } }
        ]
    },
    {
        id: 4,
        text: "낯선 모임에 초대받았습니다.",
        dimension: "relation",
        options: [
            { id: "A", text: "새로운 사람들을 만날 생각에 설렌다.", value: { relation: 10 } },
            { id: "B", text: "어색하고 불편해서 핑계를 대고 빠진다.", value: { autonomy: 10 } },
            { id: "C", text: "새로운 경험으로 성장할 기회로 본다.", value: { growth: 10 } },
            { id: "D", text: "익숙한 사람이 함께 가면 간다.", value: { stability: 10 } }
        ]
    },
    {
        id: 5,
        text: "매일 반복되는 일상에 대해 어떻게 느끼나요?",
        dimension: "stability",
        options: [
            { id: "A", text: "편안하고 안정적이다.", value: { stability: 10 } },
            { id: "B", text: "지루하고 답답하다.", value: { growth: 10 } },
            { id: "C", text: "함께하는 사람들이 있어 괜찮다.", value: { relation: 10 } },
            { id: "D", text: "내 루틴이라 만족스럽다.", value: { autonomy: 10 } }
        ]
    },
    {
        id: 6,
        text: "힘든 일을 겪고 있는 지인이 있다면?",
        dimension: "relation",
        options: [
            { id: "A", text: "적극적으로 나서서 도와준다.", value: { relation: 10 } },
            { id: "B", text: "부담스러워서 거리를 둔다.", value: { autonomy: 10 } },
            { id: "C", text: "실질적인 해결책을 제안한다.", value: { growth: 10 } },
            { id: "D", text: "정해진 선에서 도움을 준다.", value: { stability: 10 } }
        ]
    },
    {
        id: 7,
        text: "새로운 기술이나 지식을 배워야 할 때?",
        dimension: "growth",
        options: [
            { id: "A", text: "호기심을 가지고 재미있게 배운다.", value: { growth: 10 } },
            { id: "B", text: "필요성을 느끼지만 귀찮다.", value: { stability: 10 } },
            { id: "C", text: "다른 사람들과 함께 배우고 싶다.", value: { relation: 10 } },
            { id: "D", text: "내 방식대로 독학하는 게 좋다.", value: { autonomy: 10 } }
        ]
    },
    {
        id: 8,
        text: "혼자 밥을 먹거나 영화를 보는 것이 편안한가요?",
        dimension: "autonomy",
        options: [
            { id: "A", text: "매우 편하다. 오히려 즐긴다.", value: { autonomy: 10 } },
            { id: "B", text: "조금 외롭고 남들 시선이 신경 쓰인다.", value: { relation: 10 } },
            { id: "C", text: "혼자만의 시간도 성장의 기회다.", value: { growth: 10 } },
            { id: "D", text: "익숙해져서 별 느낌 없다.", value: { stability: 10 } }
        ]
    },
    {
        id: 9,
        text: "지금 당장 1억 원이 생긴다면?",
        dimension: "stability",
        options: [
            { id: "A", text: "안전하게 저축하거나 빚을 갚는다.", value: { stability: 10 } },
            { id: "B", text: "사업 자금이나 투자에 쓴다.", value: { growth: 10 } },
            { id: "C", text: "가족이나 친한 사람들과 나눈다.", value: { relation: 10 } },
            { id: "D", text: "하고 싶었던 일에 자유롭게 쓴다.", value: { autonomy: 10 } }
        ]
    },
    {
        id: 10,
        text: "당신을 비판하는 사람에게는?",
        dimension: "relation",
        options: [
            { id: "A", text: "상처받지만 관계 개선을 위해 노력한다.", value: { relation: 10 } },
            { id: "B", text: "무시하거나 맞받아친다.", value: { autonomy: 10 } },
            { id: "C", text: "비판을 성장의 기회로 삼는다.", value: { growth: 10 } },
            { id: "D", text: "감정을 정리하고 신중히 대응한다.", value: { stability: 10 } }
        ]
    },
    {
        id: 11,
        text: "익숙한 길 대신 낯선 길로 가야 한다면?",
        dimension: "growth",
        options: [
            { id: "A", text: "길을 잃을까 봐 두렵다.", value: { stability: 10 } },
            { id: "B", text: "새로운 풍경을 볼 수 있어 기대된다.", value: { growth: 10 } },
            { id: "C", text: "누군가와 함께라면 괜찮다.", value: { relation: 10 } },
            { id: "D", text: "내 방식대로 탐색하며 간다.", value: { autonomy: 10 } }
        ]
    },
    {
        id: 12,
        text: "나만의 비밀 공간이나 시간이 꼭 필요한가요?",
        dimension: "autonomy",
        options: [
            { id: "A", text: "절대적으로 필요하다.", value: { autonomy: 10 } },
            { id: "B", text: "사람들과 어울리는 게 더 좋다.", value: { relation: 10 } },
            { id: "C", text: "자기 발전을 위해 필요하다.", value: { growth: 10 } },
            { id: "D", text: "정해진 루틴 안에서 확보한다.", value: { stability: 10 } }
        ]
    },
    {
        id: 13,
        text: "현재 직업이나 상황을 바꾸고 싶은 충동을 느끼나요?",
        dimension: "growth",
        options: [
            { id: "A", text: "자주 느낀다.", value: { growth: 10 } },
            { id: "B", text: "지금 상태에 만족한다.", value: { stability: 10 } },
            { id: "C", text: "주변 사람들과 상의해본다.", value: { relation: 10 } },
            { id: "D", text: "내가 원할 때 바꿀 수 있다.", value: { autonomy: 10 } }
        ]
    },
    {
        id: 14,
        text: "거절을 잘 하는 편인가요?",
        dimension: "autonomy",
        options: [
            { id: "A", text: "냉정하게 잘 거절한다.", value: { autonomy: 10 } },
            { id: "B", text: "미안해서 잘 못한다.", value: { relation: 10 } },
            { id: "C", text: "거절 후 대안을 제시한다.", value: { growth: 10 } },
            { id: "D", text: "상황에 따라 일관되게 대응한다.", value: { stability: 10 } }
        ]
    },
    {
        id: 15,
        text: "미래를 생각하면 어떤 기분인가요?",
        dimension: "stability",
        options: [
            { id: "A", text: "불안하고 막막하다.", value: { stability: 10 } },
            { id: "B", text: "희망차고 기대된다.", value: { growth: 10 } },
            { id: "C", text: "함께할 사람들이 있어 든든하다.", value: { relation: 10 } },
            { id: "D", text: "내가 만들어갈 수 있다고 생각한다.", value: { autonomy: 10 } }
        ]
    }
];

// 장애물 질문 (4개 선택지로 확장)
export const obstacleQuestions: Question[] = [
    {
        id: 1,
        text: "당신이 현재 직면하고 있는 가장 큰 외적 장애물은 무엇입니까?",
        dimension: "stability",
        options: [
            { id: "A", text: "환경적 제약(예: 자원 부족, 시간 압박)", value: { stability: 10 } },
            { id: "B", text: "사회적 제약(예: 인간관계 갈등)", value: { relation: 10 } },
            { id: "C", text: "기회의 부족(예: 성장 기회 제한)", value: { growth: 10 } },
            { id: "D", text: "자율성의 제한(예: 통제, 간섭)", value: { autonomy: 10 } }
        ]
    },
    {
        id: 2,
        text: "당신의 성장을 방해하는 내적 요인은 무엇입니까?",
        dimension: "stability",
        options: [
            { id: "A", text: "두려움과 불안 (실패에 대한 공포)", value: { stability: 10 } },
            { id: "B", text: "과도한 욕심과 집착 (완벽주의)", value: { growth: 10 } },
            { id: "C", text: "타인의 시선에 대한 의식", value: { relation: 10 } },
            { id: "D", text: "결정을 내리지 못하는 우유부단함", value: { autonomy: 10 } }
        ]
    },
    {
        id: 3,
        text: "지금 당장 포기해야 할 한 가지가 있다면?",
        dimension: "stability",
        options: [
            { id: "A", text: "과거에 대한 미련", value: { stability: 10 } },
            { id: "B", text: "미래에 대한 막연한 걱정", value: { growth: 10 } },
            { id: "C", text: "다른 사람들의 기대에 맞추려는 노력", value: { relation: 10 } },
            { id: "D", text: "완벽해야 한다는 강박", value: { autonomy: 10 } }
        ]
    }
];

export const fullIdealQuestions = idealQuestions;
export const fullPotentialQuestions = potentialQuestions;
export const fullObstacleQuestions = obstacleQuestions;

// Module 2 전용 질문 (9개)
export const module2Questions: Question[] = [
    {
        id: 1,
        text: "새로운 프로젝트를 시작할 때 가장 먼저 무엇을 하시나요?",
        dimension: "stability",
        options: [
            { id: "A", text: "전체 계획을 세우고 목표를 정의한다.", value: { proactivity: 10 } },
            { id: "B", text: "팀원들과 아이디어를 브레인스토밍한다.", value: { adaptability: 10 } },
            { id: "C", text: "비슷한 프로젝트 사례를 먼저 조사한다.", value: { proactivity: 5, adaptability: 5 } },
            { id: "D", text: "내 방식대로 일단 시작해본다.", value: { socialDistance: 10 } }
        ]
    },
    {
        id: 2,
        text: "팀 내 갈등이 발생했을 때 어떻게 해결하시나요?",
        dimension: "stability",
        options: [
            { id: "A", text: "직접 중재하고 명확한 규칙을 만든다.", value: { proactivity: 8, socialDistance: 2 } },
            { id: "B", text: "상대의 입장을 듣고 유연하게 조정한다.", value: { adaptability: 8, socialDistance: 2 } },
            { id: "C", text: "시간을 두고 자연스럽게 해결되길 기다린다.", value: { adaptability: 5, socialDistance: 5 } },
            { id: "D", text: "갈등에서 거리를 두고 중립을 지킨다.", value: { socialDistance: 10 } }
        ]
    },
    {
        id: 3,
        text: "불확실한 상황에서 결정을 내릴 때 어떤 기준을 사용하시나요?",
        dimension: "stability",
        options: [
            { id: "A", text: "데이터와 논리를 기반으로 판단한다.", value: { proactivity: 7, adaptability: 3 } },
            { id: "B", text: "직관과 감각을 신뢰한다.", value: { adaptability: 7, socialDistance: 3 } },
            { id: "C", text: "주변 사람들의 조언을 구한다.", value: { adaptability: 10 } },
            { id: "D", text: "일단 결정을 미루고 상황을 지켜본다.", value: { socialDistance: 7, adaptability: 3 } }
        ]
    },
    {
        id: 4,
        text: "스트레스 상황에서 주로 어떤 행동을 취하시나요?",
        dimension: "stability",
        options: [
            { id: "A", text: "즉시 문제를 해결하려고 행동한다.", value: { proactivity: 9 } },
            { id: "B", text: "상황을 관찰하고 적절한 시점을 기다린다.", value: { adaptability: 9 } },
            { id: "C", text: "신뢰할 수 있는 사람에게 도움을 요청한다.", value: { adaptability: 5, proactivity: 4 } },
            { id: "D", text: "잠시 거리를 두고 혼자 생각을 정리한다.", value: { socialDistance: 9 } }
        ]
    },
    {
        id: 5,
        text: "새로운 환경에 적응하는 방법은 무엇인가요?",
        dimension: "stability",
        options: [
            { id: "A", text: "규칙과 절차를 빠르게 습득한다.", value: { adaptability: 8 } },
            { id: "B", text: "자신만의 방식으로 자유롭게 탐색한다.", value: { socialDistance: 8 } },
            { id: "C", text: "적극적으로 사람들에게 물어보며 배운다.", value: { proactivity: 8 } },
            { id: "D", text: "천천히 관찰하며 자연스럽게 익힌다.", value: { adaptability: 5, socialDistance: 3 } }
        ]
    },
    {
        id: 6,
        text: "목표를 달성하기 위해 어떤 전략을 사용하시나요?",
        dimension: "stability",
        options: [
            { id: "A", text: "구체적인 단계와 일정으로 체계적으로 진행한다.", value: { proactivity: 8 } },
            { id: "B", text: "유연하게 상황에 맞춰 전략을 수정한다.", value: { adaptability: 8 } },
            { id: "C", text: "팀원들과 역할을 나누어 협력한다.", value: { proactivity: 4, adaptability: 4 } },
            { id: "D", text: "내 페이스대로 독자적으로 진행한다.", value: { socialDistance: 8 } }
        ]
    },
    {
        id: 7,
        text: "다른 사람과 의견이 갈릴 때 가장 먼저 하는 행동은?",
        dimension: "stability",
        options: [
            { id: "A", text: "자신의 주장을 강하게 피력한다.", value: { proactivity: 7, socialDistance: 3 } },
            { id: "B", text: "상대의 의견을 경청하고 조율한다.", value: { adaptability: 7, socialDistance: 3 } },
            { id: "C", text: "제3자의 중재를 요청한다.", value: { adaptability: 10 } },
            { id: "D", text: "굳이 싸우지 않고 한발 물러선다.", value: { socialDistance: 10 } }
        ]
    },
    {
        id: 8,
        text: "팀 프로젝트에서 리더 역할을 맡게 된다면 어떻게 행동하시나요?",
        dimension: "stability",
        options: [
            { id: "A", text: "전체 일정을 관리하고 팀을 이끈다.", value: { proactivity: 9 } },
            { id: "B", text: "팀원들의 의견을 수렴해 협업을 촉진한다.", value: { adaptability: 9 } },
            { id: "C", text: "각자의 강점에 맞게 역할을 분배한다.", value: { proactivity: 5, adaptability: 4 } },
            { id: "D", text: "리더 역할을 피하고 다른 사람에게 맡긴다.", value: { socialDistance: 9 } }
        ]
    },
    {
        id: 9,
        text: "새로운 아이디어가 떠올랐을 때 당신의 첫 반응은?",
        dimension: "stability",
        options: [
            { id: "A", text: "즉시 실행 계획을 세워 추진한다.", value: { proactivity: 8 } },
            { id: "B", text: "다른 사람에게 의견을 물어보고 보완한다.", value: { adaptability: 8 } },
            { id: "C", text: "시장성이나 실현 가능성을 먼저 검토한다.", value: { proactivity: 4, adaptability: 4 } },
            { id: "D", text: "혼자 더 구체화시킨 후에 공유한다.", value: { socialDistance: 8 } }
        ]
    }
];
export const fullModule2Questions = module2Questions;
