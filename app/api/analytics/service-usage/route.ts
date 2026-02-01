import { NextResponse } from 'next/server';
import { logServiceUsage } from '@/lib/db/analytics';

export const dynamic = 'force-dynamic';

// POST: 서비스 이용 기록 (MNPS, 마인드 아키텍터 등)
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { serviceName, actionType, durationSeconds } = body;

    if (!serviceName || typeof serviceName !== 'string') {
      return NextResponse.json(
        { success: false, error: 'serviceName이 필요합니다.' },
        { status: 400 }
      );
    }

    await logServiceUsage(null, serviceName, actionType, durationSeconds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('서비스 이용 기록 실패:', error);
    return NextResponse.json(
      { success: false, error: '기록 실패' },
      { status: 500 }
    );
  }
}
