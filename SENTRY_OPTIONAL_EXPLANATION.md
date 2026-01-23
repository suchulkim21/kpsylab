# Sentry 선택적 의존성 처리 상세 설명

## 문제점

현재 코드에서 Sentry를 선택적 의존성으로 처리하려고 했지만, **`next.config.ts`에서 정적 import를 사용**하고 있어서 문제가 발생할 수 있습니다.

### 현재 문제가 있는 코드

```typescript
// next.config.ts
import { withSentryConfig } from '@sentry/nextjs';  // ❌ 문제: 정적 import

// ...
try {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    finalConfig = withSentryConfig(nextConfig, { ... });
  }
} catch {
  // Sentry가 설치되지 않았으면 기본 설정 사용
}
```

### 왜 문제인가?

1. **빌드 시점 에러**: `@sentry/nextjs`가 설치되지 않았을 때, Node.js가 모듈을 찾을 수 없어서 **빌드 자체가 실패**합니다.
2. **정적 import vs 동적 import**:
   - 정적 import (`import ... from ...`): 빌드 시점에 모듈을 로드 → 패키지가 없으면 에러
   - 동적 import (`await import(...)`): 런타임에 모듈을 로드 → 패키지가 없어도 try-catch로 처리 가능

## 해결 방법

### 방법 1: 조건부 require (권장)

`next.config.ts`를 JavaScript로 변경하거나, TypeScript에서 조건부 require를 사용:

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... 설정
};

// Sentry가 설치되어 있을 때만 사용
let finalConfig = nextConfig;

try {
  // require는 런타임에 평가되므로 패키지가 없어도 에러가 발생하지 않음
  const { withSentryConfig } = require('@sentry/nextjs');
  
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    finalConfig = withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    });
  }
} catch (error) {
  // @sentry/nextjs가 설치되지 않았거나 로드 실패
  // 기본 설정 사용
  console.warn('[Sentry] Not available, using default config');
}

export default finalConfig;
```

### 방법 2: 별도 설정 파일 분리

Sentry 설정을 별도 파일로 분리하고, 조건부로 로드:

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... 설정
};

// sentry.config.ts가 있으면 로드 (선택적)
let finalConfig = nextConfig;

try {
  // 동적 require 사용
  const sentryConfig = require('./sentry.config');
  if (sentryConfig && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    const { withSentryConfig } = require('@sentry/nextjs');
    finalConfig = withSentryConfig(nextConfig, sentryConfig);
  }
} catch {
  // Sentry 설정 파일이 없거나 패키지가 없음
}

export default finalConfig;
```

### 방법 3: 환경 변수로 완전 분리 (가장 안전)

Sentry를 완전히 선택적으로 만들기:

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... 설정
};

// Sentry는 별도 스크립트로 처리하거나, 
// package.json의 postinstall에서 조건부 설치
export default nextConfig;
```

그리고 `package.json`에:

```json
{
  "scripts": {
    "postinstall": "node scripts/setup-sentry.js"
  }
}
```

## 현재 코드의 동작 방식

### ✅ 잘 처리된 부분

1. **`lib/monitoring/sentry.ts`**: 
   - 동적 import 사용 (`await import('@sentry/nextjs')`)
   - try-catch로 감싸서 패키지가 없어도 에러 없음

2. **`components/ErrorBoundary.tsx`**:
   - 동적 import 사용
   - Sentry가 없으면 기존 API로 폴백

3. **`lib/utils/errorHandler.ts`**:
   - 동적 import 사용
   - Sentry가 없으면 조용히 무시

### ❌ 문제가 있는 부분

1. **`next.config.ts`**:
   - 정적 import 사용
   - 패키지가 없으면 빌드 실패

## 실제 배포 시나리오

### 시나리오 1: Sentry 설치 안 함

```bash
# 패키지 설치
npm install  # @sentry/nextjs 없음

# 빌드 시도
npm run build
# ❌ 에러: Cannot find module '@sentry/nextjs'
```

### 시나리오 2: Sentry 설치함

```bash
# 패키지 설치
npm install @sentry/nextjs

# 빌드 시도
npm run build
# ✅ 성공: Sentry 설정 적용
```

## 권장 해결책

`next.config.ts`를 다음과 같이 수정:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... 기존 설정
};

// Sentry는 선택적 의존성
let finalConfig = nextConfig;

// require를 사용하여 런타임에만 평가
try {
  // @sentry/nextjs가 설치되어 있을 때만 로드
  const sentryModule = require('@sentry/nextjs');
  
  if (process.env.NEXT_PUBLIC_SENTRY_DSN && sentryModule.withSentryConfig) {
    finalConfig = sentryModule.withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    });
    console.log('[Next.js Config] Sentry enabled');
  }
} catch (error) {
  // @sentry/nextjs가 설치되지 않았거나 로드 실패
  // 기본 설정 사용 (정상 동작)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Next.js Config] Sentry not available, using default config');
  }
}

export default finalConfig;
```

## 테스트 방법

### Sentry 없이 빌드 테스트

```bash
# node_modules에서 @sentry/nextjs 제거
rm -rf node_modules/@sentry

# 빌드 테스트
npm run build
# ✅ 성공해야 함
```

### Sentry와 함께 빌드 테스트

```bash
# Sentry 설치
npm install @sentry/nextjs

# 환경 변수 설정
export NEXT_PUBLIC_SENTRY_DSN=your-dsn

# 빌드 테스트
npm run build
# ✅ Sentry 설정이 적용되어야 함
```

## 결론

현재 `next.config.ts`의 정적 import는 문제가 될 수 있습니다. `require()`를 사용하여 런타임에만 평가되도록 수정하면, Sentry가 설치되지 않아도 빌드가 성공합니다.
