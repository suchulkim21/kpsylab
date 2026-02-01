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

  test('should handle network error', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === 'Mobile Safari' || testInfo.project.name === 'webkit',
      'Mobile Safari/WebKit: 네트워크 차단 시 동작 이슈'
    );

    await page.route('**/api/board/**', (route) => route.abort('failed'));

    await page.goto('/board');

    const errorMessage = page.locator('text=/네트워크|연결|오류|에러|실패|알 수 없|network|error/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });
  });

  test('should allow retry after error', async ({ page }) => {
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

    await page.goto('/board');

    // 에러 메시지 (한국어: 서버 오류, 실패, 알 수 없 등)
    const errorMessage = page.locator('text=/오류|에러|실패|알 수 없|error|Server|잘못된/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });

    const retryButton = page.getByRole('button', { name: /다시 시도|새로고침/ });
    await expect(retryButton.first()).toBeVisible({ timeout: 5000 });
    await retryButton.first().click();

    // 재시도 후 정상 UI (여러 요소 매칭 시 첫 번째 사용)
    await expect(
      page.locator('text=/게시판|게시글|아직 작성된 글이 없습니다|번호|제목|글쓰기/').first()
    ).toBeVisible({ timeout: 8000 });
  });
});
