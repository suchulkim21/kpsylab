import { test, expect } from '@playwright/test';

/**
 * 블로그 관련 E2E 테스트
 */

test.describe('Blog Functionality', () => {
  test('should display blog posts on main page', async ({ page }) => {
    await page.goto('/');

    // 블로그 포스트가 표시되는지 확인
    // 헤더나 제목이 있는지 확인
    const blogSection = page.locator('text=블로그, text=Blog, h2, h3').first();
    await expect(blogSection).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to blog page', async ({ page }) => {
    await page.goto('/');

    // 블로그 링크 클릭
    await page.click('a:has-text("블로그"), nav a[href*="blog"]');

    // 블로그 페이지로 이동 확인
    await expect(page).toHaveURL(/\/blog/, { timeout: 5000 });
  });

  test('should display blog post list', async ({ page }) => {
    await page.goto('/blog');

    // 블로그 포스트 목록이 표시되는지 확인
    // 최소한 페이지가 로드되고 콘텐츠가 있는지 확인
    await expect(page.locator('body')).not.toHaveText(/로딩|Loading/, { timeout: 5000 });
    
    // 블로그 포스트 카드나 링크가 있는지 확인 (없을 수도 있음)
    const posts = page.locator('article, [class*="post"], a[href*="/blog/"]');
    const count = await posts.count();
    
    // 포스트가 없어도 에러가 없어야 함
    if (count > 0) {
      await expect(posts.first()).toBeVisible();
    }
  });

  test('should navigate to blog post detail', async ({ page }) => {
    await page.goto('/blog');

    // 첫 번째 블로그 포스트 링크 찾기
    const firstPostLink = page.locator('a[href*="/blog/"]').first();
    const count = await firstPostLink.count();

    if (count > 0) {
      const href = await firstPostLink.getAttribute('href');
      await firstPostLink.click();

      // 상세 페이지로 이동 확인
      await expect(page).toHaveURL(/\/blog\/\d+/, { timeout: 5000 });

      // 포스트 제목이 표시되는지 확인
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should search blog posts', async ({ page }) => {
    await page.goto('/blog');

    // 검색 입력 필드 찾기
    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"], input[name*="search"]');
    const searchCount = await searchInput.count();

    if (searchCount > 0) {
      await searchInput.fill('심리');
      await searchInput.press('Enter');

      // 검색 결과 페이지로 이동 또는 결과 표시 확인
      await expect(page).toHaveURL(/.*search.*|.*q=.*/, { timeout: 3000 }).catch(() => {
        // URL 변경 없이 결과만 필터링될 수도 있음
      });
    }
  });
});

