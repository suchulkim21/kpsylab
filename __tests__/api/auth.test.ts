import { describe, it, expect, beforeEach } from 'vitest';

/**
 * API 통합 테스트
 * 실제 HTTP 요청을 시뮬레이션하여 API 엔드포인트를 테스트합니다.
 * 
 * 주의: 이 테스트는 실제 Next.js 서버가 실행 중이어야 합니다.
 * 개발 환경에서 `npm run dev` 실행 후 테스트를 실행하세요.
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:7777';

describe('Auth API Integration Tests', () => {
  let testUserId: string | null = null;
  let testAuthToken: string | null = null;

  beforeEach(() => {
    // 각 테스트 전 초기화
    testUserId = null;
    testAuthToken = null;
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const testEmail = `test${Date.now()}@example.com`;
      const testUsername = `testuser${Date.now()}`;
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: testUsername,
          email: testEmail,
          password: 'testpassword123',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testEmail);
      expect(data.user.username).toBe(testUsername);
      expect(data.user.password).toBeUndefined(); // 비밀번호가 응답에 포함되면 안 됨
      
      testUserId = data.user.id;
    });

    it('should reject registration with missing fields', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          // email과 password 누락
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it('should reject registration with invalid email', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          email: 'invalid-email',
          password: 'testpassword123',
        }),
      });

      // 400 또는 422 응답 기대
      expect([400, 422]).toContain(response.status);
    });

    it('should reject registration with duplicate email', async () => {
      const testEmail = `duplicate${Date.now()}@example.com`;
      const testUsername1 = `user1${Date.now()}`;
      const testUsername2 = `user2${Date.now()}`;

      // 첫 번째 가입
      await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: testUsername1,
          email: testEmail,
          password: 'testpassword123',
        }),
      });

      // 동일한 이메일로 두 번째 가입 시도
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: testUsername2,
          email: testEmail,
          password: 'testpassword123',
        }),
      });

      expect(response.status).toBe(409); // Conflict
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    let registeredEmail: string;
    let registeredUsername: string;
    const testPassword = 'testpassword123';

    beforeEach(async () => {
      // 로그인 테스트를 위한 사용자 생성
      registeredEmail = `login${Date.now()}@example.com`;
      registeredUsername = `loginuser${Date.now()}`;

      await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registeredUsername,
          email: registeredEmail,
          password: testPassword,
        }),
      });
    });

    it('should login with email and password', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: registeredEmail,
          password: testPassword,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(registeredEmail);
      
      // 쿠키에 세션 정보가 설정되었는지 확인
      const cookies = response.headers.get('set-cookie');
      expect(cookies).toBeTruthy();
    });

    it('should login with username and password', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: registeredUsername,
          password: testPassword,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.username).toBe(registeredUsername);
    });

    it('should reject login with wrong password', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: registeredEmail,
          password: 'wrongpassword',
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it('should reject login with non-existent user', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: 'nonexistent@example.com',
          password: testPassword,
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
      });

      expect(response.status).toBe(401);
    });

    it('should return user info when authenticated', async () => {
      // 먼저 로그인하여 세션 생성
      const registeredEmail = `me${Date.now()}@example.com`;
      const registeredUsername = `meuser${Date.now()}`;
      const testPassword = 'testpassword123';

      await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registeredUsername,
          email: registeredEmail,
          password: testPassword,
        }),
      });

      const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: registeredEmail,
          password: testPassword,
        }),
      });

      const cookies = loginResponse.headers.get('set-cookie');
      
      // 쿠키를 포함하여 /api/auth/me 요청
      const meResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          Cookie: cookies || '',
        },
      });

      expect(meResponse.status).toBe(200);
      const data = await meResponse.json();
      
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(registeredEmail);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      // 로그인 후 로그아웃 테스트
      const registeredEmail = `logout${Date.now()}@example.com`;
      const registeredUsername = `logoutuser${Date.now()}`;
      const testPassword = 'testpassword123';

      await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registeredUsername,
          email: registeredEmail,
          password: testPassword,
        }),
      });

      const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: registeredEmail,
          password: testPassword,
        }),
      });

      const cookies = loginResponse.headers.get('set-cookie');

      const logoutResponse = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Cookie: cookies || '',
        },
      });

      expect(logoutResponse.status).toBe(200);
      const data = await logoutResponse.json();
      expect(data.success).toBe(true);
    });
  });
});

