/**
 * Dark Nature Test - Assessments API
 * 테스트 세션 생성 및 관리
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// POST: 새 테스트 세션 생성
export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured', code: 'DB_UNAVAILABLE' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { userId, sessionId } = body; // sessionId: 비로그인 유저 식별용(쿠키/헤더에서 전달)

    // 새 assessment 생성 (비로그인 시 session_id 저장 → RLS에서 본인 조회만 허용)
    const insertPayload: Record<string, unknown> = {
      user_id: userId || null,
      status: 'IN_PROGRESS',
      is_paid: false,
    };
    if (sessionId && typeof sessionId === 'string') (insertPayload as Record<string, string>).session_id = sessionId;

    const { data: assessment, error } = await supabase
      .from('assessments')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Assessment 생성 실패:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create assessment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.id,
        status: assessment.status,
        createdAt: assessment.created_at,
      },
    });
  } catch (error) {
    console.error('Assessment API 오류:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: 테스트 세션 조회
export async function GET(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured', code: 'DB_UNAVAILABLE' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('id');

    if (!assessmentId) {
      return NextResponse.json(
        { success: false, error: 'Assessment ID required' },
        { status: 400 }
      );
    }

    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      assessment,
    });
  } catch (error) {
    console.error('Assessment 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
