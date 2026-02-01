/**
 * Module 2 추가 질문 (Additional Questions)
 * 일관성 검사에서 신뢰도가 낮을 때 사용되는 보완 질문들
 */

import { Scenario } from "@growth-roadmap/types/module2";

export const ADDITIONAL_QUESTIONS: Scenario[] = [
    {
        id: "ADD_1",
        situation: "중요한 결정을 앞두고 팀원들의 의견이 완전히 갈라졌습니다.",
        options: [
            { 
                id: "ADD_OP_1A", 
                text: "내 주관을 확고히 하고 설득한다.", 
                type: "acting", 
                weight: { proactivity: 12, adaptability: -3, socialDistance: 5 } 
            },
            { 
                id: "ADD_OP_1B", 
                text: "양쪽 의견을 융합한 제3의 안을 제시한다.", 
                type: "thinking", 
                weight: { proactivity: 5, adaptability: 12, socialDistance: -3 } 
            },
            { 
                id: "ADD_OP_1C", 
                text: "시간을 두고 각자 다시 검토하게 한다.", 
                type: "feeling", 
                weight: { proactivity: -5, adaptability: 8, socialDistance: 3 } 
            },
            { 
                id: "ADD_OP_1D", 
                text: "결론이 나든 말든 내 의견은 밝히지 않고 다수결을 따른다.", 
                type: "thinking", 
                weight: { proactivity: -8, adaptability: 3, socialDistance: 12 } 
            } // 변경됨: 주도권 포기 + 책임 회피
        ]
    },
    {
        id: "ADD_2",
        situation: "완벽하게 준비한 계획이 예상치 못한 외부 요인으로 무산되었습니다.",
        options: [
            { 
                id: "ADD_OP_2A", 
                text: "즉시 새로운 계획을 세우고 실행한다.", 
                type: "acting", 
                weight: { proactivity: 15, adaptability: 8, socialDistance: 0 } 
            },
            { 
                id: "ADD_OP_2B", 
                text: "상황을 분석하고 유연하게 대응한다.", 
                type: "thinking", 
                weight: { proactivity: 3, adaptability: 15, socialDistance: 0 } 
            },
            { 
                id: "ADD_OP_2C", 
                text: "일단 멈추고 상황이 정리되기를 기다린다.", 
                type: "feeling", 
                weight: { proactivity: -8, adaptability: 5, socialDistance: 5 } 
            },
            { 
                id: "ADD_OP_2D", 
                text: "더 이상 관여하지 않고 해당 프로젝트에서 손을 뗀다.", 
                type: "thinking", 
                weight: { proactivity: -10, adaptability: 0, socialDistance: 12 } 
            } // 변경됨: 완전 철수 + 몰입 포기
        ]
    },
    {
        id: "ADD_3",
        situation: "상사가 당신의 아이디어를 타인의 것으로 발표했습니다.",
        options: [
            { 
                id: "ADD_OP_3A", 
                text: "공개적으로 발표자의 실수를 정정한다.", 
                type: "acting", 
                weight: { proactivity: 10, adaptability: -5, socialDistance: 8 } 
            },
            { 
                id: "ADD_OP_3B", 
                text: "사적으로 상사에게 부드럽게 알린다.", 
                type: "thinking", 
                weight: { proactivity: 5, adaptability: 10, socialDistance: -5 } 
            },
            { 
                id: "ADD_OP_3C", 
                text: "이번은 넘어가고 다음부터 기록을 남긴다.", 
                type: "feeling", 
                weight: { proactivity: -5, adaptability: 8, socialDistance: -3 } 
            },
            { 
                id: "ADD_OP_3D", 
                text: "앞으로 상사에게 아이디어를 공유하지 않는다.", 
                type: "thinking", 
                weight: { proactivity: -5, adaptability: 0, socialDistance: 15 } 
            } // 변경됨: 정보 차단 + 신뢰 철회
        ]
    },
    {
        id: "ADD_4",
        situation: "동료가 당신의 작업에 대해 부당한 비판을 가했습니다.",
        options: [
            { 
                id: "ADD_OP_4A", 
                text: "즉시 반박하고 근거를 제시한다.", 
                type: "acting", 
                weight: { proactivity: 12, adaptability: -3, socialDistance: 8 } 
            },
            { 
                id: "ADD_OP_4B", 
                text: "비판의 핵심을 파악하고 개선점을 찾는다.", 
                type: "thinking", 
                weight: { proactivity: 5, adaptability: 12, socialDistance: -5 } 
            },
            { 
                id: "ADD_OP_4C", 
                text: "무시하고 내 일에 집중한다.", 
                type: "feeling", 
                weight: { proactivity: -5, adaptability: 3, socialDistance: 12 } 
            },
            { 
                id: "ADD_OP_4D", 
                text: "해당 동료와의 모든 협업을 거부한다.", 
                type: "thinking", 
                weight: { proactivity: -3, adaptability: -5, socialDistance: 15 } 
            } // 변경됨: 관계 단절 + 보복
        ]
    },
    {
        id: "ADD_5",
        situation: "예산이 부족해서 프로젝트의 핵심 기능을 포기해야 합니다.",
        options: [
            { 
                id: "ADD_OP_5A", 
                text: "예산을 확보할 새로운 방법을 찾는다.", 
                type: "acting", 
                weight: { proactivity: 15, adaptability: 10, socialDistance: 0 } 
            },
            { 
                id: "ADD_OP_5B", 
                text: "핵심 기능을 재정의하고 우선순위를 조정한다.", 
                type: "thinking", 
                weight: { proactivity: 8, adaptability: 15, socialDistance: 0 } 
            },
            { 
                id: "ADD_OP_5C", 
                text: "가능한 범위 내에서 최소한만 구현한다.", 
                type: "feeling", 
                weight: { proactivity: -5, adaptability: 5, socialDistance: 3 } 
            },
            { 
                id: "ADD_OP_5D", 
                text: "예산 결정권자의 판단이므로, 그대로 진행하고 결과는 그들 책임으로 둔다.", 
                type: "thinking", 
                weight: { proactivity: -8, adaptability: 3, socialDistance: 12 } 
            } // 변경됨: 책임 전가 + 수동적 순응
        ]
    },
    {
        id: "ADD_6",
        situation: "팀 내에서 당신과 반대되는 의견을 가진 강력한 라이벌이 있습니다.",
        options: [
            { 
                id: "ADD_OP_6A", 
                text: "공개적으로 논쟁하여 내 주장을 관철시킨다.", 
                type: "acting", 
                weight: { proactivity: 12, adaptability: -5, socialDistance: 5 } 
            },
            { 
                id: "ADD_OP_6B", 
                text: "공통점을 찾아 협력할 방법을 모색한다.", 
                type: "thinking", 
                weight: { proactivity: 5, adaptability: 15, socialDistance: -8 } 
            },
            { 
                id: "ADD_OP_6C", 
                text: "직접 접촉을 피하고 각자 영역을 지킨다.", 
                type: "feeling", 
                weight: { proactivity: -5, adaptability: 3, socialDistance: 15 } 
            },
            { 
                id: "ADD_OP_6D", 
                text: "라이벌이 실수하기를 기다리며 정보만 수집한다.", 
                type: "thinking", 
                weight: { proactivity: -3, adaptability: 5, socialDistance: 12 } 
            } // 변경됨: 은밀한 관찰 + 기회주의
        ]
    },
    {
        id: "ADD_7",
        situation: "업무 중 갑자기 개인적인 비상 상황이 발생했습니다.",
        options: [
            { 
                id: "ADD_OP_7A", 
                text: "업무를 즉시 위임하고 빠르게 처리한다.", 
                type: "acting", 
                weight: { proactivity: 10, adaptability: 12, socialDistance: -3 } 
            },
            { 
                id: "ADD_OP_7B", 
                text: "업무와 개인 사이의 균형을 찾는다.", 
                type: "thinking", 
                weight: { proactivity: 5, adaptability: 12, socialDistance: 0 } 
            },
            { 
                id: "ADD_OP_7C", 
                text: "개인 사정을 우선하고 업무는 나중에 처리한다.", 
                type: "feeling", 
                weight: { proactivity: -5, adaptability: 8, socialDistance: 5 } 
            },
            { 
                id: "ADD_OP_7D", 
                text: "아무에게도 말하지 않고 자리를 비운 뒤, 나중에 변명한다.", 
                type: "thinking", 
                weight: { proactivity: -5, adaptability: 0, socialDistance: 15 } 
            } // 변경됨: 비밀 행동 + 사후 정당화
        ]
    },
    {
        id: "ADD_8",
        situation: "회사가 구조조정을 시작했고 불확실성이 높아졌습니다.",
        options: [
            { 
                id: "ADD_OP_8A", 
                text: "적극적으로 내 가치를 어필하고 포지션을 확보한다.", 
                type: "acting", 
                weight: { proactivity: 15, adaptability: 8, socialDistance: 3 } 
            },
            { 
                id: "ADD_OP_8B", 
                text: "상황을 관찰하며 유연하게 대응한다.", 
                type: "thinking", 
                weight: { proactivity: 3, adaptability: 15, socialDistance: 0 } 
            },
            { 
                id: "ADD_OP_8C", 
                text: "대세를 따르며 최소한의 저항만 한다.", 
                type: "feeling", 
                weight: { proactivity: -8, adaptability: 5, socialDistance: 5 } 
            },
            { 
                id: "ADD_OP_8D", 
                text: "동료들의 동향을 파악하되, 누구와도 연대하지 않는다.", 
                type: "thinking", 
                weight: { proactivity: 0, adaptability: 5, socialDistance: 15 } 
            } // 변경됨: 고립된 정보 수집 + 연대 거부
        ]
    },
    {
        id: "ADD_9",
        situation: "당신의 아이디어가 실행 단계에서 예상치 못한 문제에 직면했습니다.",
        options: [
            { 
                id: "ADD_OP_9A", 
                text: "문제를 해결할 새로운 방법을 즉시 찾는다.", 
                type: "acting", 
                weight: { proactivity: 15, adaptability: 12, socialDistance: 0 } 
            },
            { 
                id: "ADD_OP_9B", 
                text: "원인을 분석하고 점진적으로 개선한다.", 
                type: "thinking", 
                weight: { proactivity: 8, adaptability: 15, socialDistance: 0 } 
            },
            { 
                id: "ADD_OP_9C", 
                text: "일단 중단하고 재검토한다.", 
                type: "feeling", 
                weight: { proactivity: -5, adaptability: 5, socialDistance: 3 } 
            },
            { 
                id: "ADD_OP_9D", 
                text: "내 아이디어가 아닌 것처럼 거리를 두고, 결과를 관망한다.", 
                type: "thinking", 
                weight: { proactivity: -8, adaptability: 0, socialDistance: 15 } 
            } // 변경됨: 책임 이탈 + 소유권 부정
        ]
    }
];

