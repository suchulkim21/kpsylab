# 에러 보고서

`npx tsc --noEmit` 및 린트/빌드 기준으로 정리한 오류와 상태입니다.

---

## 1. 이번 수정으로 해결한 항목

| 파일 | 내용 | 조치 |
|------|------|------|
| `components/BlogPostEditor.tsx` | `LoadingSpinner`에 `size="small"` 전달 (타입: `"sm" \| "md" \| "lg"`) | `size="small"` → `size="sm"` 로 변경 |

---

## 2. TypeScript 컴파일 에러 (기존 + 기타)

### 2.1 테스트 (`__tests__/`)

| 파일 | 에러 | 비고 |
|------|------|------|
| `__tests__/lib/auth.test.ts` | `hashPassword`, `verifyPassword`가 `@/lib/db/auth`에서 export되지 않음 | auth 모듈에서 export 추가 또는 테스트에서 import 제거/수정 |
| `__tests__/lib/content/engine.test.ts` | `TextBlock`에 `id` 필드 없음 (growth-roadmap `engine`의 `TextBlock`과 불일치) | 테스트 데이터에 `id` 추가 또는 `engine` 타입 맞춤 |
| `__tests__/lib/utils/text.test.ts` | `toEndWith`가 `Assertion<string>`에 없음 | vitest 확장 또는 assertion 방식 변경 |

### 2.2 API / 컴포넌트

| 파일 | 에러 | 비고 |
|------|------|------|
| `app/api/admin/blog/analytics/route.ts` | `t`, `tag`에 `any` (line 99, 102, 171, 172) | `(t: string)`, `(tag: …)` 등 타입 명시 |
| `app/api/admin/blog/export/route.ts` | `t`, `tag`에 `any` (line 140, 143) | 콜백 파라미터에 타입 명시 |
| `components/BlogAnalyticsCharts.tsx` | `percent`가 `undefined`일 수 있음 (line 88) | `percent ?? 0` 또는 null 체크 후 사용 |

### 2.3 E2E

| 파일 | 에러 | 비고 |
|------|------|------|
| `e2e/accessibility.spec.ts` | `axe-playwright` 모듈 없음 (line 14) | `@axe-core/playwright` 등 패키지 설치 또는 import 경로/이름 수정 |
| `e2e/accessibility.spec.ts` | `"none"`과 `""` 비교 (line 179) | 의도 확인 후 `=== ""` 또는 `=== "none"` 등으로 정리 |

### 2.4 스크립트

| 파일 | 에러 | 비고 |
|------|------|------|
| `scripts/generate-blog-content.ts` | `path` 중복 선언 (line 11, 28) | `path` import/선언 한 곳만 두고 나머지 제거 또는 이름 변경 |

---

## 3. 빌드/환경 이슈 (코드와 무관)

| 구분 | 메시지 | 비고 |
|------|--------|------|
| `npm run build` | `EPERM: operation not permitted, open '.next\trace'` | `.next` 쓰기 권한, antivirus, 다른 프로세스 사용 가능성. `.next` 삭제 후 재빌드 권장 |
| `tsc --noEmit` | `Could not write file 'tsconfig.tsbuildinfo'` (EPERM) | `tsconfig.tsbuildinfo` 쓰기 권한. sandbox/권한 설정 확인 |

---

## 4. 블로그 이미지 제거 변경과의 관련성

- `app/blog/[id]/page.tsx`, `app/page.tsx`, `app/api/blog/posts/route.ts`, `app/api/blog/posts/[id]/route.ts`, `app/feed.xml/route.ts`, `components/BlogPostEditor.tsx`  
  → 위 2~3번 에러 목록에는 포함되지 않음. **이번 이미지 제거 작업과 직접 관련된 TS/빌드 에러는 `BlogPostEditor`의 `size="small"` 하나였고, `size="sm"`으로 수정 완료.**

---

## 5. 권장 조치

1. **우선 수정 권장**  
   - `BlogPostEditor` `size="small"` → `size="sm"`  
   - `app/api/admin/blog/analytics/route.ts`, `app/api/admin/blog/export/route.ts`  
     → `t`, `tag` 등 콜백 인자 타입 명시  
   - `components/BlogAnalyticsCharts.tsx`  
     → `percent` undefined 처리  
   - `scripts/generate-blog-content.ts`  
     → `path` 중복 제거

2. **테스트/E2E**  
   - `__tests__/lib/*`  
     → auth export, `TextBlock`, `toEndWith` 등 타입/API 맞춤  
   - `e2e/accessibility.spec.ts`  
     → `axe-playwright` 의존성 및 비교 로직 수정

3. **로컬 빌드**  
   - `npm run build` 전에 `.next` 폴더 삭제 후 재시도  
   - `tsconfig.tsbuildinfo` 삭제 후 `tsc --noEmit` 재실행

---

## 6. Linter (ESLint)

- `app/blog/[id]/page.tsx`, `app/page.tsx`, `app/api/blog/posts/*`, `app/feed.xml/route.ts`, `components/BlogPostEditor.tsx`  
  → **현재 린트 에러 없음.**
