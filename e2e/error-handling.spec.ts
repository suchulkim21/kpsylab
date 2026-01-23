import { test, expect } from '@playwright/test';

/**
 * 에러 핸들링 E2E 테스트
 */

test.describe('Error Handling', () => {
  test('should display error boundary on component error', async ({ page }) => {
    // 에러를 발생시키는 페이지로 이동 (실제로는 존재하지 않는 페이지)
    await page.goto('/non-existent-page-12345');

    // 404 페이지 또는 에러 메시지 확인
    await expect(page.locator('body')).toContainText(/404|찾을 수 없|not found/i, {
      timeout: 5000,
    });
  });

  test('should handle API error gracefully', async ({ page }) => {
    await page.goto('/board');

    // 네트워크 요청을 실패하도록 모킹
    await page.route('**/api/board/posts*', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Server error' }),
      });
    });

    // 페이지 새로고침
    await page.reload();

    // 에러 메시지가 표시되는지 확인
    const errorMessage = page.locator('text=/오류|에러|실패|error/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show error toast on API failure', async ({ page }) => {
    await page.goto('/board');

    // API 요청 실패 모킹
    await page.route('**/api/board/posts*', (route) => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: '권한이 없습니다.',
          forbidden: true,
        }),
      });
    });

    await page.reload();

    // 토스트 메시지 확인 (role="alert" 또는 aria-live)
    const toast = page.locator('[role="alert"], [aria-live]');
    await expect(toast.first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle network error', async ({ page }) => {
    await page.goto('/board');

    // 모든 네트워크 요청 차단
    await page.route('**/*', (route) => {
      route.abort('failed');
    });

    await page.reload();

    // 네트워크 에러 메시지 확인
    const errorMessage = page.locator('text=/네트워크|연결|network/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });
  });

  test('should allow retry after error', async ({ page }) => {
    await page.goto('/board');

    // 첫 번째 요청은 실패, 두 번째는 성공
    let requestCount = 0;
    await page.route('**/api/board/posts*', (route) => {
      requestCount++;
      if (requestCount === 1) {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'Server error' }),
        });
      } else {
        route.continue();
      }
    });

    await page.reload();

    // 에러 메시지 확인
    const errorMessage = page.locator('text=/오류|에러|error/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });

    // 다시 시도 버튼 클릭
    const retryButton = page.locator('button:has-text("다시 시도"), button:has-text("새로고침")');
    if (await retryButton.count() > 0) {
      await retryButton.first().click();
      // 성공적으로 로드되는지 확인
      await expect(page.locator('body')).not.toContainText(/오류|에러|error/i, {
        timeout: 5000,
      });
    }
  });
});
