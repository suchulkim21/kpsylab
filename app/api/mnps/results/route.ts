/**
 * Dark Nature Test - Results API
 * 결과 리포트 조회 (Good/Bad 버전)
 * - Service Role(supabaseAdmin)로 RLS 우회 조회. assessmentId만 맞으면 결과 반환 (보안은 UUID 난수성에 의존).
 */

import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// GET: 결과 리포트 조회 (result_snapshot을 그대로 렌더링에 사용)
export async function GET(request: Request) {
  try {
    const db = supabaseAdmin ?? supabase;
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database not configured', code: 'DB_UNAVAILABLE' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');

    if (!assessmentId) {
      return NextResponse.json(
        { success: false, error: 'Assessment ID required' },
        { status: 400 }
      );
    }

    // assessment 조회 (Service Role로 RLS 우회 → assessmentId만 맞으면 조회 성공)
    const { data: assessment, error: assessmentError } = await db
      .from('assessments')
      .select('id, is_paid, total_d_score, raw_d_total, is_extreme_top, status')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    if (assessment.status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'Assessment not completed' },
        { status: 400 }
      );
    }

    // results_metadata 조회 (Service Role로 RLS 우회)
    const { data: metadata, error: metadataError } = await db
      .from('results_metadata')
      .select('good_report_json, bad_report_json, radar_chart_data, result_snapshot, percentile_at_creation')
      .eq('assessment_id', assessmentId)
      .single();

    if (metadataError || !metadata) {
      return NextResponse.json(
        { success: false, error: 'Results not found' },
        { status: 404 }
      );
    }

    // 보안: Bad Report는 서버 측에서만 결제 여부 확인 후 반환
    const badReport = assessment.is_paid ? metadata.bad_report_json : null;

    // 서버 저장 결과 우선 (result_snapshot). 없으면 레거시: radar_chart_data에서 traitScores 구성
    const snap = metadata.result_snapshot as Record<string, unknown> | null;
    const radar = (metadata.radar_chart_data as { value?: number }[] | null) ?? [];
    const traitScores = snap?.traitScores ?? (radar.length >= 4
      ? {
          machiavellianism: Number(radar[0]?.value) ?? 0,
          narcissism: Number(radar[1]?.value) ?? 0,
          psychopathy: Number(radar[2]?.value) ?? 0,
          sadism: Number(radar[3]?.value) ?? 0,
        }
      : undefined);
    const subFactorScores = snap?.subFactorScores;
    const analysisAccuracy = snap?.analysisAccuracy ?? undefined;
    const rawDTotal = assessment.raw_d_total ?? snap?.rawDTotal;
    const isExtremeTop = assessment.is_extreme_top ?? snap?.isExtremeTop;
    const responseTimePenalty = snap?.responseTimePenalty;
    const insincereResponsePattern = snap?.insincereResponsePattern;

    const percentileAtCreation = metadata.percentile_at_creation != null
      ? Number(metadata.percentile_at_creation)
      : undefined;

    return NextResponse.json({
      success: true,
      result: {
        dTotal: assessment.total_d_score,
        rawDTotal,
        isExtremeTop: !!isExtremeTop,
        traitScores,
        subFactorScores: subFactorScores ?? {},
        analysisAccuracy,
        responseTimePenalty: !!responseTimePenalty,
        insincereResponsePattern: !!insincereResponsePattern,
        percentileAtCreation,
        goodReport: metadata.good_report_json,
        badReport,
        radarChartData: metadata.radar_chart_data,
      },
      isPaid: assessment.is_paid,
    });
  } catch (error) {
    console.error('Results API 오류:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
