/**
 * POST /api/metacognition/session/[sessionId]/respond
 * 사용자 응답을 분석하고 세션에 기록
 */
import { NextRequest, NextResponse } from "next/server";
import { getQuestionById } from "@/lib/metacognition/questions";
import { analyze } from "@/lib/metacognition/engine";
import type { UserResponse, AnalysisResult } from "@/lib/metacognition/models";

// 인메모리 세션 저장소 (프로토타입)
// TODO: Supabase로 전환
const sessions = new Map<
    string,
    { question_id: string; response: UserResponse; result: AnalysisResult }[]
>();

// 세션 저장소를 외부에서 접근할 수 있도록 export
export { sessions };

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const body: UserResponse = await request.json();

        const question = getQuestionById(body.question_id);
        if (!question) {
            return NextResponse.json(
                { error: "유효하지 않은 질문 ID입니다." },
                { status: 404 }
            );
        }

        const result = analyze(question, body);

        if (!sessions.has(sessionId)) {
            sessions.set(sessionId, []);
        }
        sessions.get(sessionId)!.push({
            question_id: body.question_id,
            response: body,
            result,
        });

        return NextResponse.json(result);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "분석 중 오류가 발생했습니다.";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
