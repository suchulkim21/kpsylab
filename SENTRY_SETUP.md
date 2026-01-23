# Sentry 설정 가이드

## 개요

이 프로젝트는 선택적으로 Sentry를 사용하여 에러 추적 및 모니터링을 수행합니다.

## 설치

Sentry를 사용하려면 다음 패키지를 설치하세요:

```bash
npm install --save @sentry/nextjs
```

## 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```env
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

## Sentry 프로젝트 생성

1. [Sentry.io](https://sentry.io)에 가입
2. 새 프로젝트 생성 (Next.js 선택)
3. DSN 복사하여 환경 변수에 설정

## 동작 방식

- Sentry가 설치되어 있으면 자동으로 에러 추적
- 설치되지 않아도 애플리케이션은 정상 작동
- 프로덕션 환경에서만 에러를 Sentry로 전송
- 민감한 정보(쿠키, 인증 헤더 등)는 자동으로 제거

## 에러 추적 위치

- `ErrorBoundary`: React 컴포넌트 에러
- `errorHandler.ts`: API 호출 에러
- `sentry.ts`: 수동 에러 캡처

## 비활성화

Sentry를 사용하지 않으려면:
- `NEXT_PUBLIC_SENTRY_DSN` 환경 변수를 제거하거나 비워두세요
- 애플리케이션은 정상 작동하며 에러는 콘솔에만 출력됩니다
