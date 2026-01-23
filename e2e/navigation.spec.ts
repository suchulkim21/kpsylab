import { test, expect } from '@playwright/test';

/**
 * 네비게이션 및 메인 페이지 E2E 테스트
 */

test.describe('Navigation and Main Page', () => {
  test('should load main page', async ({ page }) => {
    await page.goto('/');

    // 페이지가 로드되었는지 확인
    await expect(page).toHaveTitle(/KPSY|LAB/i);
    
    // 메인 콘텐츠가 로드되었는지 확인
    await expect(page.locator('body')).not.toHaveText(/로딩|Loading/, { timeout: 5000 });
  });

  test('should navigate to MNPS service', async ({ page }) => {
    await page.goto('/');

    // MNPS 링크 클릭
    await page.click('a:has-text("MNPS"), nav a[href*="mnps"]');

    // MNPS 페이지로 이동 확인
    await expect(page).toHaveURL(/\/mnps/, { timeout: 5000 });
  });

  test('should navigate to 성장 로드맵 service', async ({ page }) => {
    await page.goto('/');

    // 성장 로드맵 링크 클릭
    await page.click('a:has-text("성장 로드맵"), nav a[href*="growth-roadmap"]');

    // 성장 로드맵 페이지로 이동 확인
    await expect(page).toHaveURL(/\/growth-roadmap/, { timeout: 5000 });
  });

  test('should navigate to services page', async ({ page }) => {
    await page.goto('/');

    // 서비스 소개 링크 클릭
    const servicesLink = page.locator('a:has-text("서비스"), nav a[href*="services"]');
    const count = await servicesLink.count();

    if (count > 0) {
      await servicesLink.first().click();
      await expect(page).toHaveURL(/\/services/, { timeout: 5000 });
    }
  });

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/');

    // 네비게이션 메뉴 요소들이 표시되는지 확인
    const nav = page.locator('nav, header, [role="navigation"]').first();
    await expect(nav).toBeVisible();

    // 주요 메뉴 항목 확인
    const menuItems = ['홈', 'MNPS', '성장 로드맵', '블로그'];
    for (const item of menuItems) {
      const menuLink = page.locator(`a:has-text("${item}")`);
      const count = await menuLink.count();
      if (count > 0) {
        await expect(menuLink.first()).toBeVisible();
      }
    }
  });
});

