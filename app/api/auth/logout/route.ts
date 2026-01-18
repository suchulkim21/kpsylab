import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST: 로그아웃
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: '로그아웃되었습니다.',
  });

  // 쿠키 삭제
  response.cookies.delete('auth-token');

  return response;
}



