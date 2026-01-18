-- blog_posts 테이블에 INSERT 권한 추가
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 익명 사용자도 블로그 포스트를 추가할 수 있도록 정책 추가
CREATE POLICY "Public insert access" ON blog_posts FOR INSERT WITH CHECK (true);

-- 또는 관리자만 추가할 수 있도록 하려면 (권장):
-- CREATE POLICY "Authenticated users can insert" ON blog_posts 
--   FOR INSERT WITH CHECK (auth.role() = 'authenticated');
