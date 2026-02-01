import { generateModule3Items } from "../content/module3";

export interface ResultItem {
    id: string;
    title: string; // 한 줄 요약 (한국어)
    content: string; // 상세 설명 (한국어)
}

/**
 * Module 3 (Reconstruction) 전용 엔진
 * 실제 콘텐츠 블록 3개만 반환합니다. (플레이스홀더 제거)
 */
export class Module3Engine {
    constructor(private data: any) { }

    public generateResults(): ResultItem[] {
        return generateModule3Items(this.data || {});
    }

}
