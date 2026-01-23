import { TextBlock, assembleParagraphs } from "./engine";
import { getConfrontationText } from "./data/confrontationData";
import { getDeconstructionText } from "./data/deconstructionData";
import { getReconstructionText } from "./data/reconstructionData";
import { getIdentityConflictAnalysis, getBehavioralMaskAnalysis, getStrategicFailureAnalysis } from "./data/depthAnalysisData";

export interface FeedbackVariant {
    id: string;
    title: string;
    content: string;
}

export interface M1Data {
    type: string; // A, B, C, D
    subType: string;
    scoreMap: Record<string, number>;
}

export interface M2Data {
    typeCode: string;
    scores: { p: number, a: number, sd: number };
    clinicalType: string;
}

export interface M3Data {
    ideal: { stability: number; growth: number; relation: number; autonomy: number };
    potential: { stability: number; growth: number; relation: number; autonomy: number };
    dominantGap: string;
    strategy?: string;
    calibration?: string;
}

export class FinalAnalysisEngine {
    private m1: M1Data;
    private m2: M2Data;
    private m3: M3Data;

    constructor(m1: M1Data, m2: M2Data, m3: M3Data) {
        this.m1 = m1;
        this.m2 = m2;
        this.m3 = m3;
    }

    private getM1Term(): string {
        const terms: Record<string, string> = {
            "A": "성취 지향적 강박",
            "B": "애정 결핍성 의존",
            "C": "회피성 불안",
            "D": "해리성 도피"
        };
        return terms[this.m1.type] || "미분화된 무의식";
    }

    private getM2Term(): string {
        const { p, a, sd } = this.m2.scores;
        if (p >= 60 && sd >= 50) return "체제 구축가";
        if (p >= 60 && a >= 50) return "체제 혁신가";
        if (a >= 60 && sd < 50) return "체제 순응자";
        return "체제 독립자";
    }

    private getGapTerm(): string {
        const terms: Record<string, string> = {
            "growth": "성장과 확장",
            "stability": "안정과 질서",
            "relation": "관계와 연결",
            "autonomy": "자율과 독립"
        };
        return terms[this.m3.dominantGap] || this.m3.dominantGap;
    }

    // --- EXPANDED ROADMAP SECTIONS ---

    private generateConfrontation(): string {
        return getConfrontationText(this.m1.type, this.getM1Term());
    }

    private generateDeconstruction(): string {
        return getDeconstructionText(this.getM2Term());
    }

    private generateReconstruction(): string {
        return getReconstructionText(this.getGapTerm(), this.m3.dominantGap);
    }

    // --- MAIN GENERATION ---

    public generateFullReport(): string {
        // 분석 섹션 생성
        const conflict = this.analyzeIdentityConflict();
        const mask = this.analyzeBehavioralMask();
        const failure = this.analyzeStrategicFailure();

        // 1. 로드맵 최상단 배치
        // 2. 섹션 확장
        const blocks: TextBlock[] = [
            {
                id: 'intro',
                content: "**[종합 진단 보고서: 종합 요약]**\n\n본 시스템은 귀하의 심층 데이터를 분석하여, 단순한 현상 진단을 넘어 삶을 재설계하기 위한 구체적인 **전술 프로토콜**을 최우선으로 제시합니다."
            },
            { id: 'roadmap_confrontation', content: this.generateConfrontation() },
            { id: 'roadmap_deconstruction', content: this.generateDeconstruction() },
            { id: 'roadmap_reconstruction', content: this.generateReconstruction() },
            {
                id: 'divider',
                content: "**[첨부: 상세 분석 데이터]**\n\n하단 내용은 위 제언의 근거가 되는 정밀 심리 분석 결과입니다. 귀하의 무의식과 행동 패턴이 어떻게 충돌하고 있는지 데이터를 통해 검증하십시오."
            },
            { id: 'layer1', content: conflict },
            { id: 'layer2', content: mask },
            { id: 'layer3', content: failure }
        ];
        return assembleParagraphs(blocks);
    }

    // 피드백 변형 접근자
    public getFeedbackVariants(): FeedbackVariant[] {
        return this.generateFeedbackVariants();
    }

    /**
     * 분석 데이터와 보정값을 기반으로 다양한 피드백 생성
     * UI 선택을 위한 FeedbackVariant 배열 반환
     */
    private generateFeedbackVariants(): FeedbackVariant[] {
        const variants: FeedbackVariant[] = [];
        // 유형 1: 통합 피드백
        variants.push({
            id: 'v1',
            title: '통합 피드백',
            content: this.generateConfrontation() + "\n\n" + this.generateDeconstruction() + "\n\n" + this.generateReconstruction()
        });
        // 유형 2: 전략적 집중
        const gapInfo = `주요 전략적 격차: ${this.getGapTerm()} (보정 선택: ${this.m3.calibration ?? '없음'})`;
        variants.push({
            id: 'v2',
            title: '전략적 피드백',
            content: gapInfo + "\n\n" + this.analyzeStrategicFailure()
        });
        // 유형 3: 정체성 심층
        variants.push({
            id: 'v3',
            title: '정체성 심층 피드백',
            content: this.analyzeIdentityConflict()
        });
        return variants;
    }

    private analyzeIdentityConflict(): string {
        return getIdentityConflictAnalysis(this.getM1Term(), this.getGapTerm());
    }

    private analyzeBehavioralMask(): string {
        return getBehavioralMaskAnalysis(this.getM2Term());
    }

    private analyzeStrategicFailure(): string {
        return getStrategicFailureAnalysis(this.m3.dominantGap, this.getGapTerm(), this.m3.calibration ?? '없음');
    }

    public getDiagnosisTerms() {
        return {
            m1Term: this.getM1Term(),
            m2Term: this.getM2Term(),
            gapTerm: this.getGapTerm()
        };
    }
}
