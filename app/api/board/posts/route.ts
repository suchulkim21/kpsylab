import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPostsForViewer, getPostCountForViewer, createPost } from '@/lib/db/board';

export const dynamic = 'force-dynamic';

// GET: 게시글 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const adminSecret = process.env.ADMIN_SECRET;
    const providedSecret = request.headers.get('x-admin-secret');
    const isAdmin = !!adminSecret && providedSecret === adminSecret;
    const cookieStore = await cookies();
    const anonId = cookieStore.get('anon-id')?.value || null;

    const [posts, total] = await Promise.all([
      getPostsForViewer(limit, offset, anonId, isAdmin),
      getPostCountForViewer(anonId, isAdmin),
    ]);

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching board posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST: 게시글 작성
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, author } = body;

    if (!title || !content || !author) {
      return NextResponse.json(
        { success: false, error: 'Title, content, and author are required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    let anonId = cookieStore.get('anon-id')?.value;
    const shouldSetCookie = !anonId;
    if (!anonId) {
      anonId = crypto.randomUUID();
    }

    const id = await createPost(title, content, author, anonId);

    const response = NextResponse.json({
      success: true,
      id,
    }, { status: 201 });

    if (shouldSetCookie && anonId) {
      response.cookies.set('anon-id', anonId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Error creating board post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}



