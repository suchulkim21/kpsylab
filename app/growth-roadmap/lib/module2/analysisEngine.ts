import { getModule2Content, determineTypeCode, ResultItem } from "../content/module2";

/**
 * Module 2 (Scenario Analysis) Engine
 * Returns 30 deep analysis items (ResultItem).
 */
export class Module2Engine {
    constructor(private data: any) { }

    public generateResults(): ResultItem[] {
        const scores = this.data?.scores || { p: 0, a: 0, sd: 0 };

        // 1. Determine Type Code (Internal Logic: English "HLA")
        const typeCode = determineTypeCode(scores);

        // 2. Retrieve Content (Display Data: Korean "통합적 통제형" content)
        const results = getModule2Content(typeCode);

        return results;
    }
}
