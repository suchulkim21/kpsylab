-- Dark Nature Test 데이터베이스 스키마
-- Supabase SQL Editor에서 실행

-- 1. users 테이블 (이미 존재할 수 있음)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. questions 테이블 (문항 관리)
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY, -- 'm1', 'n1', 'sc1' 등
  category TEXT NOT NULL CHECK (category IN ('darkTetrad', 'dFactor', 'validation', 'scenario')),
  trait TEXT CHECK (trait IN ('machiavellianism', 'narcissism', 'psychopathy', 'sadism')),
  sub_factor TEXT CHECK (sub_factor IN ('egoism', 'entitlement', 'moralDisengagement', 'spitefulness')),
  content TEXT NOT NULL,
  question_order INTEGER NOT NULL,
  weight FLOAT DEFAULT 1.0,
  reverse_scored BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. assessments 테이블 (테스트 세션)
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- 익명 가능
  status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED')),
  is_paid BOOLEAN DEFAULT FALSE,
  total_d_score FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. responses 테이블 (응답 저장)
CREATE TABLE IF NOT EXISTS responses (
  id BIGSERIAL PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id),
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assessment_id, question_id)
);

-- 5. results_metadata 테이블 (Good/Bad 리포트)
CREATE TABLE IF NOT EXISTS results_metadata (
  assessment_id UUID PRIMARY KEY REFERENCES assessments(id) ON DELETE CASCADE,
  good_report_json JSONB NOT NULL, -- 무료 리포트
  bad_report_json JSONB NOT NULL, -- 유료 리포트 (결제 후 공개)
  radar_chart_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_responses_assessment_id ON responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON responses(question_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(question_order);

-- RLS (Row Level Security) 정책 (선택적)
-- 익명 사용자도 assessments 생성 가능하도록
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE results_metadata ENABLE ROW LEVEL SECURITY;

-- 익명 사용자도 자신의 assessment 생성 가능
CREATE POLICY "Allow anonymous assessment creation" ON assessments
  FOR INSERT WITH CHECK (true);

-- 자신이 생성한 assessment의 responses 조회 가능
CREATE POLICY "Allow own responses" ON responses
  FOR ALL USING (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid() OR user_id IS NULL
    )
  );

-- 자신이 생성한 assessment의 results 조회 가능 (is_paid 체크는 애플리케이션 레벨에서)
CREATE POLICY "Allow own results" ON results_metadata
  FOR SELECT USING (
    assessment_id IN (
      SELECT id FROM assessments WHERE user_id = auth.uid() OR user_id IS NULL
    )
  );
