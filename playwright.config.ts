import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 테스트 설정
 * https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* 테스트를 병렬로 실행 */
  fullyParallel: true,
  /* CI에서 실패 시 재시도 */
  retries: process.env.CI ? 2 : 0,
  /* CI에서 병렬 실행 수 */
  workers: process.env.CI ? 1 : undefined,
  /* 테스트 보고서 설정 */
  reporter: [
    ['html'],
    ['list'],
  ],
  /* 공유 설정 */
  use: {
    /* Base URL */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:7777',
    /* 스크린샷 설정 */
    screenshot: 'only-on-failure',
    /* 비디오 설정 */
    video: 'retain-on-failure',
    /* 트레이스 설정 */
    trace: 'on-first-retry',
  },

  /* 테스트할 프로젝트 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* 모바일 뷰포트 테스트 */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* 개발 서버 설정 (Next.js) */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:7777',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

