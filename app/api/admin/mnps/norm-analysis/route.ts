/**
 * MNPS 규준 보정: 분포 분석 + NORM_CONFIG 권장값 API
 * - GET: get_mnps_norm_distribution() RPC 호출 후 권장 Config JSON 반환
 * - Admin 페이지 버튼 클릭 또는 주기적 실행 시 사용. x-admin-secret 헤더 권장.
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin, supabase } from '@/lib/db/supabase';
import { NORM_CONFIG } from '@/lib/mnps/darkNatureScoring';
import {
  recommendNormConfig,
  formatNormConfigAsCode,
  type MnpsDistributionPayload,
} from '@/lib/mnps/normConfigFromDistribution';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const adminSecret = process.env.ADMIN_SECRET;
    if (adminSecret) {
      const providedSecret = request.headers.get('x-admin-secret');
      if (providedSecret !== adminSecret) {
        return NextResponse.json(
          { success: false, error: '권한이 없습니다.' },
          { status: 403 }
        );
      }
    }

    const db = supabaseAdmin ?? supabase;
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database not configured', code: 'DB_UNAVAILABLE' },
        { status: 503 }
      );
    }

    const { data: distributionRaw, error: rpcError } = await db.rpc('get_mnps_norm_distribution');

    if (rpcError) {
      console.error('get_mnps_norm_distribution RPC error:', rpcError);
      return NextResponse.json(
        {
          success: false,
          error: rpcError.message,
          code: 'RPC_FAILED',
          hint: '006_mnps_norm_distribution.sql 마이그레이션이 적용되었는지 확인하세요.',
        },
        { status: 502 }
      );
    }

    const distribution = distributionRaw as MnpsDistributionPayload | null;
    const current = {
      highCutoff: NORM_CONFIG.highCutoff,
      midCutoff: NORM_CONFIG.midCutoff,
      archetypeHighCutoff: NORM_CONFIG.archetypeHighCutoff,
      subFactorHighCutoff: NORM_CONFIG.subFactorHighCutoff,
      dTotalCritical: NORM_CONFIG.dTotalCritical,
      dTotalHigh: NORM_CONFIG.dTotalHigh,
    };

    const { recommended, suggestions, distributionValid } = recommendNormConfig(
      distribution,
      current
    );

    const configAsCode = recommended ? formatNormConfigAsCode(recommended) : null;

    return NextResponse.json({
      success: true,
      distribution,
      distributionValid,
      currentConfig: current,
      recommendedConfig: recommended,
      suggestions,
      configAsCode,
    });
  } catch (err) {
    console.error('MNPS norm-analysis API error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
