import { assembleParagraphs, TextBlock } from "./engine";

interface ReportData {
    m1: { type: string; subType: string, scoreMap: Record<string, number> }; // Inner Shadow
    m2: { typeCode: string; scores: { p: number, a: number, sd: number } }; // Behavioral Pattern
    m3: { ideal: any; potential: any; strategy: string; dominantGap: string; calibration?: string }; // Vector Gap with optional calibration
}

// Synthesis Logic: Type (M2) + Shadow (M1) Interaction
// Synthesis Logic: Type (M2) + Shadow (M1) Interaction
import { FinalAnalysisEngine, FeedbackVariant } from "./finalAnalysisEngine";

// ... (retain interfaces for clarity if needed by other files, but usually safe to rely on import)

export function generateFinalReportContent(data: ReportData): { report: string; feedbackVariants: FeedbackVariant[]; diagnosis: { m1Term: string; m2Term: string; gapTerm: string } } {
    // Determine Clinical Type for M2
    let clinicalType = "Independent";
    const { p, a, sd } = data.m2.scores;
    if (p >= 60 && sd >= 50) clinicalType = "Builder";
    else if (p >= 60 && a >= 50) clinicalType = "Innovator";
    else if (a >= 60 && sd < 50) clinicalType = "Navigator";

    const engine = new FinalAnalysisEngine(
        data.m1,
        { ...data.m2, clinicalType },
        data.m3
    );

    const report = engine.generateFullReport();
    const feedbackVariants = engine.getFeedbackVariants();
    const diagnosis = engine.getDiagnosisTerms();
    return { report, feedbackVariants, diagnosis };
}
