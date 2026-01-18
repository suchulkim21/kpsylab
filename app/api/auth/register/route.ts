import { NextResponse } from 'next/server';
import { createUser, getUserByEmail, getUserByUsername } from '@/lib/db/auth';

export const dynamic = 'force-dynamic';

// POST: 회원가입
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // 입력 검증
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { success: false, error: '사용자명은 3-20자 사이여야 합니다.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: '비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // 중복 확인
    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      );
    }

    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      return NextResponse.json(
        { success: false, error: '이미 사용 중인 사용자명입니다.' },
        { status: 400 }
      );
    }

    // 사용자 생성
    const user = await createUser(username, email, password);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error during registration:', error);
    
    // SQLite UNIQUE 제약 조건 오류 처리
    if (error.message && error.message.includes('UNIQUE constraint')) {
      return NextResponse.json(
        { success: false, error: '이미 사용 중인 이메일 또는 사용자명입니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: '회원가입에 실패했습니다.' },
      { status: 500 }
    );
  }
}



