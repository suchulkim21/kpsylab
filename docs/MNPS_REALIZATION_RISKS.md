# MNPS 실현 불가능/위험 요소 보고서

구현된 기능 중 **실제 환경에서 동작하지 않거나, 전제 조건이 맞지 않으면 실패하는 부분**을 정리한 문서입니다.

---

## 1. 심각: Results API · Responses API — RLS로 인한 조회/저장 실패

### 현상

- **GET `/api/mnps/results`**: `supabase`(anon 키)만 사용하여 `assessments` · `results_metadata`를 조회합니다.
- **POST `/api/mnps/responses`**: `supabase`(anon)만 사용하여 `responses`에 INSERT합니다.

Supabase RLS 정책(003_mnps_schema_and_rls.sql)은 다음과 같습니다.

- **assessments SELECT**:  
  - 로그인: `auth.uid() = user_id`  
  - 비로그인: `session_id::text = current_setting('app.session_id', true)`  
- **results_metadata SELECT**: 위와 동일하게 assessment 소유권(user_id 또는 session_id) 필요.
- **responses**: assessment 소유권 확인 후 접근.

API 라우트는 **서버에서** 실행되며, 브라우저 세션이 없습니다.  
또한 **`app.session_id`를 설정하지 않습니다.**  
그래서 anon 클라이언트로 요청 시:

- `auth.uid()` = null (비로그인)
- `current_setting('app.session_id', true)` = 설정 안 함 → 비로그인 정책 불일치

결과:

| API | 예상 동작 | 실제 (anon만 사용 시) |
|-----|-----------|------------------------|
| GET /api/mnps/results | assessmentId로 결과 반환 | RLS로 인해 **항상 0건 → 404** (결과 페이지가 서버 데이터를 못 불러옴) |
| POST /api/mnps/responses | 문항별 응답 저장 | RLS로 인해 **INSERT 거부 가능** (응답 저장 실패) |

즉, **Service Role을 쓰지 않으면** 결과 조회와 응답 저장이 **실현 불가능**에 가깝습니다.

### 권장 조치

1. **GET `/api/mnps/results`**  
   - 결과 조회는 **supabaseAdmin(Service Role)** 으로 수행해 RLS를 우회합니다.  
   - assessmentId는 UUID로 추측이 어렵다는 전제로 “assessmentId를 아는 자에게만 결과 노출”로 보안을 유지합니다.
2. **POST `/api/mnps/responses`**  
   - 응답 저장 시에도 **Service Role** 사용을 권장합니다.  
   - 또는 클라이언트에서 `session_id`를 쿠키/헤더로 넘기고, API에서 `SET app.session_id = ...` 후 anon으로 조회/저장하는 방식으로 RLS 조건을 만족시킵니다.

---

## 2. 중요: Complete API — Service Role 없으면 완료 처리 실패

### 현상

- Complete API는 `db = supabaseAdmin ?? supabase`로 assessments · results_metadata에 **쓰기**합니다.
- anon만 있을 때:
  - assessments: UPDATE 정책이 “본인(user_id)” 또는 (비로그인) session_id 기반인데, 서버에서 session_id를 설정하지 않으면 **UPDATE 불가**.
  - results_metadata: INSERT/UPDATE 정책이 없어 **Service Role로만 쓰기 가능** (설계상 의도).

따라서 **SUPABASE_SERVICE_ROLE_KEY가 없으면** complete(채점·저장·멱등 응답)가 **실현 불가능**합니다.

### 권장 조치

- MNPS 완료 플로우는 **Service Role 사용을 전제**로 두고,  
  배포/운영 가이드에 `SUPABASE_SERVICE_ROLE_KEY` 필수 명시.

---

## 3. 이용약관 · 개인정보처리방침 · 면책조항 — 전문 열람 불가

### 현상

- `docs/mnps_terms.md`, `docs/mnps_privacy.md`, `docs/mnps_disclaimer.md`에 법적 고지 전문이 있음.
- 결과 페이지 하단에는 “이용약관 · 개인정보 처리방침 · 면책 조항에 동의한 것으로 간주됩니다” 문구만 있고, **해당 문서를 열람할 수 있는 라우트(페이지)가 없음**.

따라서 **실제로 “전문을 읽고 동의했다”고 보기 어렵고**, 분쟁 시 “동의할 수 있는 상태가 아니었다”는 주장에 취약할 수 있습니다.

### 권장 조치

- `/mnps/terms`, `/mnps/privacy`, `/mnps/disclaimer` 등 **전용 페이지**를 두고,  
  위 마크다운 내용을 렌더링하거나, 동일 내용을 DB/CMS로 관리해 노출.
