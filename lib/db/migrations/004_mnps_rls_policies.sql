-- MNPS RLS 정책: 로그인 유저는 user_id, 비로그인 유저는 session_id로만 접근
-- results_metadata: 유저는 SELECT만 가능, 쓰기는 Service Role만 (정책 없음 = 쓰기 불가)
--
-- 비로그인 조회 시: API에서 쿼리 실행 전 SET app.session_id = '...' 호출 필요.
-- 보안 수준을 높일 때는 JWT claim 사용 권장.

-- 2. RLS 활성화
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE results_metadata ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거 (이미 있다면)
DROP POLICY IF EXISTS "Allow anonymous assessment creation" ON assessments;
DROP POLICY IF EXISTS "assessments_select_owner_or_session" ON assessments;
DROP POLICY IF EXISTS "assessments_insert_any" ON assessments;
DROP POLICY IF EXISTS "assessments_update_owner_or_session" ON assessments;
DROP POLICY IF EXISTS "Allow own responses" ON responses;
DROP POLICY IF EXISTS "responses_select_via_assessment" ON responses;
DROP POLICY IF EXISTS "responses_insert_via_assessment" ON responses;
DROP POLICY IF EXISTS "responses_update_via_assessment" ON responses;
DROP POLICY IF EXISTS "Allow own results" ON results_metadata;
DROP POLICY IF EXISTS "results_metadata_select_owner_or_session" ON results_metadata;

-- 3. 정책 정의: Assessments
-- (1) 내 소유의 Assessment만 조회/수정 가능 (로그인 유저)
CREATE POLICY "Users can access their own assessments"
ON assessments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
ON assessments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- (2) 세션 ID 기반 접근 (비로그인 유저, 조회만). API에서 SET app.session_id = '...' 호출 필요
CREATE POLICY "Anonymous users can access via session_id"
ON assessments
FOR SELECT
USING (session_id IS NOT NULL AND session_id::text = current_setting('app.session_id', true));

-- (3) 생성은 누구나 가능 (INSERT). UPDATE는 로그인 유저만 또는 Service Role로 처리
CREATE POLICY "Anyone can create assessment"
ON assessments
FOR INSERT
WITH CHECK (true);

-- 4. 정책 정의: Responses & Results Metadata
-- 부모(assessments)의 소유권을 확인하는 서브쿼리 활용

-- Responses: 내 Assessment에 달린 응답만 제어
CREATE POLICY "Access responses based on assessment ownership"
ON responses
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = responses.assessment_id
    AND (a.user_id = auth.uid() OR (a.session_id IS NOT NULL AND a.session_id::text = current_setting('app.session_id', true)))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = responses.assessment_id
    AND (a.user_id = auth.uid() OR (a.session_id IS NOT NULL AND a.session_id::text = current_setting('app.session_id', true)))
  )
);

-- Results Metadata: 읽기 전용 (쓰기는 Service Role만 가능하게 하여 조작 방지)
CREATE POLICY "Read own results metadata"
ON results_metadata
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = results_metadata.assessment_id
    AND (a.user_id = auth.uid() OR (a.session_id IS NOT NULL AND a.session_id::text = current_setting('app.session_id', true)))
  )
);

-- INSERT/UPDATE/DELETE 정책 없음 → anon/authenticated는 results_metadata 쓰기 불가. Service Role만 가능.
