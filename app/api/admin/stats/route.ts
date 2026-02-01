import { NextResponse } from 'next/server';
import { getStatistics } from '@/lib/db/auth';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// GET: 관리자 통계 정보
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

    // 통계 정보 수집 (테이블 없으면 0으로 fallback)
    let userStats = { totalUsers: 0, totalMasterUsers: 0, newUsersToday: 0, newUsersThisWeek: 0 };
    try {
      userStats = await getStatistics();
    } catch (e) {
      console.warn('getStatistics failed (users table may not exist):', e);
    }

    // 블로그 포스트 수 조회 (Supabase)
    let blogPostCount = 0;
    if (supabase) {
      try {
        const { count, error } = await supabase
          .from('blog_posts')
          .select('*', { count: 'exact', head: true });

        if (!error && count !== null) blogPostCount = count;
      } catch (e) {
        console.warn('blog_posts count failed:', e);
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: userStats.totalUsers,
        todaySignups: userStats.newUsersToday,
        weekSignups: userStats.newUsersThisWeek,
        totalBlogPosts: blogPostCount,
        masterAccounts: userStats.totalMasterUsers,
        systemStatus: {
          server: 'online',
          mnpsService: 'active',
          secondGenesisService: 'active',
          database: supabase ? 'connected' : 'not configured',
          diskSpace: 'ok',
        },
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: '통계 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

