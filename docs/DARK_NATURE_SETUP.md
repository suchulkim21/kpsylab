# Dark Nature Test 설정 가이드

## 📋 완료된 작업

### ✅ 1단계: 문항 텍스트 개선
- 마키아벨리즘: "사소한 도덕적 규칙", "사회적 지능" 등 완화된 표현 적용
- 사디즘: "일상적 사디즘" 표현으로 방어 기제 회피
- 도덕적 이탈, 악의성 문항도 간접적 표현으로 개선

### ✅ 2단계: Supabase DB 스키마 및 API
- **마이그레이션 파일 생성**:
  - `lib/db/migrations/001_dark_nature_test.sql` - 테이블 생성
  - `lib/db/migrations/002_insert_questions.sql` - 초기 문항 데이터

- **API 엔드포인트 생성**:
  - `POST /api/mnps/assessments` - 테스트 세션 생성
  - `POST /api/mnps/responses` - 응답 저장
  - `POST /api/mnps/complete` - 테스트 완료 및 결과 저장
  - `GET /api/mnps/results` - 결과 조회 (Good/Bad 버전)

- **테스트 페이지 DB 연동**: 하이브리드 방식 (sessionStorage + DB)

### ✅ 3단계: 리포트 매핑 로직 강화
- 점수 구간별 세밀한 해석:
  - **Very High (≥80)**: "탁월한 전략적 실행력" / "냉혹한 체스 플레이어"
  - **High (≥70)**: 기존 문구 유지
  - **Medium (40~69)**: 중간 수준 해석 추가
- D-Factor 서브팩터 해석 추가
- Summary도 점수 구간별로 차별화

---

## 🚀 다음 단계: Supabase 설정

### 1. Supabase SQL Editor에서 마이그레이션 실행

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 → **SQL Editor** 메뉴
3. 다음 순서로 실행:

**Step 1: 테이블 생성**
```sql
-- lib/db/migrations/001_dark_nature_test.sql 내용 복사하여 실행
```

**Step 2: 초기 문항 데이터 삽입**
```sql
-- lib/db/migrations/002_insert_questions.sql 내용 복사하여 실행
```

### 2. RLS (Row Level Security) 정책 확인

마이그레이션에 RLS 정책이 포함되어 있지만, 필요시 수정:
- 익명 사용자도 assessments 생성 가능
- 자신이 생성한 assessment의 results만 조회 가능

### 3. 환경 변수 확인

Vercel 프로젝트 설정에서 다음 환경 변수가 설정되어 있는지 확인:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📊 데이터베이스 구조

### 테이블 관계도
```
users (선택적)
  ↓
assessments (테스트 세션)
  ├─ responses (응답들)
  └─ results_metadata (Good/Bad 리포트)
```

### 주요 컬럼

**assessments**
- `id`: UUID (세션 ID)
- `user_id`: UUID (선택적, 익명 가능)
- `status`: 'IN_PROGRESS' | 'COMPLETED'
- `is_paid`: Boolean (결제 여부)
- `total_d_score`: Float (종합 D 점수)

**responses**
- `assessment_id`: UUID
- `question_id`: TEXT (문항 ID)
- `score`: INTEGER (1~5)

**results_metadata**
- `assessment_id`: UUID (PK)
- `good_report_json`: JSONB (무료 리포트)
- `bad_report_json`: JSONB (유료 리포트)
- `radar_chart_data`: JSONB

---

## 🔄 테스트 흐름

1. **테스트 시작** → `POST /api/mnps/assessments` → `assessmentId` 생성
2. **문항 답변** → `POST /api/mnps/responses` → 각 응답 저장
3. **테스트 완료** → `POST /api/mnps/complete` → 채점 + 리포트 생성 + DB 저장
4. **결과 조회** → `GET /api/mnps/results?assessmentId=xxx` → Good/Bad 리포트 반환

---

## ⚠️ 주의사항

1. **문항 데이터**: `002_insert_questions.sql` 실행 전에 `questions.ts`의 문항과 일치하는지 확인
2. **RLS 정책**: 익명 사용자도 테스트할 수 있도록 정책이 설정되어 있는지 확인
3. **결제 연동**: 현재는 `is_paid` 플래그만 있음. 실제 결제 API 연동은 별도 구현 필요

---

## 🧪 테스트 방법

1. 로컬에서 `npm run dev`
2. `http://localhost:7777/mnps/test` 접속
3. 36문항 모두 답변
4. 결과 페이지에서 Good/Bad 리포트 확인
5. Supabase Dashboard에서 데이터 확인:
   - `assessments` 테이블에 세션 생성 확인
   - `responses` 테이블에 36개 응답 저장 확인
   - `results_metadata` 테이블에 리포트 JSON 확인
