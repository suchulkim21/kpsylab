import { NextResponse } from 'next/server';
import { getAnalyticsStats } from '@/lib/db/analytics';
import { analyzeServiceDirection } from '@/lib/analytics/analysisEngine';

export const dynamic = 'force-dynamic';

// GET: 관리자용 분석 데이터
export async function GET(request: Request) {
  try {
    const adminSecret = process.env.ADMIN_SECRET;
    if (adminSecret) {
      const providedSecret = request.headers.get('x-admin-secret');
      if (providedSecret !== adminSecret) {
        return NextResponse.json(
          { success: false, error: '권한이 없습니다.' },
          { status: 403 }
        );
      }
    }

    // 통계 데이터 조회
    const analytics = await getAnalyticsStats();

    // 종합 분석
    const analysis = analyzeServiceDirection(analytics);

    return NextResponse.json({
      success: true,
      analytics,
      analysis,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: '분석 데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

