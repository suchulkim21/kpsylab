import { NextResponse } from 'next/server';
import { verifyLogin } from '@/lib/db/auth';
import { SignJWT } from 'jose';

export const dynamic = 'force-dynamic';

// JWT 시크릿 키 (환경변수에서 가져오거나 기본값 사용)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// POST: 로그인
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, identifier, password } = body;

    // identifier는 이메일, 사용자명, 또는 직접 identifier일 수 있음
    const loginIdentifier = identifier || email || username;

    // 입력 검증
    if (!loginIdentifier || !password) {
      return NextResponse.json(
        { success: false, error: '이메일/아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 로그인 검증
    const user = await verifyLogin(loginIdentifier, password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: '이메일/아이디 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // JWT 토큰 생성
    const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role || 'user' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // 쿠키에 토큰 설정
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'user',
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { success: false, error: '로그인에 실패했습니다.' },
      { status: 500 }
    );
  }
}



