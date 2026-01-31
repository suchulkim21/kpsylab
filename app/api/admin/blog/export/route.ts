/**
 * 관리자용 블로그 데이터 내보내기 API
 * CSV 형식으로 블로그 포스트 및 통계 데이터 내보내기
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// CSV 이스케이프
function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// HTML 태그 제거
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// GET: 블로그 데이터 CSV 내보내기
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'posts'; // posts, analytics, schedule

    if (type === 'posts') {
      // 블로그 포스트 내보내기
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('포스트 조회 실패:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch posts' },
          { status: 500 }
        );
      }

      // 조회수 정보 가져오기
      const postIds = (posts || []).map(p => p.id);
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

      // CSV 헤더
      const headers = ['ID', '제목', '작성자', '발행일', '태그', '조회수', '내용 미리보기'];
      const csvRows = [headers.map(escapeCsv).join(',')];

      // CSV 데이터
      (posts || []).forEach(post => {
        const row = [
          post.id,
          escapeCsv(post.title || ''),
          escapeCsv(post.author || ''),
          escapeCsv(post.date || ''),
          escapeCsv(post.tags || ''),
          viewCounts[post.id] || 0,
          escapeCsv(stripHtml(post.content || '').substring(0, 100)),
        ];
        csvRows.push(row.map(String).map(escapeCsv).join(','));
      });

      const csv = csvRows.join('\n');
      const bom = '\uFEFF'; // UTF-8 BOM (Excel 호환)

      return new NextResponse(bom + csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="blog-posts-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (type === 'analytics') {
      // 분석 데이터 내보내기
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('id, title, date, tags');

      const postIds = (posts || []).map(p => p.id);
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

      // 카테고리별 통계
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

      const headers = ['카테고리', '포스트 수', '총 조회수', '평균 조회수'];
      const csvRows = [headers.map(escapeCsv).join(',')];

      Object.entries(categoryMap)
        .sort((a, b) => b[1].views - a[1].views)
        .forEach(([category, data]) => {
          const avgViews = data.count > 0 ? Math.round(data.views / data.count) : 0;
          const row = [
            escapeCsv(category),
            data.count,
            data.views,
            avgViews,
          ];
          csvRows.push(row.map(String).map(escapeCsv).join(','));
        });

      const csv = csvRows.join('\n');
      const bom = '\uFEFF';

      return new NextResponse(bom + csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="blog-analytics-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (type === 'schedule') {
      // 일정 데이터 내보내기
      const { data: schedules, error } = await supabase
        .from('blog_content_schedule')
        .select('*')
        .order('scheduled_date', { ascending: true, nullsFirst: false });

      if (error) {
        console.error('일정 조회 실패:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch schedule' },
          { status: 500 }
        );
      }

      const headers = ['ID', '주제', '카테고리', '상태', '예약일', '발행일', '우선순위', '담당자', '메모'];
      const csvRows = [headers.map(escapeCsv).join(',')];

      (schedules || []).forEach(schedule => {
        const row = [
          schedule.id,
          escapeCsv(schedule.topic || ''),
          escapeCsv(schedule.category || ''),
          escapeCsv(schedule.status || ''),
          escapeCsv(schedule.scheduled_date || ''),
          escapeCsv(schedule.publish_date || ''),
          escapeCsv(schedule.priority || ''),
          escapeCsv(schedule.assigned_to || ''),
          escapeCsv(schedule.notes || ''),
        ];
        csvRows.push(row.map(String).map(escapeCsv).join(','));
      });

      const csv = csvRows.join('\n');
      const bom = '\uFEFF';

      return new NextResponse(bom + csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="blog-schedule-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid export type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('데이터 내보내기 실패:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
