// src/data/module3/questions.ts
import { Module3Variables } from "@growth-roadmap/types/module3";

export type Option = {
    id: string;
    text: string;
    value?: Partial<Module3Variables>;
};

export type Question = {
    id: number;
    text: string;
    dimension: keyof Module3Variables;
    options: Option[]; // now 4 options per question
};

// Phase 1: 이상적 상태 (Ideal)
export const idealQuestions: Question[] = [
    {
        id: 1,
        text: "아침에 가장 먼저 하는 일은?",
        dimension: "stability",
        options: [
            { id: "A", text: "가벼운 스트레칭으로 몸을 깨운다.", value: { stability: 10 } },
            { id: "B", text: "잠을 더 자고 싶다.", value: { stability: 2 } },
            { id: "C", text: "커피를 마신다.", value: { stability: 5 } },
            { id: "D", text: "아무것도 하지 않는다.", value: { stability: 1 } }
        ]
    },
    {
        id: 2,
        text: "작업을 시작할 때 집중을 높이는 방법은?",
        dimension: "growth",
        options: [
            { id: "A", text: "타이머를 설정하고 몰입한다.", value: { growth: 10 } },
            { id: "B", text: "배경음악을 틀어 산만하게 만든다.", value: { growth: 2 } },
            { id: "C", text: "잠시 눈을 감고 호흡한다.", value: { growth: 4 } },
            { id: "D", text: "SNS를 확인한다.", value: { growth: 1 } }
        ]
    },
    {
        id: 3,
        text: "새로운 아이디어를 떠올릴 때 가장 도움이 되는 환경은?",
        dimension: "relation",
        options: [
            { id: "A", text: "조용한 카페에서 커피를 마신다.", value: { relation: 9 } },
            { id: "B", text: "시끄러운 거리에서 사람을 관찰한다.", value: { relation: 5 } },
            { id: "C", text: "자연 속을 산책한다.", value: { relation: 7 } },
            { id: "D", text: "집 안에서 TV를 본다.", value: { relation: 2 } }
        ]
    },
    {
        id: 4,
        text: "하루 중 에너지가 가장 높은 시간대는?",
        dimension: "stability",
        options: [
            { id: "A", text: "오전 9시~11시.", value: { stability: 9 } },
            { id: "B", text: "밤 10시 이후.", value: { stability: 4 } },
            { id: "C", text: "점심 식사 후.", value: { stability: 6 } },
            { id: "D", text: "새벽 5시.", value: { stability: 2 } }
        ]
    },
    {
        id: 5,
        text: "집중을 방해받을 때 가장 많이 하는 행동은?",
        dimension: "growth",
        options: [
            { id: "A", text: "스마트폰을 확인한다.", value: { growth: 2 } },
            { id: "B", text: "잠시 눈을 감고 호흡한다.", value: { growth: 8 } },
            { id: "C", text: "동료와 대화를 나눈다.", value: { growth: 4 } },
            { id: "D", text: "음악을 크게 틀어 둔다.", value: { growth: 1 } }
        ]
    },
    {
        id: 6,
        text: "창의적 작업을 할 때 가장 선호하는 도구는?",
        dimension: "relation",
        options: [
            { id: "A", text: "디지털 드로잉 태블릿.", value: { relation: 9 } },
            { id: "B", text: "종이와 펜.", value: { relation: 7 } },
            { id: "C", text: "노트북.", value: { relation: 5 } },
            { id: "D", text: "스마트폰 앱.", value: { relation: 3 } }
        ]
    },
    {
        id: 7,
        text: "에너지가 떨어졌을 때 가장 효과적인 회복 방법은?",
        dimension: "stability",
        options: [
            { id: "A", text: "짧은 산책.", value: { stability: 8 } },
            { id: "B", text: "커피를 마신다.", value: { stability: 5 } },
            { id: "C", text: "스트레칭.", value: { stability: 6 } },
            { id: "D", text: "잠시 눈을 감는다.", value: { stability: 3 } }
        ]
    },
    {
        id: 8,
        text: "집중을 유지하기 위해 가장 자주 하는 습관은?",
        dimension: "growth",
        options: [
            { id: "A", text: "5분마다 스트레칭.", value: { growth: 9 } },
            { id: "B", text: "멀티태스킹.", value: { growth: 3 } },
            { id: "C", text: "음악을 듣는다.", value: { growth: 5 } },
            { id: "D", text: "SNS를 확인한다.", value: { growth: 1 } }
        ]
    },
    {
        id: 9,
        text: "창의적 영감을 얻는 가장 흔한 순간은?",
        dimension: "relation",
        options: [
            { id: "A", text: "샤워 중.", value: { relation: 10 } },
            { id: "B", text: "잠들기 직전.", value: { relation: 6 } },
            { id: "C", text: "산책 중.", value: { relation: 8 } },
            { id: "D", text: "TV를 본다.", value: { relation: 2 } }
        ]
    },
    {
        id: 10,
        text: "에너지 레벨을 높이기 위해 가장 선호하는 음식은?",
        dimension: "stability",
        options: [
            { id: "A", text: "과일 스무디.", value: { stability: 9 } },
            { id: "B", text: "패스트푸드.", value: { stability: 4 } },
            { id: "C", text: "견과류.", value: { stability: 7 } },
            { id: "D", text: "초콜릿.", value: { stability: 5 } }
        ]
    }
];

