import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const existing = cookieStore.get('anon-id')?.value;
  const anonId = existing || crypto.randomUUID();

  const response = NextResponse.json({ anonId });
  if (!existing) {
    response.cookies.set('anon-id', anonId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
  }

  return response;
}
