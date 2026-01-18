/**
 * Supabase Keep-Alive API
 * Vercel Cron을 통해 주기적으로 호출되어 프로젝트를 활성 상태로 유지
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { 
          status: 'error',
          error: 'Supabase not configured',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    // 간단한 쿼리로 Supabase 연결 확인
    // PGRST116 에러는 테이블이 없을 때 발생 (초기 상태일 수 있음)
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      // 테이블이 없는 경우가 아니라면 실제 에러
      console.error('Keep-alive check failed:', error.message);
      return NextResponse.json(
        { 
          status: 'error', 
          message: error.message,
          code: error.code,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    // 성공 응답
    return NextResponse.json({
      status: 'ok',
      message: 'Supabase is alive',
      timestamp: new Date().toISOString(),
      checked: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: error.message || 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

