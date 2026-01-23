# API 통합 테스트 가이드

## 개요

이 디렉토리에는 실제 HTTP 요청을 통해 API 엔드포인트를 테스트하는 통합 테스트가 포함되어 있습니다.

## 테스트 파일

- `api/blog.test.ts` - 블로그 API 테스트 (포스트 조회, 검색)
- `api/monitoring.test.ts` - 모니터링 API 테스트 (시스템, 에러, 성능)

## 실행 방법

### 1. 개발 서버 시작

통합 테스트는 실제 Next.js 서버가 실행 중이어야 합니다.

```bash
cd portal
npm run dev
```

서버가 `http://localhost:7777`에서 실행되는지 확인하세요.

### 2. 테스트 실행

**별도 터미널에서:**

```bash
cd portal
npm run test:api
```

또는 특정 테스트 파일만 실행:

```bash
npm test __tests__/api/blog.test.ts
```

## 환경 변수

테스트는 기본적으로 `http://localhost:7777`을 사용합니다.

다른 URL을 사용하려면 환경 변수를 설정하세요:

```bash
API_BASE_URL=http://localhost:3000 npm run test:api
```

## 테스트 커버리지

다음 API 엔드포인트들이 테스트됩니다:

### 블로그 API
- ✅ GET /api/blog/posts - 포스트 목록 조회
- ✅ GET /api/blog/posts?q=검색어 - 검색
- ✅ GET /api/blog/posts?limit=N - 제한 조회
- ✅ GET /api/blog/posts/[id] - 포스트 상세 조회

### 모니터링 API
- ✅ GET /api/monitoring/system - 시스템 상태
- ✅ GET /api/monitoring/errors - 에러 로그 조회
- ✅ POST /api/monitoring/errors - 에러 로그 기록
- ✅ GET /api/monitoring/performance - 성능 메트릭 조회
- ✅ POST /api/monitoring/performance - 성능 메트릭 기록

## 주의사항

1. **데이터베이스**: 테스트는 실제 데이터베이스를 사용합니다.
   - 테스트용 별도 데이터베이스를 사용하는 것을 권장합니다.
   
2. **데이터 정리**: 각 테스트는 독립적으로 실행되지만, 일부 테스트는 데이터를 생성할 수 있습니다.

3. **서버 상태**: 테스트 실행 전 서버가 정상적으로 실행 중인지 확인하세요.

## 문제 해결

### 테스트가 실패하는 경우

1. **서버가 실행 중인지 확인**
   ```bash
   curl http://localhost:7777/api/blog/posts
   ```

2. **포트 확인**
   - 기본 포트는 7777입니다.
   - 다른 포트를 사용 중이라면 `API_BASE_URL` 환경 변수를 설정하세요.

3. **데이터베이스 확인**
   - SQLite 데이터베이스 파일이 존재하는지 확인
   - 데이터베이스 권한 확인

### 타임아웃 오류

테스트가 타임아웃되는 경우:
- 서버 응답 시간 확인
- 네트워크 연결 확인
- Vitest 타임아웃 설정 조정 (`vitest.config.ts`)

## CI/CD 통합

CI/CD 파이프라인에서 실행하려면:

1. 테스트 서버 시작
2. 헬스 체크 대기
3. 테스트 실행

예시 (GitHub Actions):
```yaml
- name: Start server
  run: npm run dev &
  
- name: Wait for server
  run: |
    timeout 60 bash -c 'until curl -f http://localhost:7777/api/blog/posts; do sleep 2; done'
  
- name: Run API tests
  run: npm run test:api
```

