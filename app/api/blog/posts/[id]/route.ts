/**
 * 개별 블로그 포스트 API (Supabase)
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

// GET: 단일 게시글 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);

    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error || !post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // 페이지 조회 기록 (비동기로 처리, 에러가 나도 응답은 정상 반환)
    logPageView(`/blog/${postId}`, 'blog', postId).catch(err => {
      console.error('페이지 조회 기록 실패:', err);
    });

    normalizeBlogImage(post);
    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}
