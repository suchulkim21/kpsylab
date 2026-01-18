
export interface TextBlock {
    id: string;
    content: string;
    condition?: boolean;
}

export interface ReportConfig {
    userName?: string;
    scores: Record<string, number>;
    typeCode: string; // e.g., "H-L-A"
    keywords: string[];
}

export function assembleParagraphs(blocks: TextBlock[]): string {
    return blocks
        .filter(b => b.condition !== false)
        .map(b => b.content)
        .join("\n\n");
}

export function formatClinicalTone(text: string): string {
    // Basic post-processing to ensure clinical tone (optional regex replacements)
    return text.replace(/요\./g, "다.").replace(/에요/g, "다");
}
