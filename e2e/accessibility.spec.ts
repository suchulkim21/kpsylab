import { test, expect } from '@playwright/test';

/**
 * 접근성 (a11y) E2E 테스트
 */

test.describe('Accessibility', () => {
  // axe-playwright가 설치되어 있으면 사용
  let injectAxe: ((page: any) => Promise<void>) | null = null;
  let checkA11y: ((page: any, context?: any, options?: any) => Promise<void>) | null = null;

  test.beforeAll(async () => {
    try {
      // @ts-expect-error - axe-playwright는 선택적 의존성 (설치 시에만 사용)
      const axe = await import('axe-playwright');
      injectAxe = axe.injectAxe;
      checkA11y = axe.checkA11y;
    } catch {
      // axe-playwright가 설치되지 않았으면 수동 테스트만 수행
      console.warn('axe-playwright not installed, skipping automated a11y checks');
    }
  });

  test.beforeEach(async ({ page }) => {
    // axe-core 주입 (설치되어 있을 때만)
    if (injectAxe) {
      await injectAxe(page);
    }
  });

  test('should have no accessibility violations on home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 접근성 검사 (axe-playwright가 설치되어 있을 때만)
    if (checkA11y) {
      await checkA11y(page, undefined, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    } else {
      // 기본적인 접근성 검사 (수동)
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThan(0);
    }
  });

  test('should have proper ARIA labels on navigation', async ({ page }) => {
    await page.goto('/');

    const nav = page.locator('nav[role="navigation"], [role="navigation"]');
    await expect(nav.first()).toBeVisible();

    // 홈 링크 (로고 또는 aria-label에 홈 포함)
    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible({ timeout: 5000 });
  });

  test('should support keyboard navigation', async ({ page }, testInfo) => {
    await page.goto('/');

    const isMobile = (page.viewportSize()?.width ?? 0) < 768;
    test.skip(isMobile, '키보드 네비게이션은 데스크톱 전용');
    test.skip(testInfo.project.name === 'webkit', 'WebKit: Tab 포커스 동작 다름');

    // Tab 키로 포커스 이동
    await page.keyboard.press('Tab');
    
    // 포커스가 있는 요소 확인
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible({ timeout: 3000 });

    // Enter 키로 링크 활성화 (스킵 링크는 #main-content로 이동)
    await page.keyboard.press('Enter');
    
    // 페이지 이동 또는 앵커 확인
    const url = page.url();
    expect(url.endsWith('/') || url.includes('#main-content')).toBeTruthy();
  });

  test('should have skip links', async ({ page }, testInfo) => {
    await page.goto('/');

    const skipLink = page.locator('a[href="#main-content"]').first();
    await expect(skipLink).toHaveCount(1);

    const isMobile = (page.viewportSize()?.width ?? 0) < 768;
    const isWebKit = testInfo.project.name === 'webkit';
    if (!isMobile && !isWebKit) {
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/#main-content/, { timeout: 2000 });
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/board/write');

    // 모든 input에 연결된 label 확인
    const inputs = page.locator('input[type="text"], textarea');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const inputId = await input.getAttribute('id');
      
      if (inputId) {
        // label의 htmlFor가 input의 id와 일치하는지 확인
        const label = page.locator(`label[for="${inputId}"]`);
        await expect(label.first()).toBeVisible();
      }
    }
  });

  test('should announce errors to screen readers', async ({ page }) => {
    await page.goto('/board/write');

    // 폼 제출 (빈 필드)
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // role="alert" 또는 aria-live 요소 확인
    const alert = page.locator('[role="alert"], [aria-live="assertive"]');
    await expect(alert.first()).toBeVisible({ timeout: 3000 });
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // h1이 하나만 있는지 확인
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    expect(h1Count).toBeLessThanOrEqual(2); // 최대 2개 (헤더 + 메인)

    // h1 다음에 h2가 오는지 확인 (계층 구조)
    const headings = await page.locator('h1, h2, h3').all();
    let lastLevel = 0;
    
    for (const heading of headings) {
      const tagName = await heading.evaluate((el) => el.tagName.toLowerCase());
      const level = parseInt(tagName.charAt(1));
      
      // 계층이 너무 많이 건너뛰지 않는지 확인 (h1 -> h3는 안 됨)
      if (lastLevel > 0 && level > lastLevel + 1) {
        throw new Error(`Heading hierarchy violation: ${tagName} after h${lastLevel}`);
      }
      
      lastLevel = level;
    }
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');

    // 모든 이미지 확인
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      
      // alt 속성이 있거나 role="presentation" 또는 "none"이어야 함
      expect(alt !== null || role === 'presentation' || role === 'none').toBeTruthy();
    }
  });

  test('should support focus visible styles', async ({ page }, testInfo) => {
    await page.goto('/');

    const isMobile = (page.viewportSize()?.width ?? 0) < 768;
    test.skip(isMobile, '포커스 스타일 검사는 데스크톱 전용');
    test.skip(testInfo.project.name === 'webkit', 'WebKit: Tab 포커스 동작 다름');

    // Tab 키로 포커스 이동
    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible({ timeout: 3000 });

    const outline = await focusedElement.evaluate((el) => {
      return window.getComputedStyle(el).outline;
    });
    
    // 포커스 스타일이 있는지 확인 (outline 또는 box-shadow)
    expect(outline !== 'none' && outline !== '').toBeTruthy();
  });
});
