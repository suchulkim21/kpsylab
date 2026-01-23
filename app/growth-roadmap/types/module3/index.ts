// src/types/module3/index.ts
// Types for Module 3 – Ideal & Potential Analysis (4 dimensions)

export interface Module3Variables {
    stability: number;   // 안정성 (0‑100)
    growth: number;      // 성장성 (0‑100)
    relation: number;    // 관계성 (0‑100)
    autonomy: number;    // 자율성 (0‑100)
}

export interface ScenarioOption {
    id: string;
    text: string;
    type: 'thinking' | 'feeling' | 'acting'; // 생각/느낌/행동
    weight: Partial<Module3Variables>; // 선택지가 각 차원에 미치는 가중치
}

export interface Scenario {
    id: string;
    situation: string;
    options: ScenarioOption[];
}
