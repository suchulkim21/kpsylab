-- =============================================================================
-- MNPS: 실시간 백분위(Percentile) 시스템
-- 목적: D-Score의 상대적 위치(순위)로 정확도·오락성 강화
-- =============================================================================

-- 1. 백분위 산출 함수 (COUNT 비교 / PERCENT_RANK와 동일한 논리)
-- 특정 raw_d_total이 전체 완료 응답자 중 상위 몇 %인지 계산
-- 반환값: 0~100 (자신보다 점수가 낮은 사람 비율). 상위 N% = (100 - 반환값)
-- 예: 95.8 반환 → "상위 4.2%"
CREATE OR REPLACE FUNCTION get_d_score_percentile(score numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_percentile numeric;
  v_total      bigint;
BEGIN
  SELECT COUNT(*) INTO v_total
  FROM assessments
  WHERE status = 'COMPLETED'
    AND raw_d_total IS NOT NULL;

  IF v_total IS NULL OR v_total < 10 THEN
    RETURN 50.0;
  END IF;

  SELECT ROUND(
    (COUNT(*) FILTER (WHERE raw_d_total < score)::numeric / v_total::numeric) * 100,
    1
  )
  INTO v_percentile
  FROM assessments
  WHERE status = 'COMPLETED'
    AND raw_d_total IS NOT NULL;

  RETURN COALESCE(v_percentile, 50.0);
END;
$$;

COMMENT ON FUNCTION get_d_score_percentile(numeric) IS
  'MNPS: raw_d_total 기준 백분위(0~100). 상위 4.2% = 95.8 반환';

-- 2. results_metadata에 검사 시점 백분위 저장 컬럼 추가
ALTER TABLE results_metadata
  ADD COLUMN IF NOT EXISTS percentile_at_creation numeric;

COMMENT ON COLUMN results_metadata.percentile_at_creation IS
  '검사 완료 시점의 D-Score 백분위(0~100). 상위 X% = (100 - percentile_at_creation)';
