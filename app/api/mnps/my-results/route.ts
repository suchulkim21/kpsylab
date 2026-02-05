/**
 * MNPS 이전 결과 목록 조회 (sessionId 기준)
 * - 비로그인 사용자의 완료된 테스트 목록 반환
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

const MAX_LIST = 20;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'sessionId required' },
        { status: 400 }
      );
    }

    const db = supabaseAdmin;
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database not configured', code: 'DB_UNAVAILABLE' },
        { status: 503 }
      );
    }

    const { data: rows, error } = await db
      .from('assessments')
      .select('id, completed_at, total_d_score')
      .eq('session_id', sessionId)
      .eq('status', 'COMPLETED')
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(MAX_LIST);

    if (error) {
      console.error('MNPS my-results 조회 오류:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch results' },
        { status: 500 }
      );
    }

    const results = (rows ?? []).map((r) => ({
      id: r.id,
      completedAt: r.completed_at,
      totalDScore: r.total_d_score ?? null,
    }));

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error('my-results API 오류:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
