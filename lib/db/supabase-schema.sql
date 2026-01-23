-- KPSY LAB Portal - Supabase 데이터베이스 스키마
-- Vercel 배포용 Supabase 마이그레이션

-- ============================================
-- 1. 사용자 테이블 (users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- 2. 분석 데이터 테이블 (analytics)
-- ============================================

-- 접속 로그 테이블 (visits)
CREATE TABLE IF NOT EXISTS visits (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  country TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visits_user_id ON visits(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_session_id ON visits(session_id);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at);
CREATE INDEX IF NOT EXISTS idx_visits_page_path ON visits(page_path);

-- 페이지 조회 테이블 (page_views)
CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  page_path TEXT NOT NULL,
  page_type TEXT,
  resource_id BIGINT,
  view_count INTEGER DEFAULT 1,
  last_viewed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_path, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_resource_id ON page_views(resource_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_type ON page_views(page_type);

-- 서비스 사용 로그 (service_usage)
CREATE TABLE IF NOT EXISTS service_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL,
  action_type TEXT,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_usage_user_id ON service_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_service_usage_service_name ON service_usage(service_name);
CREATE INDEX IF NOT EXISTS idx_service_usage_created_at ON service_usage(created_at);

-- ============================================
-- 3. 게시판 테이블 (board)
-- ============================================
CREATE TABLE IF NOT EXISTS board_posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  anon_id TEXT,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_board_posts_author ON board_posts(author);
CREATE INDEX IF NOT EXISTS idx_board_posts_anon_id ON board_posts(anon_id);
CREATE INDEX IF NOT EXISTS idx_board_posts_created_at ON board_posts(created_at);

-- ============================================
-- 4. 테스트 결과 테이블 (test_results)
-- ============================================
CREATE TABLE IF NOT EXISTS test_results (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL,
  test_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_type ON test_results(test_type);
CREATE INDEX IF NOT EXISTS idx_test_results_created_at ON test_results(created_at);

-- ============================================
-- 5. 블로그 포스트 테이블 (blog_posts)
-- ============================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  date TEXT NOT NULL,
  tags TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts(tags);

-- ============================================
-- 6. RLS (Row Level Security) 정책 설정
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public 읽기 정책 (익명 사용자도 읽기 가능)
CREATE POLICY "Public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Public read access" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "Public read access" ON board_posts FOR SELECT USING (true);
CREATE POLICY "Public read access" ON page_views FOR SELECT USING (true);

-- 사용자 본인 데이터 접근 정책
CREATE POLICY "Users can read own data" ON test_results FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own data" ON test_results FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 서비스 사용 로그는 모두 접근 가능 (익명 로깅 지원)
CREATE POLICY "Public insert access" ON visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON service_usage FOR INSERT WITH CHECK (true);

-- 마스터 계정만 접근 가능한 정책 (필요시 추가)
-- CREATE POLICY "Master admin access" ON users FOR ALL USING (
--   EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'master')
-- );

-- ============================================
-- 7. 함수 및 트리거
-- ============================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_posts_updated_at BEFORE UPDATE ON board_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

