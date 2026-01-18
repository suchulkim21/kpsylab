-- blog_posts 테이블에 UPDATE 권한 추가
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 익명 사용자도 블로그 포스트를 업데이트할 수 있도록 정책 추가
CREATE POLICY "Public update access" ON blog_posts FOR UPDATE USING (true) WITH CHECK (true);

-- 또는 관리자만 업데이트할 수 있도록 하려면 (권장):
-- CREATE POLICY "Authenticated users can update" ON blog_posts 
--   FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
