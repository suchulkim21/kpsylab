# 다음 작업 가이드

## 🎯 현재 상황

✅ **완료된 작업**
- 블로그 포스팅 계획서 작성 완료
- Phase 1: 100개 포스트 주제 선별 완료
- Phase 2: 매일 3개 발행 일정표 작성 완료
- AI 콘텐츠 생성 스크립트 준비 완료

## 📋 다음에 해야 할 작업

### 1단계: 환경 변수 확인 및 설정

**필수 환경 변수:**
- `OPENAI_API_KEY` 또는 `ANTHROPIC_API_KEY` (AI API 키)
- `NEXT_PUBLIC_SUPABASE_URL` (Supabase URL)
- `SUPABASE_SERVICE_ROLE_KEY` 또는 `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase 키)

**확인 방법:**
```bash
# .env 파일 확인
cat .env.local | grep -E "OPENAI|ANTHROPIC|SUPABASE"
```

**설정이 안 되어 있다면:**
1. `.env.local` 파일에 API 키 추가
2. OpenAI 또는 Anthropic API 키 발급 받기

---

### 2단계: Phase 1 포스트 주제 파일 형식 수정

현재 `docs/topics_phase1.txt` 파일이 스크립트가 읽을 수 있는 형식이 아닐 수 있습니다.

**필요한 작업:**
- 주제만 추출하여 한 줄에 하나씩 나열
- 또는 스크립트를 수정하여 현재 형식도 읽을 수 있도록 개선

---

### 3단계: Phase 1 포스트 생성 실행

**방법 1: 전체 100개 한 번에 생성 (권장하지 않음 - 시간이 오래 걸림)**
```bash
npx tsx scripts/generate-blog-content.ts --file docs/topics_phase1.txt --count 100
```

**방법 2: 단계별로 생성 (권장)**
```bash
# 1주차: 1-20번 (20개)
npx tsx scripts/generate-blog-content.ts --file docs/topics_phase1.txt --count 20

# 2주차: 21-40번 (20개)
npx tsx scripts/generate-blog-content.ts --file docs/topics_phase1.txt --count 20

# ... (나머지도 동일하게)
```

**방법 3: 단일 포스트 테스트 먼저**
```bash
# 테스트로 1개만 생성
npx tsx scripts/generate-blog-content.ts --topic "왜 우리는 같은 실수를 반복하는가: 무의식적 간섭의 이해"
```

---

### 4단계: 생성된 포스트 확인

1. **관리자 대시보드에서 확인**
   - `/admin/dashboard` 접속
   - 블로그 분석 섹션에서 포스트 수 확인

2. **Supabase에서 직접 확인**
   - `blog_posts` 테이블 조회
   - 생성된 포스트 내용 검토

3. **홈페이지에서 확인**
   - `/` 접속
   - 최신 블로그 포스트 목록 확인

---

### 5단계: 품질 검증 및 수정

생성된 포스트를 검토하고:
- [ ] 내용 품질 확인 (최소 3,000자)
- [ ] HTML 형식 확인
- [ ] 태그 및 카테고리 확인
- [ ] 이미지 경로 확인
- [ ] SEO 메타데이터 확인

필요시 수동으로 수정하거나 재생성

---

### 6단계: Phase 2 준비

100개 포스트가 완료되면:
1. 서비스 시작일 결정
2. Phase 2 일정표를 데이터베이스에 등록
3. 자동 발행 시스템 구축 (선택사항)
4. 매일 3개씩 발행 시작

---

## ⚠️ 주의사항

1. **API 비용**
   - 100개 포스트 생성 시 상당한 API 비용 발생 가능
   - OpenAI GPT-4: 약 $30-50 (100개 기준)
   - Anthropic Claude: 약 $20-40 (100개 기준)

2. **생성 시간**
   - 포스트당 약 30초-1분 소요
   - 100개 생성 시 약 1-2시간 소요

3. **Rate Limit**
   - API 제공업체의 rate limit 확인
   - 필요시 대기 시간 조정

4. **품질 관리**
   - 모든 포스트를 자동 생성하지 말고 샘플 확인
   - 품질이 만족스러우면 배치 생성 진행

---

## 🚀 빠른 시작 (권장 순서)

1. **환경 변수 확인**
   ```bash
   # .env.local 파일 확인
   ```

2. **테스트 생성 (1개)**
   ```bash
   npx tsx scripts/generate-blog-content.ts --topic "왜 우리는 같은 실수를 반복하는가: 무의식적 간섭의 이해"
   ```

3. **결과 확인**
   - 관리자 대시보드에서 확인
   - 품질 검토

4. **배치 생성 시작 (10개씩)**
   ```bash
   npx tsx scripts/generate-blog-content.ts --file docs/topics_phase1.txt --count 10
   ```

5. **점진적으로 확대**
   - 품질이 좋으면 20개씩
   - 최종적으로 100개 완성

---

## 📞 문제 해결

**스크립트 실행 오류 시:**
- Node.js 버전 확인 (v18 이상 권장)
- TypeScript 컴파일 오류 확인
- 환경 변수 누락 확인

**API 오류 시:**
- API 키 유효성 확인
- Rate limit 확인
- 네트워크 연결 확인

**생성 품질 문제 시:**
- 프롬프트 수정 (`lib/utils/blogContentGenerator.ts`)
- 모델 변경 (GPT-4 → GPT-3.5-turbo 또는 반대)
- 수동 검토 및 수정

---

**작성일**: 2025년 1월
**최종 업데이트**: 2025년 1월
