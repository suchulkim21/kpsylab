import { NextResponse } from 'next/server';
import { getAnalyticsStats } from '@/lib/db/analytics';
import { analyzeServiceDirection } from '@/lib/analytics/analysisEngine';

export const dynamic = 'force-dynamic';

const emptyAnalytics = {
  totalVisits: 0,
  todayVisits: 0,
  uniqueVisitorsToday: 0,
  uniqueVisitorsTotal: 0,
  referrers: [] as { referrer: string; count: number }[],
  topPages: [] as { pagePath: string; viewCount: number; pageType?: string }[],
  serviceUsage: [] as { serviceName: string; usageCount: number; avgDuration: number }[],
  blogPostViews: [] as { postId: number; title: string; viewCount: number }[],
  deviceTypes: [] as { deviceType: string; count: number }[],
  dailyTrend: [] as { date: string; visits: number; uniqueVisitors: number }[],
};

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

    let analytics = emptyAnalytics;
    try {
      analytics = await getAnalyticsStats();
    } catch (e) {
      console.warn('getAnalyticsStats failed (visits/page_views may not exist):', e);
    }

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