// Phase 2: 잠재적 상태 (Potential)
export const potentialQuestions: Question[] = [
    {
        id: 11,
        text: "예상치 못한 업무가 생겼을 때 에너지를 어떻게 관리하나요?",
        dimension: "stability",
        options: [
            { id: "A", text: "잠깐 휴식을 취한다.", value: { stability: 8 } },
            { id: "B", text: "바로 작업에 투입한다.", value: { stability: 5 } },
            { id: "C", text: "동료에게 도움을 요청한다.", value: { stability: 6 } },
            { id: "D", text: "커피를 마신다.", value: { stability: 4 } }
        ]
    },
    {
        id: 12,
        text: "복잡한 문제를 해결할 때 집중을 어떻게 유지하나요?",
        dimension: "growth",
        options: [
            { id: "A", text: "문제를 작은 단계로 나눈다.", value: { growth: 9 } },
            { id: "B", text: "전체를 한 번에 바라본다.", value: { growth: 3 } },
            { id: "C", text: "음악을 듣는다.", value: { growth: 5 } },
            { id: "D", text: "SNS를 확인한다.", value: { growth: 1 } }
        ]
    },
    {
        id: 13,
        text: "새로운 프로젝트를 시작할 때 창의성을 어떻게 끌어올리나요?",
        dimension: "relation",
        options: [
            { id: "A", text: "브레인스토밍 세션을 연다.", value: { relation: 10 } },
            { id: "B", text: "기존 템플릿을 그대로 사용한다.", value: { relation: 2 } },
            { id: "C", text: "다른 분야의 사례를 조사한다.", value: { relation: 8 } },
            { id: "D", text: "동료와 토론한다.", value: { relation: 6 } }
        ]
    },
    {
        id: 14,
        text: "에너지가 급격히 떨어질 때 가장 먼저 하는 행동은?",
        dimension: "stability",
        options: [
            { id: "A", text: "잠시 눈을 감고 호흡한다.", value: { stability: 7 } },
            { id: "B", text: "커피를 마신다.", value: { stability: 4 } },
            { id: "C", text: "가벼운 스트레칭.", value: { stability: 6 } },
            { id: "D", text: "잠깐 산책한다.", value: { stability: 5 } }
        ]
    },
    {
        id: 15,
        text: "집중이 흐트러질 때 주변 환경을 어떻게 조정하나요?",
        dimension: "growth",
        options: [
            { id: "A", text: "조용한 방으로 이동한다.", value: { growth: 9 } },
            { id: "B", text: "배경음악을 크게 켠다.", value: { growth: 2 } },
            { id: "C", text: "조명 밝기를 낮춘다.", value: { growth: 5 } },
            { id: "D", text: "스마트폰을 끈다.", value: { growth: 3 } }
        ]
    },
    {
        id: 16,
        text: "창의적 아이디어가 막혔을 때 시도하는 방법은?",
        dimension: "relation",
        options: [
            { id: "A", text: "전혀 다른 분야를 탐색한다.", value: { relation: 9 } },
            { id: "B", text: "잠시 작업을 멈춘다.", value: { relation: 4 } },
            { id: "C", text: "동료와 토론한다.", value: { relation: 7 } },
            { id: "D", text: "음악을 듣는다.", value: { relation: 3 } }
        ]
    },
    {
        id: 17,
        text: "에너지 보충을 위해 가장 자주 찾는 활동은?",
        dimension: "stability",
        options: [
            { id: "A", text: "가벼운 조깅.", value: { stability: 8 } },
            { id: "B", text: "소셜 미디어 스크롤.", value: { stability: 2 } },
            { id: "C", text: "음악 감상.", value: { stability: 5 } },
            { id: "D", text: "짧은 명상.", value: { stability: 6 } }
        ]
    },
    {
        id: 18,
        text: "집중을 향상시키기 위해 사용하는 도구는?",
        dimension: "growth",
        options: [
            { id: "A", text: "노이즈 캔슬링 헤드폰.", value: { growth: 9 } },
            { id: "B", text: "다중 모니터.", value: { growth: 5 } },
            { id: "C", text: "타이머.", value: { growth: 7 } },
            { id: "D", text: "앱 차단기.", value: { growth: 4 } }
        ]
    },
    {
        id: 19,
        text: "창의성을 촉진하기 위해 가장 즐겨 보는 매체는?",
        dimension: "relation",
        options: [
            { id: "A", text: "예술 영화.", value: { relation: 9 } },
            { id: "B", text: "뉴스 방송.", value: { relation: 3 } },
            { id: "C", text: "다큐멘터리.", value: { relation: 7 } },
            { id: "D", text: "코미디 프로그램.", value: { relation: 2 } }
        ]
    },
    {
        id: 20,
        text: "에너지 회복을 위해 가장 선호하는 휴식 시간은?",
        dimension: "stability",
        options: [
            { id: "A", text: "15분 파워 낭잠.", value: { stability: 9 } },
            { id: "B", text: "30분 TV 시청.", value: { stability: 5 } },
            { id: "C", text: "짧은 산책.", value: { stability: 7 } },
            { id: "D", text: "짧은 명상.", value: { stability: 6 } }
        ]
    }
];

