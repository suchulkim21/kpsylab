/**
 * Dark Nature Test - Responses API
 * 응답 저장 및 업데이트
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// POST: 응답 저장 (단일 또는 일괄)
export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured', code: 'DB_UNAVAILABLE' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { assessmentId, responses } = body; // responses: [{ questionId, score }]

    if (!assessmentId || !responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // 일괄 upsert (중복 시 업데이트)
    const responseData = responses.map((r: { questionId: string; score: number }) => ({
      assessment_id: assessmentId,
      question_id: r.questionId,
      score: r.score,
    }));

    const { error } = await supabase
      .from('responses')
      .upsert(responseData, {
        onConflict: 'assessment_id,question_id',
      });

    if (error) {
      console.error('Response 저장 실패:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save responses' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Responses saved',
    });
  } catch (error) {
    console.error('Response API 오류:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: 특정 assessment의 모든 응답 조회
export async function GET(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured', code: 'DB_UNAVAILABLE' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');

    if (!assessmentId) {
      return NextResponse.json(
        { success: false, error: 'Assessment ID required' },
        { status: 400 }
      );
    }

    const { data: responses, error } = await supabase
      .from('responses')
      .select('question_id, score')
      .eq('assessment_id', assessmentId);

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch responses' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      responses,
    });
  } catch (error) {
    console.error('Response 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
