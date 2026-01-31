/**
 * 관리자용 블로그 콘텐츠 일정 개별 관리 API
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// GET: 단일 일정 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const scheduleId = parseInt(id, 10);

    if (isNaN(scheduleId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid schedule ID' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('blog_content_schedule')
      .select('*')
      .eq('id', scheduleId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      schedule: data,
    });
  } catch (error) {
    console.error('일정 조회 실패:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: 일정 수정
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const scheduleId = parseInt(id, 10);

    if (isNaN(scheduleId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid schedule ID' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.topic !== undefined) updateData.topic = body.topic;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.scheduled_date !== undefined) updateData.scheduled_date = body.scheduled_date;
    if (body.publish_date !== undefined) updateData.publish_date = body.publish_date;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.assigned_to !== undefined) updateData.assigned_to = body.assigned_to;
    if (body.published_post_id !== undefined) updateData.published_post_id = body.published_post_id;

    const { data, error } = await supabase
      .from('blog_content_schedule')
      .update(updateData)
      .eq('id', scheduleId)
      .select()
      .single();

    if (error) {
      console.error('일정 수정 실패:', error);
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
    console.error('일정 수정 실패:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: 일정 삭제
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const scheduleId = parseInt(id, 10);

    if (isNaN(scheduleId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid schedule ID' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { error } = await supabase
      .from('blog_content_schedule')
      .delete()
      .eq('id', scheduleId);

    if (error) {
      console.error('일정 삭제 실패:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully',
    });
  } catch (error) {
    console.error('일정 삭제 실패:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
