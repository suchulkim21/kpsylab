# 프로젝트 정리 및 불필요 파일 보고서

작성: 2025-01

## 1. 적용한 조치 (서비스 영향 없음)

### 1.1 .gitignore 추가
- **`/playwright-report/`**, **`/test-results/`**  
  - Playwright E2E 실행 시 매번 재생성. 배포(.vercelignore)에 이미 제외. 커밋/인덱싱 제외.
- **`/data/*.db`**  
  - Supabase 이전 후 로컬 SQLite(users, board, analytics)는 `migrate-sqlite-to-supabase.js`용. 프로덕션 미사용. 커밋 제외.

### 1.2 삭제한 폴더·파일

| 대상 | 이유 |
|------|------|
| **`playwright-report/`** | E2E HTML 리포트. `playwright test` 시 재생성. |
| **`test-results/`** | E2E 스크린샷·영상·에러 context. `playwright test` 시 재생성. |
| **`src/`** (32개 파일) | `tsconfig` `exclude`에 포함, `@growth-roadmap/*` → `app/growth-roadmap/*`만 사용. `app/growth-roadmap/`와 중복 레거시. (빈 `src/` 폴더가 남았다면 `Remove-Item -Recurse -Force src`로 삭제 가능) |

### 1.3 tsconfig
- `exclude`에 `"src"` 유지 (빈 `src/` 디렉터리가 남은 경우 대비).

---

## 2. .cursorignore (수동 추가 권장)

Cursor 인덱싱 경량화를 위해 **프로젝트 루트**에 `.cursorignore`를 두고 아래를 넣는 것을 권장합니다.

```
node_modules/
.next/
out/
build/
dist/
playwright-report/
test-results/
.vercel/
coverage/
.nyc_output/
*.tsbuildinfo
```

- `Pj-main` 루트: `C:\Projects\Pj-main\.cursorignore`
- 또는 `apps/portal`만 사용 시: `apps/portal/.cursorignore`

---

## 3. 아카이브/삭제 후보 (선택)

아래는 **1회성·레거시**로 보이지만, 동작 보장을 위해 삭제하지 않고 후보만 적어두었습니다.

### 3.1 lib/db (1회성·마이그레이션)

| 파일 | 용도 | 비고 |
|------|------|------|
| `batch_update_1.json`, `batch_update_2.json`, `batch_update_2_3.json`, `batch_update_4.json` | `generate_batch_*.js` 출력. 블로그 DB 일괄 수정용. | DB 반영 완료 시 아카이브 또는 삭제 가능. |
| `generate_batch_1.js`, `generate_batch_2.js`, `generate_batch_2_3.js`, `generate_batch_4.js` | batch JSON 생성. | `package.json` 미등록. 1회성. |
| `merge_blog_updates.js` | `merge_blog_updates.js <update_file.json>` 형태로 JSON 적용. | 1회성. |
| `check_json.js` | JSON 구조 검증. | 1회성. |
| `download_images.js` | 이미지 다운로드. | `package.json`의 `download:images`는 `scripts/download-blog-images.ts` 사용. 레거시 가능. |
| `verify_blog_content.js` | 블로그 콘텐츠 검증. | 1회성. |

### 3.2 루트 1회성 스크립트·문서

| 파일 | 비고 |
|------|------|
| `FIX_COMMANDS.txt` | 예전 수정용 명령 모음. |
| `fix-and-push.ps1`, `fix-git-remote.ps1` | Git 원격/푸시 1회 수정. |
| `push-to-github.bat`, `push-to-github.ps1` | GitHub 푸시. .vercelignore로 배포 제외. |
| `package.json.additions.md` | package.json 변경 메모. |

### 3.3 data/*.db

- `data/analytics.db`, `data/board.db`, `data/users.db`  
  - `migrate-sqlite-to-supabase.js`에서만 사용.  
  - Supabase 이전 완료 후에는 로컬 백업 목적이 아니면 삭제 가능.  
  - 이미 `.gitignore`에 `/data/*.db`로 커밋 제외됨.

---

## 4. 유지한 항목

- **`__tests__/`**, **`e2e/`**  
  - Vitest·Playwright 테스트. 삭제/변경 없음.
- **`docs/`**  
  - 블로그 가이드, Phase1 초안(100개 .md), 스케줄 등. 유지.
- **`scripts/`**  
  - `package.json` 등록 스크립트 및 기타 .ts/.js. 유지.
- **`ecosystem.config.js`**  
  - PM2 등 배포 설정으로 가정. 유지.
- **`data/`**  
  - 디렉터리는 유지. `*.db`만 .gitignore.

---

## 5. E2E·빌드 확인 권장

정리 후 다음을 한 번씩 실행해 보는 것을 권장합니다.

```bash
cd apps/portal
npm run build
npm run test:e2e
```

- `playwright-report`·`test-results`는 `test:e2e` 실행 시 다시 생성됩니다.
