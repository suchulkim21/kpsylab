/**
 * Dark Nature Test - Complete API
 * 테스트 완료 처리 및 결과 저장 (서버 주도 채점)
 */

import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db/supabase';
import { logServiceUsage } from '@/lib/db/analytics';
import { scoreDarkNature, buildInterpretation, DarkAnswer } from '@/lib/mnps/darkNatureScoring';

export const dynamic = 'force-dynamic';

type ResponseItem = { questionId?: string; question_id?: string; score: number };

/** 문항 수(42) 기준 최소 소요 시간(10초 미만이면 물리적으로 불가능). */
const MNPS_MIN_COMPLETION_MS = 10 * 1000;
/** 세션 만료: 시작 후 24시간 경과 시 거부. */
const MNPS_MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000;

// POST: 테스트 완료 및 결과 저장
export async function POST(request: Request) {
  try {
    const db = supabaseAdmin ?? supabase;
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database not configured', code: 'DB_UNAVAILABLE' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { assessmentId, responses, startedAt } = body;

    if (!assessmentId || !responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { success: false, error: 'Missing data', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    // 멱등성: 이미 완료된 assessment면 재채점 없이 저장된 결과만 반환 (Service Role로 RLS 우회)
    const { data: existingAssessment, error: existingError } = await db
      .from('assessments')
      .select('id, status, total_d_score, raw_d_total, is_extreme_top, is_paid')
      .eq('id', assessmentId)
      .single();

    if (!existingError && existingAssessment?.status === 'COMPLETED') {
      const { data: existingMeta } = await db
        .from('results_metadata')
        .select('good_report_json, bad_report_json, radar_chart_data, result_snapshot')
        .eq('assessment_id', assessmentId)
        .single();

      if (existingMeta) {
        const snap = existingMeta.result_snapshot as Record<string, unknown> | null;
        const radar = (existingMeta.radar_chart_data as { value?: number }[] | null) ?? [];
        const badReport = existingAssessment.is_paid ? existingMeta.bad_report_json : null;
        const redirectUrl = `/mnps/result?assessmentId=${assessmentId}`;
        return NextResponse.json({
          success: true,
          idempotent: true,
          redirectUrl,
          redirect: redirectUrl,
          result: {
            dTotal: existingAssessment.total_d_score,
            rawDTotal: existingAssessment.raw_d_total ?? snap?.rawDTotal,
            isExtremeTop: !!existingAssessment.is_extreme_top,
            traitScores: snap?.traitScores ?? (radar.length >= 4 ? {
              machiavellianism: Number(radar[0]?.value) ?? 0,
              narcissism: Number(radar[1]?.value) ?? 0,
              psychopathy: Number(radar[2]?.value) ?? 0,
              sadism: Number(radar[3]?.value) ?? 0,
            } : {}),
            subFactorScores: snap?.subFactorScores ?? {},
            analysisAccuracy: snap?.analysisAccuracy ?? 95,
            responseTimePenalty: snap?.responseTimePenalty,
            insincereResponsePattern: snap?.insincereResponsePattern,
          },
          interpretation: { good: existingMeta.good_report_json, bad: null },
          radarChartData: existingMeta.radar_chart_data ?? radar,
        });
      }
    }

    // 1. startedAt 검증 (미래/최소 소요/타임아웃)
    if (!startedAt || typeof startedAt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'startedAt is required (ISO string)', code: 'STARTED_AT_REQUIRED' },
        { status: 400 }
      );
    }
    const startTs = new Date(startedAt).getTime();
    if (Number.isNaN(startTs)) {
      return NextResponse.json(
        { success: false, error: 'Invalid startedAt format', code: 'INVALID_STARTED_AT' },
        { status: 400 }
      );
    }
    const now = Date.now();
    if (startTs > now) {
      return NextResponse.json(
        { success: false, error: 'startedAt cannot be in the future', code: 'STARTED_AT_FUTURE' },
        { status: 400 }
      );
    }
    const responseTimeMs = now - startTs;
    if (responseTimeMs > MNPS_MAX_SESSION_AGE_MS) {
      console.warn(
        '[MNPS complete] startedAt too old (24h+), allowing anyway. assessmentId=%s, ageHours=%s',
        assessmentId,
        (responseTimeMs / (60 * 60 * 1000)).toFixed(1)
      );
      // 저장은 허용. 클라이언트에 선택적으로 경고 플래그를 줄 수 있음.
    }
    const questionCount = responses.length;
    if (responseTimeMs < MNPS_MIN_COMPLETION_MS) {
      return NextResponse.json(
        { success: false, error: 'Completion time too short (minimum 10 seconds for 42 questions)', code: 'COMPLETION_TOO_FAST' },
        { status: 400 }
      );
    }

    // 2. 답안 포맷 정규화 (question_id / questionId 둘 다 허용)
    const normalizedResponses = responses.map((r: ResponseItem) => ({
      questionId: r.questionId ?? r.question_id ?? '',
      score: r.score,
    })).filter((r) => r.questionId);

    // 3. questions 테이블에서 문항 정보 조회 (trait, sub_factor, question_order → 패턴 분석용)
    const questionIds = normalizedResponses.map((r) => r.questionId);
    const { data: questions, error: questionsError } = await db
      .from('questions')
      .select('id, trait, sub_factor, question_order')
      .in('id', questionIds);

    if (questionsError) {
      console.error('Questions 조회 실패:', questionsError);
    }

    // 4. DarkAnswer 형식으로 변환
    const darkAnswers: DarkAnswer[] = normalizedResponses
      .map((r) => {
        const q = questions?.find((q) => q.id === r.questionId);
        if (!q || (!q.trait && !q.sub_factor)) return null;
        return {
          questionId: r.questionId,
          trait: q.trait || undefined,
          subFactor: q.sub_factor || undefined,
          value: r.score,
        };
      })
      .filter((a): a is NonNullable<typeof a> => a !== null);

    // 검증 문항(v1~v8) 추출 → 분석 정확도 계산용
    const validationScores: Record<string, number> = {};
    for (const r of normalizedResponses) {
      if (['v1', 'v3', 'v4', 'v7'].includes(r.questionId)) validationScores[r.questionId] = r.score;
    }

    // 5. 패턴 분석용: 문항 표시 순서대로 응답 값 배열 (LSI·지그재그 감지)
    const orderMap = new Map<string, number>();
    questions?.forEach((q: { id: string; question_order?: number }) => {
      orderMap.set(q.id, q.question_order ?? 999);
    });
    const sortedByOrder = [...normalizedResponses].sort(
      (a, b) => (orderMap.get(a.questionId) ?? 999) - (orderMap.get(b.questionId) ?? 999)
    );
    const patternAnalysisValues = sortedByOrder.map((r) => r.score);

    // 6. 서버 사이드 채점 실행 (응답 시간·패턴 분석 포함)
    const result = scoreDarkNature(darkAnswers, {
      validationScores: Object.keys(validationScores).length >= 4 ? validationScores : undefined,
      responseTimeMs,
      questionCount,
      patternAnalysisValues,
    });
    const interpretation = buildInterpretation(result);

    // 7. 레이더 차트 데이터 생성
    const radarChartData = [
      { trait: '마키아벨리즘', value: result.traitScores.machiavellianism },
      { trait: '나르시시즘', value: result.traitScores.narcissism },
      { trait: '사이코패시', value: result.traitScores.psychopathy },
      { trait: '사디즘', value: result.traitScores.sadism },
    ];

    // 7–9. 저장: Service Role로 RLS 우회 (responses/assessments/results_metadata 쓰기)
    const responseData = normalizedResponses.map((r) => ({
      assessment_id: assessmentId,
      question_id: r.questionId,
      score: r.score,
    }));

    const { error: responsesError } = await db
      .from('responses')
      .upsert(responseData, { onConflict: 'assessment_id,question_id' });

    if (responsesError) {
      console.error('Responses 저장 실패:', responsesError);
    }

    const assessmentUpdate: Record<string, unknown> = {
      status: 'COMPLETED',
      total_d_score: result.dTotal,
      completed_at: new Date().toISOString(),
    };
    if (result.rawDTotal != null) (assessmentUpdate as Record<string, number>).raw_d_total = result.rawDTotal;
    if (result.isExtremeTop != null) (assessmentUpdate as Record<string, boolean>).is_extreme_top = result.isExtremeTop;

    const { error: assessmentError } = await db
      .from('assessments')
      .update(assessmentUpdate)
      .eq('id', assessmentId);

    if (assessmentError) {
      console.error('Assessment 업데이트 실패:', assessmentError);
      return NextResponse.json(
        { success: false, error: 'Failed to save results', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    const resultSnapshot = {
      traitScores: result.traitScores,
      subFactorScores: result.subFactorScores,
      dTotal: result.dTotal,
      rawDTotal: result.rawDTotal,
      isExtremeTop: result.isExtremeTop,
      analysisAccuracy: result.analysisAccuracy,
      responseTimePenalty: result.responseTimePenalty ?? false,
      insincereResponsePattern: result.insincereResponsePattern ?? false,
    };

    // 실시간 백분위 계산 (RPC 실패 시에도 저장은 진행 — graceful handling)
    let percentileAtCreation: number | null = null;
    const rawForPercentile = result.rawDTotal ?? result.dTotal;
    if (rawForPercentile != null && typeof rawForPercentile === 'number') {
      try {
        const { data: percentileData, error: rpcError } = await db
          .rpc('get_d_score_percentile', { score: rawForPercentile });
        if (!rpcError && percentileData != null && typeof percentileData === 'number') {
          percentileAtCreation = percentileData;
        } else if (rpcError) {
          console.error('[MNPS complete] get_d_score_percentile RPC failed:', rpcError.message);
          percentileAtCreation = 50;
        }
      } catch (rpcErr) {
        console.error('[MNPS complete] get_d_score_percentile RPC exception:', rpcErr);
        percentileAtCreation = 50;
      }
    }

    const { error: metadataError } = await db
      .from('results_metadata')
      .upsert({
        assessment_id: assessmentId,
        good_report_json: interpretation.good,
        bad_report_json: interpretation.bad,
        radar_chart_data: radarChartData,
        result_snapshot: resultSnapshot,
        ...(percentileAtCreation != null && { percentile_at_creation: percentileAtCreation }),
      }, { onConflict: 'assessment_id' });

    if (metadataError) {
      console.error('Results metadata 저장 실패:', metadataError);
      // 치명적이지 않으면 로그만 남기고 성공 처리 (결과는 assessments에 이미 반영됨)
    }

    // 서비스 이용 기록 (관리자 대시보드용)
    logServiceUsage(null, 'mnps', 'complete', responseTimeMs ? Math.round(responseTimeMs / 1000) : undefined).catch(() => {});

    const redirectUrl = `/mnps/result?assessmentId=${assessmentId}`;
    return NextResponse.json({
      success: true,
      redirectUrl,
      redirect: redirectUrl, // 호환용
      result: {
        dTotal: result.dTotal,
        rawDTotal: result.rawDTotal,
        isExtremeTop: result.isExtremeTop,
        traitScores: result.traitScores,
        subFactorScores: result.subFactorScores,
        analysisAccuracy: result.analysisAccuracy ?? 95,
        responseTimePenalty: result.responseTimePenalty,
        insincereResponsePattern: result.insincereResponsePattern,
        percentileAtCreation: percentileAtCreation ?? undefined,
      },
      interpretation: {
        good: interpretation.good,
        bad: null,
      },
      radarChartData,
    });
  } catch (error) {
    console.error('Complete API 오류:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
