import { NextResponse } from 'next/server';
import { logVisit, logPageView } from '@/lib/db/analytics';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// POST: 접속 추적
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      pagePath,
      referrer,
      userAgent,
      deviceType,
    } = body;

    // 세션 ID 생성 또는 가져오기
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('analytics_session')?.value;
    
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    // 접속 기록
    await logVisit({
      sessionId,
      pagePath,
      referrer,
      userAgent,
      deviceType,
    });

    // 페이지 조회 기록
    const pageType = pagePath.includes('/blog/') ? 'blog' :
                     pagePath.includes('/second-genesis') ? 'second-genesis' :
                     pagePath.includes('/mnps') ? 'mnps' : 'other';
    
    const resourceId = pagePath.includes('/blog/') 
      ? parseInt(pagePath.split('/blog/')[1]) || null
      : null;

    await logPageView(pagePath, pageType, resourceId || undefined);

    const response = NextResponse.json({ success: true, sessionId });
    response.cookies.set('analytics_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30일
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error tracking visit:', error);
    return NextResponse.json(
      { success: false, error: '추적 실패' },
      { status: 500 }
    );
  }
}

