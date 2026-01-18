/**
 * CSRF 토큰 관리 유틸리티
 * API 라우트에서 CSRF 토큰 검증에 사용
 */

import crypto from 'crypto';

const CSRF_TOKEN_SECRET = process.env.CSRF_TOKEN_SECRET || 'csrf-secret-key-change-in-production';

/**
 * CSRF 토큰 생성
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * CSRF 토큰 검증
 */
export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) {
    return false;
  }
  
  // 간단한 일치 검증 (더 복잡한 검증이 필요하면 HMAC 등 사용)
  return token === sessionToken;
}

/**
 * 세션에 CSRF 토큰 저장 (클라이언트용)
 */
export function setCSRFToken(token: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('csrf-token', token);
  }
}

/**
 * 세션에서 CSRF 토큰 가져오기 (클라이언트용)
 */
export function getCSRFToken(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('csrf-token');
  }
  return null;
}

