/**
 * 관리자용 블로그 콘텐츠 일정 관리 API
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

interface ContentSchedule {
  id: number;
  topic: string;
  category?: string;
  status: 'draft' | 'scheduled' | 'in_progress' | 'published' | 'cancelled';
  scheduled_date?: string;
  publish_date?: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  published_post_id?: number;
}

// GET: 일정 목록 조회
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
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabase
      .from('blog_content_schedule')
      .select('*')
      .order('scheduled_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (startDate) {
      query = query.gte('scheduled_date', startDate);
    }

    if (endDate) {
      query = query.lte('scheduled_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('일정 조회 실패:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch schedule' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      schedule: data || [],
    });
  } catch (error) {
    console.error('일정 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: 새 일정 생성
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

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { topic, category, status, scheduled_date, priority, notes, assigned_to } = body;

    if (!topic) {
      return NextResponse.json(
        { success: false, error: 'Topic is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('blog_content_schedule')
      .insert({
        topic,
        category: category || null,
        status: status || 'draft',
        scheduled_date: scheduled_date || null,
        priority: priority || 'medium',
        notes: notes || null,
        assigned_to: assigned_to || null,
      })
      .select()
      .single();

    if (error) {
      console.error('일정 생성 실패:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      schedule: data,
    });
  } catch (error) {
    console.error('일정 생성 실패:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
