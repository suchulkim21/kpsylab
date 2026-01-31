-- MNPS 고도화: 서버 주도 채점·천장 효과·비로그인 식별
-- 1. 필요한 컬럼 추가 (아직 없다면)
-- assessments: raw_d_total, is_extreme_top, session_id (비로그인 유저 식별용)
-- results_metadata: result_snapshot, response_time_penalty

ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS raw_d_total NUMERIC,
  ADD COLUMN IF NOT EXISTS is_extreme_top BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS session_id UUID;

COMMENT ON COLUMN assessments.raw_d_total IS '원점수 D-Total (100 초과 가능). 표출용은 total_d_score';
COMMENT ON COLUMN assessments.is_extreme_top IS 'raw_d_total > 100 시 상위 Extreme 태그';
COMMENT ON COLUMN assessments.session_id IS '비로그인 유저 식별용. 쿠키/헤더와 매칭';

-- results_metadata: 서버에서 계산한 결과 스냅샷 + 응답 시간 페널티 플래그
ALTER TABLE results_metadata
  ADD COLUMN IF NOT EXISTS result_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS response_time_penalty BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN results_metadata.result_snapshot IS 'traitScores, subFactorScores, dTotal, rawDTotal, isExtremeTop, analysisAccuracy, responseTimePenalty';
COMMENT ON COLUMN results_metadata.response_time_penalty IS '문항당 0.8초 미만 완료 시 true';

CREATE INDEX IF NOT EXISTS idx_assessments_session_id ON assessments(session_id) WHERE session_id IS NOT NULL;
