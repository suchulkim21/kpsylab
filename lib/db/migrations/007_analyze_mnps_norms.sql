-- migration: 007_analyze_mnps_norms.sql
-- MNPS 판정 기준(High/Mid/Low Cutoff) 보정용 통계 분석 RPC.
-- Target: assessments (status = 'COMPLETED') + results_metadata.result_snapshot (4 traits).
-- Metrics: Mean, StdDev, Percentiles (상위 10%/20%/30%/50% 지점 = p90, p80, p70, p50).
-- Output: JSON. GET /api/admin/mnps/norm-analysis 또는 Supabase RPC analyze_mnps_norms() 호출로 사용.

CREATE OR REPLACE FUNCTION analyze_mnps_norms()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_raw_n BIGINT;
  v_raw_mean NUMERIC;
  v_raw_stddev NUMERIC;
  v_raw_p50 NUMERIC;
  v_raw_p70 NUMERIC;
  v_raw_p80 NUMERIC;
  v_raw_p90 NUMERIC;
  v_trait_n BIGINT;
  v_trait_mean NUMERIC;
  v_trait_stddev NUMERIC;
  v_trait_p50 NUMERIC;
  v_trait_p70 NUMERIC;
  v_trait_p80 NUMERIC;
  v_trait_p90 NUMERIC;
  v_traits JSONB := '{}';
  v_trait_names TEXT[] := ARRAY['machiavellianism','narcissism','psychopathy','sadism'];
  v_trait_name TEXT;
BEGIN
  -- raw_d_total: assessments (COMPLETED만)
  SELECT
    COUNT(*)::BIGINT,
    ROUND(AVG(raw_d_total)::numeric, 4),
    ROUND(STDDEV_SAMP(raw_d_total)::numeric, 4),
    ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY raw_d_total)::numeric, 2),
    ROUND(PERCENTILE_CONT(0.70) WITHIN GROUP (ORDER BY raw_d_total)::numeric, 2),
    ROUND(PERCENTILE_CONT(0.80) WITHIN GROUP (ORDER BY raw_d_total)::numeric, 2),
    ROUND(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY raw_d_total)::numeric, 2)
  INTO v_raw_n, v_raw_mean, v_raw_stddev, v_raw_p50, v_raw_p70, v_raw_p80, v_raw_p90
  FROM assessments
  WHERE status = 'COMPLETED'
    AND raw_d_total IS NOT NULL;

  -- 4개 Trait: results_metadata.result_snapshot->traitScores (JOIN assessments COMPLETED)
  FOREACH v_trait_name IN ARRAY v_trait_names
  LOOP
    EXECUTE format(
      'SELECT COUNT(*)::BIGINT, ROUND(AVG((r.result_snapshot->''traitScores''->>%L)::numeric)::numeric, 4), ROUND(STDDEV_SAMP((r.result_snapshot->''traitScores''->>%L)::numeric)::numeric, 4), ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY (r.result_snapshot->''traitScores''->>%L)::numeric)::numeric, 2), ROUND(PERCENTILE_CONT(0.70) WITHIN GROUP (ORDER BY (r.result_snapshot->''traitScores''->>%L)::numeric)::numeric, 2), ROUND(PERCENTILE_CONT(0.80) WITHIN GROUP (ORDER BY (r.result_snapshot->''traitScores''->>%L)::numeric)::numeric, 2), ROUND(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY (r.result_snapshot->''traitScores''->>%L)::numeric)::numeric, 2) FROM results_metadata r JOIN assessments a ON a.id = r.assessment_id AND a.status = ''COMPLETED'' WHERE r.result_snapshot IS NOT NULL AND r.result_snapshot->''traitScores''->%L IS NOT NULL AND (r.result_snapshot->''traitScores''->>%L) ~ ''^[0-9]+\.?[0-9]*$''',
      v_trait_name, v_trait_name, v_trait_name, v_trait_name, v_trait_name, v_trait_name, v_trait_name, v_trait_name
    ) INTO v_trait_n, v_trait_mean, v_trait_stddev, v_trait_p50, v_trait_p70, v_trait_p80, v_trait_p90;

    v_traits := v_traits || jsonb_build_object(
      v_trait_name,
      jsonb_build_object(
        'n', COALESCE(v_trait_n, 0),
        'mean', v_trait_mean,
        'stddev', v_trait_stddev,
        'p50', v_trait_p50,
        'p70', v_trait_p70,
        'p80', v_trait_p80,
        'p90', v_trait_p90
      )
    );
  END LOOP;

  RETURN jsonb_build_object(
    'raw_d_total',
    jsonb_build_object(
      'n', COALESCE(v_raw_n, 0),
      'mean', v_raw_mean,
      'stddev', v_raw_stddev,
      'p50', v_raw_p50,
      'p70', v_raw_p70,
      'p80', v_raw_p80,
      'p90', v_raw_p90
    ),
    'traits',
    v_traits
  );
END;
$$;

COMMENT ON FUNCTION analyze_mnps_norms() IS
  'MNPS 규준 보정: COMPLETED assessments 기준 raw_d_total·4 trait별 Mean, StdDev, 상위 10%/20%/30%/50% 지점(p90,p80,p70,p50) 반환. NORM_CONFIG 보정 시 참고.';
