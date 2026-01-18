import { test, expect } from '@playwright/test';

/**
 * 인증 관련 E2E 테스트
 */

test.describe('Authentication Flow', () => {
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'testpassword123',
  };

  test('should register a new user', async ({ page }) => {
    await page.goto('/register');

    // 폼 입력
    await page.fill('input[name="username"], input[placeholder*="사용자명"], input[type="text"]:first-of-type', testUser.username);
    await page.fill('input[name="email"], input[type="email"], input[placeholder*="이메일"]', testUser.email);
    await page.fill('input[name="password"], input[type="password"]:last-of-type', testUser.password);

    // 제출
    await page.click('button[type="submit"], button:has-text("가입"), button:has-text("회원가입")');

    // 성공 메시지 또는 리다이렉트 확인
    await expect(page).toHaveURL(/\/login|\/|\/dashboard/, { timeout: 5000 });
  });

  test('should login with email', async ({ page }) => {
    // 먼저 사용자 생성 (API로 또는 회원가입)
    await page.goto('/login');

    // 로그인 폼 입력
    const identifierInput = page.locator('input[name="identifier"], input[placeholder*="이메일"], input[type="text"]:first-of-type, input[type="email"]');
    await identifierInput.fill(testUser.email);
    await page.fill('input[name="password"], input[type="password"]', testUser.password);

    // 로그인 버튼 클릭
    await page.click('button[type="submit"], button:has-text("로그인")');

    // 로그인 성공 확인 (리다이렉트 또는 사용자 정보 표시)
    await expect(page).not.toHaveURL(/\/login/, { timeout: 5000 });
    
    // 사용자 메뉴가 표시되는지 확인
    const userMenu = page.locator('text=' + testUser.username).or(page.locator('[aria-label*="user"]'));
    await expect(userMenu.first()).toBeVisible({ timeout: 3000 });
  });

  test('should login with username', async ({ page }) => {
    await page.goto('/login');

    // 사용자명으로 로그인 시도
    const identifierInput = page.locator('input[name="identifier"], input[placeholder*="이메일"], input[type="text"]:first-of-type');
    await identifierInput.fill(testUser.username);
    await page.fill('input[name="password"], input[type="password"]', testUser.password);

    await page.click('button[type="submit"], button:has-text("로그인")');

    // 로그인 성공 확인
    await expect(page).not.toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // 잘못된 자격증명 입력
    const identifierInput = page.locator('input[name="identifier"], input[placeholder*="이메일"], input[type="text"]:first-of-type, input[type="email"]');
    await identifierInput.fill('invalid@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');

    await page.click('button[type="submit"], button:has-text("로그인")');

    // 에러 메시지 확인
    await expect(page.locator('text=올바르지 않습니다, text=실패, text=에러').first()).toBeVisible({ timeout: 3000 });
  });

  test('should logout successfully', async ({ page }) => {
    // 먼저 로그인
    await page.goto('/login');
    const identifierInput = page.locator('input[name="identifier"], input[placeholder*="이메일"], input[type="text"]:first-of-type, input[type="email"]');
    await identifierInput.fill(testUser.email);
    await page.fill('input[name="password"], input[type="password"]', testUser.password);
    await page.click('button[type="submit"], button:has-text("로그인")');
    
    // 로그인 완료 대기
    await expect(page).not.toHaveURL(/\/login/, { timeout: 5000 });

    // 사용자 메뉴 클릭
    const userMenu = page.locator('text=' + testUser.username).or(page.locator('button:has-text("로그아웃")').first());
    await userMenu.first().click({ timeout: 3000 }).catch(() => {
      // 메뉴가 이미 열려있거나 다른 방식으로 접근
    });

    // 로그아웃 버튼 클릭
    await page.click('button:has-text("로그아웃"), a:has-text("로그아웃")');

    // 로그아웃 확인 (로그인 페이지로 리다이렉트 또는 로그인 버튼 표시)
    await expect(page.locator('button:has-text("로그인"), a:has-text("로그인")').first()).toBeVisible({ timeout: 5000 });
  });
});