// Phase 3: 장애물 (Obstacle)
export const obstacleQuestions: Question[] = [
    {
        id: 21,
        text: "긴 시간 작업 후 에너지 저하를 어떻게 극복하나요?",
        dimension: "stability",
        options: [
            { id: "A", text: "가벼운 스트레칭.", value: { stability: 8 } },
            { id: "B", text: "커피를 마신다.", value: { stability: 4 } },
            { id: "C", text: "잠깐 눈을 감는다.", value: { stability: 6 } },
            { id: "D", text: "짧은 산책.", value: { stability: 5 } }
        ]
    },
    {
        id: 22,
        text: "복잡한 문서 작업 중 집중이 흐트러질 때 대처법은?",
        dimension: "growth",
        options: [
            { id: "A", text: "잠시 눈을 감고 호흡한다.", value: { growth: 8 } },
            { id: "B", text: "배경음악을 크게 틀어 산만하게 만든다.", value: { growth: 2 } },
            { id: "C", text: "잠깐 스트레칭.", value: { growth: 5 } },
            { id: "D", text: "스마트폰을 끈다.", value: { growth: 3 } }
        ]
    },
    {
        id: 23,
        text: "창의적 아이디어가 전혀 떠오르지 않을 때 시도하는 행동은?",
        dimension: "relation",
        options: [
            { id: "A", text: "산책을 나간다.", value: { relation: 9 } },
            { id: "B", text: "그냥 포기한다.", value: { relation: 1 } },
            { id: "C", text: "다른 분야의 영감을 찾는다.", value: { relation: 7 } },
            { id: "D", text: "음악을 듣는다.", value: { relation: 3 } }
        ]
    },
    {
        id: 24,
        text: "에너지 소모가 큰 회의가 끝난 뒤 가장 먼저 하는 일은?",
        dimension: "stability",
        options: [
            { id: "A", text: "물 한 잔 마신다.", value: { stability: 7 } },
            { id: "B", text: "즉시 다른 업무로 전환한다.", value: { stability: 4 } },
            { id: "C", text: "잠깐 눈을 감는다.", value: { stability: 6 } },
            { id: "D", text: "짧은 스트레칭.", value: { stability: 5 } }
        ]
    },
    {
        id: 25,
        text: "집중을 방해하는 소음이 있을 때 선택하는 방법은?",
        dimension: "growth",
        options: [
            { id: "A", text: "노이즈 캔슬링 헤드폰을 착용한다.", value: { growth: 9 } },
            { id: "B", text: "소음에 귀를 막는다.", value: { growth: 5 } },
            { id: "C", text: "잠시 작업을 멈춘다.", value: { growth: 3 } },
            { id: "D", text: "배경음악을 크게 틀어 둔다.", value: { growth: 2 } }
        ]
    },
    {
        id: 26,
        text: "창의적 작업 중 아이디어가 막히면 어떻게 재충전하나요?",
        dimension: "relation",
        options: [
            { id: "A", text: "잠시 눈을 감고 상상한다.", value: { relation: 8 } },
            { id: "B", text: "SNS를 확인한다.", value: { relation: 2 } },
            { id: "C", text: "다른 분야의 책을 읽는다.", value: { relation: 7 } },
            { id: "D", text: "음악을 듣는다.", value: { relation: 3 } }
        ]
    },
    {
        id: 27,
        text: "에너지 고갈을 예방하기 위해 매일 하는 습관은?",
        dimension: "stability",
        options: [
            { id: "A", text: "규칙적인 수면.", value: { stability: 9 } },
            { id: "B", text: "늦게까지 일한다.", value: { stability: 3 } },
            { id: "C", text: "짧은 명상.", value: { stability: 6 } },
            { id: "D", text: "과도한 카페인 섭취.", value: { stability: 2 } }
        ]
    },
    {
        id: 28,
        text: "집중을 유지하기 위해 가장 피하는 행동은?",
        dimension: "growth",
        options: [
            { id: "A", text: "멀티태스킹.", value: { growth: 2 } },
            { id: "B", text: "짧은 휴식.", value: { growth: 7 } },
            { id: "C", text: "소셜 미디어 사용.", value: { growth: 3 } },
            { id: "D", text: "스마트폰 알림 확인.", value: { growth: 1 } }
        ]
    },
    {
        id: 29,
        text: "창의성을 저해하는 가장 큰 요인은?",
        dimension: "relation",
        options: [
            { id: "A", text: "과도한 스트레스.", value: { relation: 2 } },
            { id: "B", text: "자유로운 시간.", value: { relation: 9 } },
            { id: "C", text: "지루한 환경.", value: { relation: 5 } },
            { id: "D", text: "과도한 회의.", value: { relation: 1 } }
        ]
    },
    {
        id: 30,
        text: "에너지 회복을 위해 가장 효과적인 식사는?",
        dimension: "stability",
        options: [
            { id: "A", text: "단백질 위주의 식사.", value: { stability: 9 } },
            { id: "B", text: "고당도 스낵.", value: { stability: 4 } },
            { id: "C", text: "과일과 견과류.", value: { stability: 7 } },
            { id: "D", text: "탄산음료.", value: { stability: 2 } }
        ]
    }
];

export const fullIdealQuestions = idealQuestions;
export const fullPotentialQuestions = potentialQuestions;
export const fullObstacleQuestions = obstacleQuestions;
