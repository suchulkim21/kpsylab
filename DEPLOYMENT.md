# 배포 가이드

## 배포 전 체크리스트

### 1. 로컬 빌드 테스트
```bash
# 의존성 설치
npm install

# 빌드 테스트
npm run build

# 프로덕션 모드 테스트
npm start
```

### 2. 환경 변수 확인
다음 환경 변수들이 설정되어 있는지 확인하세요:

#### 필수 환경 변수
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 관리자 키
ADMIN_SECRET=your-secret-key

# 사이트 URL
SITE_URL=https://www.kpsylab.com
```

#### 선택적 환경 변수
```env
# Sentry (에러 로깅)
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project

# Playwright Base URL (E2E 테스트용)
PLAYWRIGHT_BASE_URL=https://www.kpsylab.com
```

## Vercel 배포 방법

### 방법 1: Vercel CLI (권장)

#### 1. Vercel CLI 설치
```bash
npm install -g vercel
```

#### 2. 로그인
```bash
vercel login
```

#### 3. 프로젝트 디렉토리로 이동
```bash
cd apps/portal
```

#### 4. 배포
```bash
# 프로덕션 배포
vercel --prod

# 또는 미리보기 배포
vercel
```

### 방법 2: GitHub 연동 (자동 배포)

#### 1. GitHub에 푸시
```bash
git add .
git commit -m "Deploy: 모든 개선 사항 적용"
git push origin main
```

#### 2. Vercel 대시보드에서 설정
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택 또는 새 프로젝트 생성
3. GitHub 저장소 연결
4. 환경 변수 설정 (아래 참조)
5. 배포 자동 시작

### 방법 3: Vercel 웹 인터페이스

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. "Add New Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/portal`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. 환경 변수 추가 (아래 참조)
6. "Deploy" 클릭

## Vercel 환경 변수 설정

### Vercel 대시보드에서 설정

1. 프로젝트 선택 → Settings → Environment Variables

2. 다음 변수들을 추가:

#### Production 환경
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_SECRET=your-secret-key
SITE_URL=https://www.kpsylab.com
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id (선택)
SENTRY_ORG=your-org (선택)
SENTRY_PROJECT=your-project (선택)
```

#### Preview 환경 (개발/스테이징)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_SECRET=your-dev-secret-key
SITE_URL=https://your-preview-url.vercel.app
```

#### Development 환경
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_SECRET=your-dev-secret-key
SITE_URL=http://localhost:7777
```

### Vercel CLI로 환경 변수 설정

```bash
# 프로덕션 환경 변수
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add ADMIN_SECRET production
vercel env add SITE_URL production

# 선택적: Sentry
vercel env add NEXT_PUBLIC_SENTRY_DSN production
vercel env add SENTRY_ORG production
vercel env add SENTRY_PROJECT production
```

## 배포 후 확인 사항

### 1. 기본 기능 확인
- [ ] 홈페이지 로드 확인
- [ ] 네비게이션 작동 확인
- [ ] MNPS 서비스 접근 확인
- [ ] 성장 로드맵 서비스 접근 확인
- [ ] 블로그 페이지 로드 확인
- [ ] 게시판 접근 확인

### 2. 관리자 기능 확인
- [ ] `/admin/dashboard` 접근
- [ ] 관리자 키 입력 후 통계 확인
- [ ] 애널리틱스 데이터 확인

### 3. 에러 처리 확인
- [ ] 존재하지 않는 페이지 접근 시 404 확인
- [ ] API 에러 시 에러 메시지 표시 확인

### 4. 성능 확인
- [ ] Web Vitals 데이터 수집 확인 (개발자 도구)
- [ ] 페이지 로딩 속도 확인

### 5. 접근성 확인
- [ ] 키보드 네비게이션 (Tab 키)
- [ ] 스킵 링크 작동 확인
- [ ] 키보드 단축키 작동 확인

## 문제 해결

### 빌드 실패

#### Sentry 관련 오류
```bash
# Sentry를 사용하지 않는 경우
# next.config.ts에서 Sentry 관련 코드가 에러를 발생시키지 않도록
# 이미 try-catch로 처리되어 있음
```

#### 의존성 오류
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 환경 변수 누락

Vercel 대시보드에서 모든 환경 변수가 설정되었는지 확인하세요.

### Supabase 연결 오류

1. Supabase 프로젝트가 활성화되어 있는지 확인
2. RLS (Row Level Security) 정책 확인
3. `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확인

## 추가 최적화

### 1. 이미지 최적화
```bash
npm run optimize:images
```

### 2. 빌드 분석
```bash
npm run build
# .next/analyze 폴더에서 번들 분석 결과 확인
```

### 3. 성능 모니터링
- Vercel Analytics 활성화
- Web Vitals 대시보드 확인
- Sentry Performance Monitoring 확인

## 롤백 방법

### Vercel 대시보드에서
1. 프로젝트 → Deployments
2. 이전 배포 선택
3. "..." 메뉴 → "Promote to Production"

### Vercel CLI로
```bash
vercel rollback [deployment-url]
```

## CI/CD 파이프라인 (선택)

GitHub Actions를 사용한 자동 배포:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 보안 체크리스트

- [ ] `ADMIN_SECRET`이 강력한 값으로 설정되었는지 확인
- [ ] Supabase RLS 정책이 올바르게 설정되었는지 확인
- [ ] 민감한 정보가 코드에 하드코딩되지 않았는지 확인
- [ ] 환경 변수가 Git에 커밋되지 않았는지 확인

## 모니터링 설정

### 1. Vercel Analytics
- Vercel 대시보드 → Analytics 활성화

### 2. Sentry
- Sentry 프로젝트 생성
- DSN을 환경 변수에 추가
- 알림 설정 구성

### 3. Web Vitals
- 자동으로 수집됨
- `/api/analytics/vitals` 엔드포인트 확인

---

**배포 완료 후**: 모든 기능이 정상 작동하는지 확인하고, 사용자에게 변경 사항을 공지하세요!
