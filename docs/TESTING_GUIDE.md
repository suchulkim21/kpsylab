# 테스트 가이드

**문서 성격**: KPSY LAB Portal에서 **어떤 테스트를 어디서 어떻게 실행하는지** 정리한 문서.  
**참조**: PROJECT_GAPS_AND_REMEDIATION §4, `__tests__/API_TEST_README.md`, `.github/workflows/ci.yml`

---

## 1. 테스트 종류와 실행 방법

### 1.1 단위·통합 테스트 (Vitest)

| 명령 | 설명 |
|------|------|
| `npm run test` | Vitest 기본 실행 (watch). 1회 실행 시 `npm run test -- --run` |
| `npm run test:unit` | `__tests__/lib` 하위 단위 테스트 |
| `npm run test:api` | `__tests__/api` 하위 API·통합 테스트 |
| `npm run test:coverage` | 커버리지 리포트 |
| `npm run test:ui` | Vitest UI 모드 |

**실행 위치**: `apps/portal`. 루트에서: `npm run test -w apps/portal`.

**주요 파일**: `__tests__/lib/mnps/darkNatureScoring.test.ts`, `__tests__/lib/module2/analysis.test.ts`, `__tests__/api/monitoring.test.ts` 등.

### 1.2 E2E (Playwright)

| 명령 | 설명 |
|------|------|
| `npm run test:e2e` | Playwright E2E 실행 |
| `npm run test:e2e:ui` | Playwright UI |
| `npm run test:e2e:debug` | 디버그 모드 |

**위치**: `apps/portal/e2e/`. `PLAYWRIGHT_BASE_URL`로 대상 URL 지정.

### 1.3 린트·빌드

- `npm run lint` — ESLint (error 0 권장)
- `npm run build` — Next.js 프로덕션 빌드

---

## 2. CI 파이프라인

**파일**: `.github/workflows/ci.yml`  
**트리거**: push / pull_request (main).

**순서**: `npm ci` → `npm run lint` → `npm run test -- --run` → `npm run build` (working-directory: apps/portal).

**Secrets**: 빌드 시 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 등 필요 시 GitHub Secrets 등록.

---

## 3. 환경 요구 사항

- **단위 테스트**: 대부분 DB 없이 실행 가능.
- **API 테스트**: 일부 Supabase 등 필요 시 mock/스킵. `__tests__/api` README 참고.
- **E2E**: 로컬 서버 또는 `PLAYWRIGHT_BASE_URL` 서버 필요.

---

## 4. 관련 문서

- PROJECT_GAPS_AND_REMEDIATION.md — 테스트·CI 보완 방안
- `__tests__/API_TEST_README.md` — API 테스트 구조
- SYSTEM_CHECK_REPORT.md — 빌드·린트 점검 이력
