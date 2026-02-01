import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { getStatistics } from '@/lib/db/auth';
import { getAnalyticsStats } from '@/lib/db/analytics';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// POST: 대시보드 데이터를 AI용 JSON으로 저장
export async function POST(request: Request) {
  try {
    const adminSecret = process.env.ADMIN_SECRET;
    if (adminSecret) {
      const key = request.headers.get('x-admin-secret') ?? request.headers.get('x-admin-key');
      if (key !== adminSecret) {
        return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });
      }
    }

    let userStats = { totalUsers: 0, totalMasterUsers: 0, newUsersToday: 0, newUsersThisWeek: 0 };
    try {
      userStats = await getStatistics();
    } catch {
      /* ignore */
    }

    let analytics: Awaited<ReturnType<typeof getAnalyticsStats>> | null = null;
    try {
      analytics = await getAnalyticsStats();
    } catch {
      /* ignore */
    }

    let blogPostCount = 0;
    if (supabase) {
      try {
        const { count } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true });
        if (count != null) blogPostCount = count;
      } catch {
        /* ignore */
      }
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      purpose: '시스템 업그레이드 및 AI 분석용',
      stats: {
        totalUsers: userStats.totalUsers,
        todaySignups: userStats.newUsersToday,
        weekSignups: userStats.newUsersThisWeek,
        totalBlogPosts: blogPostCount,
        masterAccounts: userStats.totalMasterUsers,
      },
      analytics: analytics
        ? {
            totalVisits: analytics.totalVisits,
            todayVisits: analytics.todayVisits,
            uniqueVisitorsTotal: analytics.uniqueVisitorsTotal,
            serviceUsage: analytics.serviceUsage,
            topPages: analytics.topPages,
            referrers: analytics.referrers,
            deviceTypes: analytics.deviceTypes,
            dailyTrend: analytics.dailyTrend,
          }
        : null,
    };

    const json = JSON.stringify(payload, null, 2);
    const root = process.cwd();
    const outPath = join(root, '..', 'docs', 'SYSTEM_UPGRADE_DATA.json');
    await writeFile(outPath, json, 'utf-8');

    return NextResponse.json({
      success: true,
      path: outPath,
      message: 'docs/SYSTEM_UPGRADE_DATA.json에 저장되었습니다. AI에게 @docs/SYSTEM_UPGRADE_DATA.json을 첨부하여 시스템 업그레이드 요청 시 활용하세요.',
    });
  } catch (error) {
    console.error('export-system-data:', error);
    return NextResponse.json(
      { success: false, error: '저장 실패' },
      { status: 500 }
    );
  }
}
