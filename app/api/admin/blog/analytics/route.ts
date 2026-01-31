/**
 * 관리자용 블로그 분석 API
 * 블로그 포스트 통계 및 성과 분석
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

interface BlogAnalytics {
  overview: {
    totalPosts: number;
    totalViews: number;
    avgViewsPerPost: number;
    topCategories: Array<{ category: string; views: number; count: number }>;
  };
  topPosts: Array<{
    id: number;
    title: string;
    views: number;
    publishedDate: string;
    author: string;
  }>;
  trends: {
    dailyViews: Array<{ date: string; views: number }>;
    categoryDistribution: Record<string, number>;
  };
  recentPosts: Array<{
    id: number;
    title: string;
    views: number;
    publishedDate: string;
  }>;
}

export async function GET(request: Request) {
  try {
    // 관리자 인증 확인
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    // 블로그 포스트 조회
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('id, title, date, author, tags')
      .order('id', { ascending: false });

    if (postsError) {
      console.error('블로그 포스트 조회 실패:', postsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    const postIds = (posts || []).map(p => p.id);

    // 조회수 정보 조회
    let viewCounts: Record<number, number> = {};
    if (postIds.length > 0) {
      try {
        const { data: views } = await supabase
          .from('page_views')
          .select('resource_id, view_count')
          .eq('page_type', 'blog')
          .in('resource_id', postIds);

        views?.forEach(v => {
          if (v.resource_id) {
            viewCounts[v.resource_id] = (viewCounts[v.resource_id] || 0) + (v.view_count || 0);
          }
        });
      } catch (error) {
        console.error('조회수 조회 실패:', error);
      }
    }

    // 통계 계산
    const totalPosts = posts?.length || 0;
    const totalViews = Object.values(viewCounts).reduce((sum, count) => sum + count, 0);
    const avgViewsPerPost = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;

    // 카테고리별 통계 (태그 기반)
    const categoryMap: Record<string, { views: number; count: number }> = {};
    posts?.forEach(post => {
      const tags = post.tags ? post.tags.split(',').map((t: string) => t.trim()) : [];
      const views = viewCounts[post.id] || 0;
      
      tags.forEach((tag: string) => {
        if (!categoryMap[tag]) {
          categoryMap[tag] = { views: 0, count: 0 };
        }
        categoryMap[tag].views += views;
        categoryMap[tag].count += 1;
      });
    });

    const topCategories = Object.entries(categoryMap)
      .map(([category, data]) => ({
        category,
        views: data.views,
        count: data.count,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // 인기 포스트 (조회수 기준)
    const topPosts = (posts || [])
      .map(post => ({
        id: post.id,
        title: post.title,
        views: viewCounts[post.id] || 0,
        publishedDate: post.date,
        author: post.author || 'KPSY LAB',
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // 최근 포스트
    const recentPosts = (posts || [])
      .slice(0, 10)
      .map(post => ({
        id: post.id,
        title: post.title,
        views: viewCounts[post.id] || 0,
        publishedDate: post.date,
      }));

    // 일별 조회수 추이 (최근 30일)
    const dailyViews: Record<string, number> = {};
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: dailyData } = await supabase
        .from('page_views')
        .select('created_at, view_count')
        .eq('page_type', 'blog')
        .gte('created_at', thirtyDaysAgo.toISOString());

      dailyData?.forEach(item => {
        if (item.created_at) {
          const date = new Date(item.created_at).toISOString().split('T')[0];
          dailyViews[date] = (dailyViews[date] || 0) + (item.view_count || 0);
        }
      });
    } catch (error) {
      console.error('일별 조회수 조회 실패:', error);
    }

    const dailyViewsArray = Object.entries(dailyViews)
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 카테고리 분포
    const categoryDistribution: Record<string, number> = {};
    posts?.forEach(post => {
      const tags = post.tags ? post.tags.split(',').map((t: string) => t.trim()) : [];
      tags.forEach((tag: string) => {
        categoryDistribution[tag] = (categoryDistribution[tag] || 0) + 1;
      });
    });

    const analytics: BlogAnalytics = {
      overview: {
        totalPosts,
        totalViews,
        avgViewsPerPost,
        topCategories,
      },
      topPosts,
      trends: {
        dailyViews: dailyViewsArray,
        categoryDistribution,
      },
      recentPosts,
    };

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('블로그 분석 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
