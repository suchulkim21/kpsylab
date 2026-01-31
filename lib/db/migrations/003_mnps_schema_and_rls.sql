-- migration: 003_mnps_schema_and_rls.sql
-- 스키마 확장 + RLS 정책 (단일 파일). 001 실행 후 적용.

-- 1. Assessments 테이블 확장
ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS raw_d_total NUMERIC,   -- 100점 초과 가능
  ADD COLUMN IF NOT EXISTS is_extreme_top BOOLEAN DEFAULT FALSE,  -- 상위 극단 태그
  ADD COLUMN IF NOT EXISTS session_id UUID;      -- 비로그인 유저 식별용

CREATE INDEX IF NOT EXISTS idx_assessments_session_id ON assessments(session_id);

-- 2. Results Metadata 테이블 확장
ALTER TABLE results_metadata
  ADD COLUMN IF NOT EXISTS result_snapshot JSONB,       -- 결과 전체 스냅샷
  ADD COLUMN IF NOT EXISTS response_time_penalty BOOLEAN DEFAULT FALSE;

-- 3. RLS 활성화 (이미 001에서 활성화되어 있어도 재실행 가능)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE results_metadata ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거 (001 또는 이전 003/004에서 생성된 정책)
DROP POLICY IF EXISTS "Allow anonymous assessment creation" ON assessments;
DROP POLICY IF EXISTS "Allow own responses" ON responses;
DROP POLICY IF EXISTS "Allow own results" ON results_metadata;
DROP POLICY IF EXISTS "Users can access their own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON assessments;
DROP POLICY IF EXISTS "Anonymous users can access via session_id" ON assessments;
DROP POLICY IF EXISTS "Anyone can create assessment" ON assessments;
DROP POLICY IF EXISTS "Access responses based on assessment ownership" ON responses;
DROP POLICY IF EXISTS "Access responses via assessment ownership" ON responses;
DROP POLICY IF EXISTS "Read own results metadata" ON results_metadata;

-- 4. RLS 정책: Assessments
-- (1) 로그인 유저: 본인 소유 접근
CREATE POLICY "Users can view own assessments" ON assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments" ON assessments
  FOR UPDATE USING (auth.uid() = user_id);

-- (2) 비로그인 유저: session_id 기반 접근 (API에서 SET app.session_id = ... 전제)
CREATE POLICY "Anonymous access via session_id" ON assessments
  FOR SELECT USING (session_id IS NOT NULL AND session_id::text = current_setting('app.session_id', true));

-- (3) 생성: 누구나 가능
CREATE POLICY "Anyone can create assessment" ON assessments
  FOR INSERT WITH CHECK (true);

-- 5. RLS 정책: Responses (부모 Assessment 소유권 확인)
CREATE POLICY "Access responses via assessment ownership" ON responses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = responses.assessment_id
      AND (
        a.user_id = auth.uid() OR
        (a.session_id IS NOT NULL AND a.session_id::text = current_setting('app.session_id', true))
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = responses.assessment_id
      AND (
        a.user_id = auth.uid() OR
        (a.session_id IS NOT NULL AND a.session_id::text = current_setting('app.session_id', true))
      )
    )
  );

-- 6. RLS 정책: Results Metadata (읽기 전용, 쓰기는 Service Role)
CREATE POLICY "Read own results metadata" ON results_metadata
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = results_metadata.assessment_id
      AND (
        a.user_id = auth.uid() OR
        (a.session_id IS NOT NULL AND a.session_id::text = current_setting('app.session_id', true))
      )
    )
  );
-- 주의: Results Metadata에 대한 INSERT/UPDATE 정책이 없으므로,
-- 오직 Service Role Key를 가진 서버 API만 쓰기가 가능합니다. (의도된 보안 설계)
