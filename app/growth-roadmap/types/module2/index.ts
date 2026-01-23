// DEV_GUIDE.md의 데이터 분석 정의에 기반한 타입 정의

// 1. 상호작용 메커니즘 (IPO 모델)
export interface InteractionMechanism {
    input: {
        sensitivity: number; // 민감도 (0-100)
        receptivity: number; // 수용성 (0-100)
    };
    processing: {
        type: 'logical' | 'emotional' | 'intuitive'; // 사고 과정 (논리/감정/직관)
    };
    output: {
        behavior: 'active_intervention' | 'passive_observation' | 'avoidance' | 'cooperation'; // 행동 표출
    };
}

// 2. 주요 분석 변수
export interface AnalysisVariables {
    proactivity: number;    // 주도성: 환경 변화 의지
    adaptability: number;   // 적응성: 환경 적응 정도
    socialDistance: number; // 사회적 거리: 타인과의 심리적 거리
}

// 3. 시나리오 및 문항 구조
export interface ScenarioOption {
    id: string;
    text: string; // 선택지 텍스트
    type: 'thinking' | 'feeling' | 'acting'; // 생각/느낌/행동
    weight: Partial<AnalysisVariables>; // 해당 선택지가 변수에 미치는 가중치
}

export interface Scenario {
    id: string;
    situation: string; // 상황 제시
    options: ScenarioOption[]; // 다지선다형 문항
}
