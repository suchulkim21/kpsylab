-- blog_posts 테이블에 DELETE 권한 추가
-- 모든 사용자가 blog_posts를 삭제할 수 있도록 허용

-- 기존 DELETE 정책이 있다면 삭제
DROP POLICY IF EXISTS "Public delete access" ON blog_posts;

-- 새로운 DELETE 정책 생성 (모든 사용자 허용)
CREATE POLICY "Public delete access" ON blog_posts FOR DELETE USING (true);
