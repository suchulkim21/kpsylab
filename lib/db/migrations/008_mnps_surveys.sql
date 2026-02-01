-- migration: 008_mnps_surveys.sql
-- MNPS 테스트 완료자 대상 설문 응답 저장 테이블
-- 목적: 규준 연구, 알고리즘 정확도 개선, 사용자 만족도 분석

-- 1. mnps_surveys 테이블 생성
CREATE TABLE IF NOT EXISTS mnps_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  -- 핵심 평가 (1~5 리커트)
  accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  -- 선택적 인구통계 (규준 연구용)
  age_group TEXT CHECK (age_group IN ('teen', '20s', '30s', '40s', '50s_plus', 'decline')),
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'decline')),
  -- 자유 서술 피드백
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assessment_id)
);

CREATE INDEX IF NOT EXISTS idx_mnps_surveys_assessment_id ON mnps_surveys(assessment_id);
CREATE INDEX IF NOT EXISTS idx_mnps_surveys_created_at ON mnps_surveys(created_at);

-- 2. RLS: 누구나 INSERT 가능 (익명 설문), SELECT는 서버(Service Role)만
ALTER TABLE mnps_surveys ENABLE ROW LEVEL SECURITY;

-- 설문 응답 생성: assessment_id만 있으면 가능 (본인 확인 불필요, 1회 1응답)
CREATE POLICY "Anyone can submit survey for assessment" ON mnps_surveys
  FOR INSERT WITH CHECK (true);

-- 조회: 관리자/분석용은 Service Role로만 (RLS 우회)
-- 일반 사용자는 본인 설문 조회 불필요
