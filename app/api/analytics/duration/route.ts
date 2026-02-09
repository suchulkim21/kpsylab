import { NextResponse } from 'next/server';
import { logServiceUsage } from '@/lib/db/analytics';

export const dynamic = 'force-dynamic';

// POST: 페이지 체류 시간 기록
export async function POST(request: Request) {
    try {
        const text = await request.text();
        if (!text || text.trim() === '') {
            return NextResponse.json({ success: false }, { status: 400 });
        }

        let body: { pagePath?: string; duration?: number };
        try {
            body = JSON.parse(text);
        } catch {
            return NextResponse.json({ success: false }, { status: 400 });
        }

        const { pagePath, duration } = body;

        if (!pagePath || typeof duration !== 'number' || duration < 2) {
            return NextResponse.json({ success: false }, { status: 400 });
        }

        // 서비스 이름 결정
        let serviceName = 'general';
        if (pagePath.includes('/blog')) serviceName = 'blog';
        else if (pagePath.includes('/mnps')) serviceName = 'mnps';
        else if (pagePath.includes('/growth-roadmap')) serviceName = 'growth-roadmap';

        // 체류 시간 기록
        await logServiceUsage(null, serviceName, 'page_view', duration);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Duration tracking error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
