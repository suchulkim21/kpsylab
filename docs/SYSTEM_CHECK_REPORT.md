# 시스템 점검 결과 (System Check Report)

**점검 일시**: 2025년 기준  
**대상**: Pj-main / apps/portal

---

## 1. 빌드 (해결됨)

**문제**: `npm run build` 실패 (TypeScript 타입 오류 4건)

| 위치 | 내용 | 조치 |
|------|------|------|
| `app/growth-roadmap/module1/result/page.tsx:73` | `projectM1ToLatent(prevVec)` — `{}` 타입이 `Record<string, string \| number>`에 맞지 않음 | `prevVec` 검사 강화 + `as Record<string, number \| string>` 캐스트 |
| `lib/adapters/report-adapter.ts:107` | `moduleHistory` 타입 불일치 — `result` 필드 필수 여부 | `PsychologicalMapInput`에 `ModuleHistoryEntryLike` 도입, `result` 선택으로 완화 |
| `lib/adapters/report-adapter.ts:134` | `conflictInsight`가 `string \| null`인데 반환 타입은 `string \| undefined` | `conflictInsight ?? undefined`로 정규화 |
| `lib/services/consistencyAuditor.ts:52` | `updateM1Global`에 `dominantType` 대신 `type` 전달 | `{ dominantType: context.newResult.type, vector: ... }`로 전달 |
| `lib/store/userGlobalVector.ts:256` | `m1Vec`가 `undefined`일 수 있어 인자 타입 불일치 | `m1 && m1Vec`일 때만 인자 전달하도록 수정 |

**현재**: `npm run build` 정상 완료 (Next.js 16.1.1, Turbopack).

---

## 2. 린트 (미해결 — 경고/에러 다수)

**실행**: `npm run lint` → **exit code 1** (에러/경고 존재)

- **에러**: `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-require-imports`, `prefer-const`, `react-hooks/set-state-in-effect`, `react/jsx-no-comment-textnodes` 등
- **경고**: 미사용 변수/import, `react-hooks/exhaustive-deps` 등  
- **주요 파일**: `app/admin/dashboard/page.tsx`, `app/growth-roadmap/assessment/page.tsx`, `app/api/**`, `__tests__/**` 등

빌드는 통과하므로, 필요 시 단계적으로 린트 규칙을 맞추면 됩니다.

---

## 3. 기타 확인 사항

| 항목 | 상태 |
|------|------|
| **next.config.ts** | 리다이렉트, 이미지, 실험 옵션 정상 |
| **.env** | `.env.local` 존재 (실제 값은 미확인) |
| **워크스페이스** | `package.json` workspaces: portal, mnps, second-genesis |
| **Next.js 경고** | "middleware" 파일 규칙 deprecated → 추후 "proxy"로 마이그레이션 권장 |

---

## 4. 포트 7777 사용 중 (EADDRINUSE)

**증상**: `npm run dev` 시 `Error: listen EADDRINUSE: address already in use :::7777`

**원인**: 이미 7777 포트를 사용 중인 프로세스(이전 dev 서버 등)가 있음.

**해결 예시 (Windows)**:

```powershell
netstat -ano | findstr :7777
taskkill /PID <PID> /F
```

또는 다른 포트로 실행:

```powershell
npx next dev -p 3000
```

---

## 5. 권장 후속 작업

1. **린트 정리**: `npm run lint` 기준으로 에러부터 제거 후, 경고를 단계적으로 해결
2. **테스트**: `npm run test`, `npm run test:e2e` 등으로 회귀 여부 확인
3. **middleware → proxy**: Next.js 16+ 가이드에 맞춰 proxy 설정 검토

이 문서는 점검 시점의 스냅샷이며, 이후 변경 사항이 반영되지 않을 수 있습니다.
