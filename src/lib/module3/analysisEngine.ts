import { generateModule3Content } from "../content/module3";

export interface ResultItem {

    id: string;
    title: string; // 한 줄 요약 (한국어)
    content: string; // 상세 설명 (한국어)
}

/**
 * Module 3 (Reconstruction) 전용 엔진
 * 최소 16개의 ResultItem을 반환합니다.
 */
export class Module3Engine {
    constructor(private data: any) { }

    public generateResults(): ResultItem[] {
        // 실제 피검자 데이터 기반으로 Module 3 분석 결과를 생성합니다.
        const fullReport = generateModule3Content(this.data || {});
        const sections = fullReport.split(/\n\n/).filter(Boolean);
        const results: ResultItem[] = [];
        for (let i = 0; i < 16; i++) {
            const content = sections[i] ?? `추가 재구성 분석 결과 ${i + 1}`;
            results.push({
                id: `m3-${i + 1}`,
                title: `재구성 분석 결과 ${i + 1}`,
                content,
            });
        }
        return results;
    }

}
