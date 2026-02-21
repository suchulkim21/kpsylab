/**
 * GET /api/metacognition/session/[sessionId]/summary
 * 세션 종합 요약 리포트
 */
import { NextRequest, NextResponse } from "next/server";
import { generateSessionSummary } from "@/lib/metacognition/engine";
import { sessions } from "../respond/route";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params;

    const entries = sessions.get(sessionId);
    if (!entries || entries.length === 0) {
        return NextResponse.json(
            { error: "해당 세션 정보가 없습니다." },
            { status: 404 }
        );
    }

    const summary = generateSessionSummary(entries);
    return NextResponse.json(summary);
}
