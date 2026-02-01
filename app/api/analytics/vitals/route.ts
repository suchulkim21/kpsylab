import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
  path: string;
  timestamp: string;
}

export async function POST(request: Request) {
  try {
    // 빈 body 또는 aborted 요청 처리 (페이지 전환 시 발생)
    const text = await request.text();
    if (!text || text.trim() === '') {
      return NextResponse.json({ success: false }, { status: 400 });
    }
    let metric: WebVitalsMetric;
    try {
      metric = JSON.parse(text) as WebVitalsMetric;
    } catch {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Supabase에 저장 (service_usage 테이블 활용)
    if (supabase) {
      await supabase.from('service_usage').insert({
        service_name: 'web-vitals',
        action_type: metric.name,
        duration_seconds: Math.round(metric.value),
        created_at: metric.timestamp,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking web vitals:', error);
    // Web Vitals 추적 실패는 사용자 경험에 영향을 주지 않도록 조용히 실패
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
