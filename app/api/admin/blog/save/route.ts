/**
 * 관리자용 블로그 포스트 저장 API
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import {
  validateContentQuality,
  normalizeContent,
  type BlogPostData,
} from '@/lib/utils/blogContentGenerator';

export async function POST(request: Request) {
  try {
    // 관리자 인증 확인
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const post: BlogPostData = {
      title: body.title,
      content: body.content,
      author: body.author || 'KPSY LAB',
      date: body.date || new Date().toISOString().split('T')[0],
      tags: body.tags || '',
      image: body.image || '',
    };

    // 필수 필드 검증
    if (!post.title || !post.content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // 품질 검증
    const quality = validateContentQuality(post);
    if (quality.issues.length > 0 && !body.force) {
      return NextResponse.json({
        success: false,
        error: 'Quality check failed',
        quality,
      }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    // 저장
    const { error } = await supabase
      .from('blog_posts')
      .insert({
        title: post.title,
        content: normalizeContent(post.content),
        author: post.author,
        date: post.date,
        tags: post.tags,
        image: post.image || '',
      });

    if (error) {
      console.error('저장 실패:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post saved successfully',
      quality,
    });
  } catch (error) {
    console.error('블로그 포스트 저장 실패:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
