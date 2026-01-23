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

    // 통계 정보 수집
    const userStats = await getStatistics();

    // 블로그 포스트 수 조회 (Supabase)
    let blogPostCount = 0;
    if (supabase) {
      const { count, error } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true });

      if (!error && count !== null) {
        blogPostCount = count;
      }
    }

    // 테스트 결과 수 조회 (localStorage 기반이므로 추정치)
    // 실제로는 데이터베이스에 저장되어야 하지만, 현재는 클라이언트 측 저장이므로
    // 대략적인 추정치를 반환

    return NextResponse.json({
      success: true,
      stats: {
        users: userStats,
        content: {
          blogPosts: blogPostCount,
        },
        services: {
          mnps: {
            status: 'active',
            description: 'Dark Tetrad 심리 분석 서비스',
          },
          secondGenesis: {
            status: 'active',
            description: '통합 심리 분석 플랫폼',
          },
        },
        system: {
          uptime: 'online',
          lastUpdated: new Date().toISOString(),
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

