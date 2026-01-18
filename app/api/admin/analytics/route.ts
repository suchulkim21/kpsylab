import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserById } from '@/lib/db/auth';
import { jwtVerify } from 'jose';
import { getAnalyticsStats } from '@/lib/db/analytics';
import { analyzeServiceDirection } from '@/lib/analytics/analysisEngine';

export const dynamic = 'force-dynamic';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// GET: 관리자용 분석 데이터
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: '인증되지 않았습니다.' },
        { status: 401 }
      );
    }

    // JWT 토큰 검증
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as number;

    // 사용자 정보 조회
    const user = await getUserById(userId);

    if (!user || user.role !== 'master') {
      return NextResponse.json(
        { success: false, error: '권한이 없습니다.' },
        { status: 403 }
      );
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

