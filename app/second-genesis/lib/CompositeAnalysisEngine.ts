import { Module1Engine } from "./module1/analysisEngine";
import { Module2Engine } from "./module2/analysisEngine";
import { Module3Engine } from "./module3/analysisEngine";

export interface ResultItem {
    id: string;
    title: string; // 한 줄 요약 (한국어)
    content: string; // 상세 설명 (한국어)
}

/**
 * CompositeAnalysisEngine
 * 각 모듈 엔진에서 반환된 ResultItem[] 를 받아 하나의 종합 보고서를 생성합니다.
 */
export class CompositeAnalysisEngine {
    private module1Engine: Module1Engine;
    private module2Engine: Module2Engine;
    private module3Engine: Module3Engine;

    constructor(module1Data: any, module2Data: any, module3Data: any) {
        this.module1Engine = new Module1Engine(module1Data);
        this.module2Engine = new Module2Engine(module2Data);
        this.module3Engine = new Module3Engine(module3Data);
    }

    /**
     * 모든 모듈의 결과를 하나의 문자열 보고서로 조합합니다.
     */
    public generateCompositeReport(): string {
        const m1Results = this.module1Engine.generateResults();
        const m2Results = this.module2Engine.generateResults();
        const m3Results = this.module3Engine.generateResults();

        const sections = [
            { title: "1단계: 심층 분석", items: m1Results },
            { title: "2단계: 시나리오 분석", items: m2Results },
            { title: "3단계: 재구성 분석", items: m3Results },
        ];

        let report = "**[종합 진단 보고서]**\n\n";
        for (const sec of sections) {
            report += `--- ${sec.title} ---\n`;
            for (const item of sec.items) {
                report += `\n* ${item.title}:\n${item.content}\n`;
            }
            report += "\n";
        }
        return report;
    }
}
