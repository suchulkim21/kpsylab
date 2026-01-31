-- 블로그 콘텐츠 일정 관리 테이블
-- KPSY LAB Portal

-- 콘텐츠 일정 테이블
CREATE TABLE IF NOT EXISTS blog_content_schedule (
  id BIGSERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'in_progress', 'published', 'cancelled')),
  scheduled_date DATE,
  publish_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes TEXT,
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_post_id BIGINT REFERENCES blog_posts(id) ON DELETE SET NULL
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_blog_schedule_status ON blog_content_schedule(status);
CREATE INDEX IF NOT EXISTS idx_blog_schedule_date ON blog_content_schedule(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_blog_schedule_category ON blog_content_schedule(category);

-- RLS 활성화
ALTER TABLE blog_content_schedule ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능 (공개 일정)
CREATE POLICY "Public read access" ON blog_content_schedule
  FOR SELECT USING (true);

-- 관리자만 쓰기 가능 (실제로는 API에서 ADMIN_SECRET로 검증)
CREATE POLICY "Admin write access" ON blog_content_schedule
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin update access" ON blog_content_schedule
  FOR UPDATE USING (true);

CREATE POLICY "Admin delete access" ON blog_content_schedule
  FOR DELETE USING (true);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_blog_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_schedule_updated_at
  BEFORE UPDATE ON blog_content_schedule
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_schedule_updated_at();
