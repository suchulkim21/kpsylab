/**
 * 블로그 포스트 API (Supabase)
 * KPSY LAB Portal
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { logPageView } from '@/lib/db/analytics';

export const dynamic = 'force-dynamic';

const BLOG_IMAGE_COUNT = 120;

const normalizeBlogImage = (post: any) => {
  const image = String(post.image || '').trim();
  if (!image.startsWith('/images/blog/')) {
    const index = ((post.id || 1) - 1) % BLOG_IMAGE_COUNT + 1;
    const suffix = String(index).padStart(3, '0');
    post.image = `/images/blog/topic_${suffix}.jpg`;
  }
  return post;
};

// GET: 모든 게시글 조회 (검색 옵션 포함)
export async function GET(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : null;
    const limitValue = limit && limit > 0 ? Math.min(limit, 100) : null; // 최대 100개로 제한

    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('id', { ascending: false });

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
    }

    if (limitValue) {
      query = query.limit(limitValue);
    }

    const { data: posts, error } = await query;

    if (error) {
      // 테이블이 없는 경우 빈 배열 반환 (PGRST205, PGRST206 오류)
      if (error.code === 'PGRST205' || error.code === 'PGRST206' || error.message?.includes('Could not find the table')) {
        console.warn('블로그 포스트 테이블이 없습니다. 빈 배열을 반환합니다.');
        return NextResponse.json({ success: true, posts: [] });
      }
      
      console.error('블로그 포스트 조회 실패:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    // 중복 제목 제거 (id 내림차순이므로 최신을 유지)
    const dedupeTitleSet = new Set<string>();
    const dedupedPosts = (posts || []).filter((post: any) => {
      const key = String(post.title || '').trim();
      if (!key) return false;
      if (dedupeTitleSet.has(key)) return false;
      dedupeTitleSet.add(key);
      return true;
    });

    // 이미지 경로 정규화 (로컬 이미지로 통일)
    dedupedPosts.forEach(normalizeBlogImage);

    // 조회수 정보 가져오기 (analytics DB에서)
    try {
      if (dedupedPosts.length > 0) {
        const postIds = dedupedPosts.map(p => p.id);
        
        const { data: viewCounts } = await supabase
          .from('page_views')
          .select('resource_id, view_count')
          .eq('page_type', 'blog')
          .in('resource_id', postIds);

        const viewCountMap: Record<number, number> = {};
        viewCounts?.forEach(v => {
          if (v.resource_id) {
            viewCountMap[v.resource_id] = (viewCountMap[v.resource_id] || 0) + (v.view_count || 0);
          }
        });

        // 각 포스트에 조회수 추가
        dedupedPosts.forEach((post: any) => {
          post.viewCount = viewCountMap[post.id] || 0;
        });
      } else {
        // posts가 없으면 조회수를 0으로 설정
        dedupedPosts.forEach((post: any) => {
          post.viewCount = 0;
        });
      }
    } catch (error) {
      console.error('조회수 정보 가져오기 실패:', error);
      // 에러가 발생해도 조회수는 0으로 설정하고 계속 진행
      dedupedPosts.forEach((post: any) => {
        post.viewCount = 0;
      });
    }

    // 캐시 헤더 추가 (60초 캐시)
    const response = NextResponse.json({ success: true, posts: dedupedPosts });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

    return response;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
