/**
 * GET /api/metacognition/questions
 * 전체 시나리오 목록 (hidden_bias_data 제외)
 */
import { NextResponse } from "next/server";
import { SAMPLE_QUESTIONS } from "@/lib/metacognition/questions";
import type { SafeQuestion } from "@/lib/metacognition/models";

export async function GET() {
    const safeQuestions: SafeQuestion[] = SAMPLE_QUESTIONS.map((q) => ({
        id: q.id,
        priming_words: q.priming_words,
        scenario: q.scenario,
        options: q.options.map((opt) => ({ id: opt.id, text: opt.text })),
    }));

    return NextResponse.json(safeQuestions);
}
