import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPostForViewer, incrementViews, updatePost, deletePost } from '@/lib/db/board';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// GET: 단일 게시글 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: idStr } = params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const adminSecret = process.env.ADMIN_SECRET;
    const providedSecret = request.headers.get('x-admin-secret');
    const isAdmin = !!adminSecret && providedSecret === adminSecret;
    const cookieStore = await cookies();
    const anonId = cookieStore.get('anon-id')?.value || null;

    const post = await getPostForViewer(id, anonId, isAdmin);

    if (!post) {
      // 게시글이 존재하는지 확인 (권한 없음 vs 게시글 없음 구분)
      if (supabase) {
        const { data: exists } = await supabase
          .from('board_posts')
          .select('id')
          .eq('id', id)
          .single();
        
        if (exists) {
          // 게시글은 존재하지만 권한이 없음
          return NextResponse.json(
            { success: false, error: '권한이 없습니다.', forbidden: true },
            { status: 403 }
          );
        }
      }
      
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // 조회수 증가
    await incrementViews(id);

    // 증가된 조회수로 업데이트
    const updatedPost = await getPostForViewer(id, anonId, isAdmin);

    return NextResponse.json({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    console.error('Error fetching board post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// PUT: 게시글 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: idStr } = params;
    const id = parseInt(idStr);
    const body = await request.json();
    const { title, content } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const adminSecret = process.env.ADMIN_SECRET;
    const providedSecret = request.headers.get('x-admin-secret');
    const isAdmin = !!adminSecret && providedSecret === adminSecret;
    const cookieStore = await cookies();
    const anonId = cookieStore.get('anon-id')?.value || null;
    const post = await getPostForViewer(id, anonId, isAdmin);

    if (!post) {
      return NextResponse.json(
        { success: false, error: '권한이 없거나 게시글을 찾을 수 없습니다.' },
        { status: 403 }
      );
    }

    const success = await updatePost(id, title, content);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error updating board post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE: 게시글 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: idStr } = params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    const adminSecret = process.env.ADMIN_SECRET;
    const providedSecret = request.headers.get('x-admin-secret');
    const isAdmin = !!adminSecret && providedSecret === adminSecret;
    const cookieStore = await cookies();
    const anonId = cookieStore.get('anon-id')?.value || null;
    const post = await getPostForViewer(id, anonId, isAdmin);

    if (!post) {
      return NextResponse.json(
        { success: false, error: '권한이 없거나 게시글을 찾을 수 없습니다.' },
        { status: 403 }
      );
    }

    const success = await deletePost(id);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting board post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}