- 결과 페이지·결제 전 화면 등에서 위 페이지로 링크를 걸어 **실제 열람 가능**하도록 합니다.

---

## 4. 결제(잠금 해제) — assessmentId 없을 때 동작 없음

### 현상

- 결과 페이지가 **sessionStorage fallback**으로만 로드된 경우(예: DB 장애로 complete 실패 후 sessionStorage로 결과 표시)  
  `assessmentId`가 없음.
- “최종 리스크 시나리오 열기” 클릭 시 `handleUnlockClick`에서 `if (!assessmentId) return;`으로 **아무 동작 없이 종료**됩니다.
- 사용자 입장에서는 **버튼이 반응하지 않는 것처럼 보임**.

### 권장 조치

- `assessmentId`가 없을 때:
  - 버튼을 **비활성화**하고,  
  - “결제를 이용하려면 테스트를 다시 진행해 주세요” 같은 문구를 노출.
- 또는 sessionStorage 전용 플로우에서는 “잠금 해제” 영역 자체를 숨기거나, 재진행 유도만 하도록 처리.

---

## 5. 규준 보정 / Norm 분석 — RPC 미적용 시 실현 불가

### 현상

- **GET `/api/admin/mnps/norm-analysis`** 는 Supabase RPC `get_mnps_norm_distribution()` 를 호출합니다.
- **Complete API** 는 채점 후 RPC `get_d_score_percentile(score)` 를 호출해 `percentile_at_creation` 을 저장합니다.

다음 마이그레이션이 **실행되지 않은** 환경에서는:

- `005_calculate_percentile.sql` 미실행 → `get_d_score_percentile` 없음 → complete 시 RPC 오류 또는 백분위 미저장.
- `006_mnps_norm_distribution.sql` 미실행 → `get_mnps_norm_distribution` 없음 → norm-analysis API 502 및 규준 보정 기능 사용 불가.

즉, **해당 SQL이 적용되지 않으면** 해당 기능들은 **실현 불가능**합니다.

### 권장 조치

- 배포/설치 가이드에 **005, 006(및 007) 마이그레이션 적용**을 필수 단계로 명시.
- Complete API에서 RPC 실패 시 로그를 남기고, percentile만 널로 두고 나머지 저장은 계속하는 등 **graceful degradation** 고려.

---

## 6. startedAt 검증 — 24시간 초과 시 완료 거부

### 현상

- Complete API에서 **시작 후 24시간이 지난 세션**은 `SESSION_EXPIRED` 로 거부됩니다.
- 사용자가 테스트를 시작한 뒤 **24시간 이상 지나서** 제출하면 **항상 400** 이 됩니다.

의도된 보안/데이터 정합성 동작이지만, “오래 끌었다가 마저 하는” 사용자 경험과는 맞지 않을 수 있습니다.

### 권장 조치

- 결과 페이지나 테스트 페이지에서 “테스트는 시작 후 24시간 이내에 완료해 주세요” 안내 문구 추가.
- 필요 시 만료 시간을 환경 변수로 두고(예: 24h → 48h) 조정 가능하게 할 수 있습니다.

---

## 7. 요약 표

| 구분 | 위험 요소 | 실현 불가/제한 조건 | 권장 조치 |
|------|-----------|----------------------|-----------|
| 1 | Results API | anon만 사용 시 RLS로 404 | 결과 조회에 Service Role 사용 |
| 2 | Responses API | anon만 사용 시 RLS로 저장 실패 가능 | Service Role 사용 또는 session_id 전달 후 RLS 조건 충족 |
| 3 | Complete API | Service Role 없으면 쓰기 실패 | Service Role 필수로 문서화 및 배포 가이드 반영 |
| 4 | 이용약관 등 | 전문 열람 경로 없음 | /mnps/terms 등 전용 페이지 및 링크 제공 |
| 5 | 결제(잠금 해제) | assessmentId 없을 때 버튼 무반응 | 비활성화 + 안내 문구 또는 재진행 유도 |
| 6 | 규준/백분위 | 005/006(007) 미적용 시 RPC 없음 | 마이그레이션 필수 명시, RPC 실패 시 graceful 처리 |
| 7 | startedAt | 24시간 초과 시 완료 거부 | 안내 문구, 필요 시 만료 시간 설정 가능 |

---

위 항목들을 보완하면, MNPS가 “실현 불가능”에 가까운 상태에 빠지지 않고 실제 서비스 환경에서 동작할 가능성이 높아집니다.
