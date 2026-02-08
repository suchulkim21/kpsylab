# MNPS 규준 루프 절차 (데이터 축적 후 NORM 반영)

데이터가 쌓인 뒤 **NORM_CONFIG**를 실제 분포에 맞게 반영하는 절차를 정리한 문서입니다.  
규준은 high/mid/low 구간 해석, 아키타입·시나리오 강도 판정에 사용되므로, 주기적 보정이 신뢰도·가격 정당화에 필요합니다.

---

## 1. 전제 조건

| 항목 | 설명 |
|------|------|
| **DB 마이그레이션** | `006_mnps_norm_distribution.sql`, `007_analyze_mnps_norms.sql` 적용 완료. `get_mnps_norm_distribution` RPC 사용 가능. |
| **최소 샘플** | `normConfigFromDistribution`에서는 **10건 미만**이면 권장값을 내지 않음. 실무적으로는 **수백~1만 건** 이상에서 보정하는 것을 권장. |
| **권한** | 규준 분석 API `GET /api/admin/mnps/norm-analysis` 호출 시 `x-admin-secret`(또는 ADMIN_SECRET) 설정 시 권장. |

---

## 2. 규준 루프 절차 (단계별)

### 2.1 분포 통계 조회

1. **Supabase RPC 직접 호출**  
   - `get_mnps_norm_distribution()` 호출.  
   - 반환: `raw_d_total`(n, mean, stddev, p10~p90), `traits`(machiavellianism, narcissism, psychopathy, sadism 각각 n, mean, stddev, p10~p90).

2. **Admin API 사용**  
   - `GET /api/admin/mnps/norm-analysis`  
   - 응답: `distribution`, `currentConfig`, `recommendedConfig`, `suggestions`, `configAsCode`.

### 2.2 권장값 검토

- **recommendedConfig**  
  - highCutoff ← raw_d_total.p80 (상위 20% 하한)  
  - midCutoff ← raw_d_total.p50 (중위)  
  - archetypeHighCutoff / subFactorHighCutoff ← 4개 trait의 p80 평균  
  - dTotalCritical ← raw_d_total.p90 (상위 10%)  
  - dTotalHigh ← raw_d_total.p80 (상위 20%)

- **suggestions**  
  - 현재 NORM_CONFIG와 권장값 차이에 대한 설명. 2점 초과 차이 시 구체적 메시지 제공.

### 2.3 NORM_CONFIG 반영 (수동)

1. **configAsCode** 복사  
   - API 응답의 `configAsCode`는 `lib/mnps/darkNatureScoring.ts`에 붙여넣을 수 있는 형태의 문자열입니다.

2. **파일 수정**  
   - `apps/portal/lib/mnps/darkNatureScoring.ts`  
   - `export const NORM_CONFIG = { ... } as const;` 블록을 **configAsCode** 내용으로 교체.

3. **버전 관리**  
   - 커밋 메시지에 **규준 보정 일자, 샘플 수(n), 적용한 p80/p50 등 요약**을 남기면 이후 추적에 유리합니다.  
   - 예: `chore(mnps): norm config from distribution (n=1200, p80=72, p50=42)`.

### 2.4 배포 및 검증

- 변경 사항 배포 후,  
  - 일부 assessmentId로 결과 페이지·리포트가 기대대로 high/mid/low 구간을 보이는지 확인.  
  - 필요 시 Admin에서 다시 norm-analysis를 호출해 currentConfig가 반영되었는지 확인.

---

## 3. 주기 권장

| 시점 | 권장 행동 |
|------|-----------|
| **런칭 직후** | 샘플 10건 미만이면 보정 보류. 문구만 "해석은 누적 데이터 기반 규준을 참고합니다" 등으로 안내. |
| **1,000건 이상** | 1회 규준 루프 실행 권장. highCutoff/midCutoff 등이 문헌·집단과 맞는지 검토. |
| **1만 건 이상** | 2회 보정 후, 분기/반기 단위로 재분석·필요 시 NORM_CONFIG 재반영. |

---

## 4. 관련 파일·API

| 구분 | 경로 |
|------|------|
| NORM 정의 | `lib/mnps/darkNatureScoring.ts` — `NORM_CONFIG` |
| 분포 → 권장값 | `lib/mnps/normConfigFromDistribution.ts` — `recommendNormConfig`, `formatNormConfigAsCode` |
| Admin API | `GET /api/admin/mnps/norm-analysis` |
| RPC | `get_mnps_norm_distribution` (006), `analyze_mnps_norms` (007) |

---

## 5. 결과 화면 문구 보강

규준을 데이터 기반으로 보정한 뒤, 결과 페이지·면책 근처에 다음을 노출하면 신뢰도·정당화에 도움이 됩니다.

- **예시**: "해석은 누적 응답 데이터 기반 규준(백분위)을 참고합니다. 규준은 주기적으로 갱신될 수 있습니다."

---

*규준 루프를 자동화(배포 시 RPC 결과로 NORM 주입)하려면 별도 설계가 필요하며, 현재는 수동 반영 절차를 권장합니다.*
