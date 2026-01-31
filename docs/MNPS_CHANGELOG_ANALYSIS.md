# MNPS(Dark Nature Test) 변경 사항 상세 분석 보고서

본 문서는 MNPS 서비스에 적용된 **주요 변경 사항**을 체계적으로 정리·분석한 보고서입니다.

---

## 1. 법적·운영 페이지 (이용약관·개인정보 처리방침)

### 1.1 개요
- **목적**: 베타 서비스 운영에 필요한 최소 법적 구색 확보, 사용자 이해 용이한 문구로 구성
- **경로**: `/mnps/terms`, `/mnps/privacy`

### 1.2 구현 내용

| 구분 | 내용 |
|------|------|
| **공통 레이아웃** | `app/mnps/components/LegalPageShell.tsx` — 상단 "MNPS로 돌아가기" 링크, 제목·부제, 푸터(문의: KPSY LAB). `LegalSection`, `LegalSectionTitle`로 섹션·타이포 통일 |
| **이용약관** | 베타 서비스 안내(예고 없이 변경 가능), 면책 조항(의학적/임상적 진단 대체 불가·자기 성찰·오락 목적·전문가 상담 권고), 저작권(무단 복제·배포 금지) |
| **개인정보 처리방침** | 수집 항목(응답·점수·접속 로그, 회원 식별 정보 미수집), 수집 목적(서비스·통계·알고리즘 개선·익명화), 보관 기간(법률 자문 후 구체화·캐시 삭제·요청 시 파기 방향), 면책 요약 |
| **연결** | 결과 페이지 하단 `DisclaimerBanner`에서 이용약관·개인정보처리방침 링크 노출 |

### 1.3 영향
- 결과 페이지·푸터에서 법적 페이지로 유입 가능, 404 방지
- 상업 전환 전 **전문 법률 자문** 및 약관 전문 보강 권장

---

## 2. 문항 데이터 전면 개편 (42문항 보정본)

### 2.1 구조 변경 요약

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| **검증 문항 수** | 8문항 (v1~v8) | **4문항** (v1, v3, v7, v4) |
| **삭제된 검증 ID** | — | v2, v5, v6, v8 |
| **신규 문항** | — | **m5**, **p5**, **s5**, **sp4** |
| **문항 타입** | `DarkNatureQuestion` (type) | **`Question`** (interface) + `DarkNatureQuestion = Question` |
| **VALIDATION_QUESTION_IDS** | `['v1','v3','v4','v7']` | `['v1','v3','v7','v4']` (표기 순서만 조정) |

### 2.2 신규 문항 상세

| ID | order | category | trait | subFactor | 측정 의도 |
|----|:-----:|----------|-------|-----------|-----------|
| **m5** | 34 | darkTetrad | machiavellianism | egoism | 비밀/정보 누설·인맥 도구화 성향 |
| **p5** | 36 | darkTetrad | psychopathy | moralDisengagement | 거짓말 들통 시 냉담·태연 대처 (냉담함) |
| **s5** | 37 | darkTetrad | sadism | spitefulness | 연인·친구 통제·질투/불안 유발 (가스라이팅·지배) |
| **sp4** | 38 | dFactor | — | spitefulness | 무시당했을 때 보복·대가 치르게 하려는 성향 |

### 2.3 trait/subFactor 매핑 변경

| 문항 | 변경 전 | 변경 후 | 비고 |
|------|---------|---------|------|
| **p1** | psychopathy, moralDisengagement | psychopathy, **egoism** | 매핑 변경 |
| **p2** | psychopathy, moralDisengagement | psychopathy, **spitefulness** | 매핑 변경 |
| **p3** | psychopathy, moralDisengagement | psychopathy, **(subFactor 없음)** | 스릴·규칙 위반만 |
| **sc4** | psychopathy, moralDisengagement | psychopathy, **egoism** | 이득 선택 시나리오 |

### 2.4 문항 텍스트 톤 변경 (요지)
- **나르시시즘·권리 의식**: "당연하다" → "내 능력에 비추어 볼 때 당연하다", "규칙·줄 서기가 나에게는 유동적으로" 등으로 구체화
- **이기주의·마키아벨리즘**: "내 이익이 우선" → "상황이 급하면 타인 사정 무시", "조종하여 원하는 결과를 얻는 것은 능력" 등 날카로운 표현
- **시나리오(sc1~sc4)**: "나는:" 불완전 문장 제거 → "[상황] … 나는 … 할 것이다" 형태로 행동 의도 명시
- **검증(v1,v3,v4,v7)**: "(검증)" 접두어, "이 테스트에 솔직하게", "실제 성격과 일치" 등으로 정직·일관성·자기보고 일치 강조

### 2.5 영향
- **채점**: m5, p5, s5, sp4가 trait/subFactor에 반영되어 D-Total·아키타입·리포트 해석에 영향
- **DB**: `questions` 테이블에 m5, p5, s5, sp4 행 추가 및 v2, v5, v6, v8 제거(또는 비활성화) 필요 시 마이그레이션 필요

---

## 3. 검증 점수 계산 로직 (동적·100점 환산)

### 3.1 변경 전
- 검증 4문항(v1, v3, v4, v7)에 **가중치 1.2** 적용 후 평균 산출
- `normalizeLikert(avg)`로 1~5 평균 → 0~100 환산

### 3.2 변경 후

```
maxPossibleValidation = validationIds.length * 5   // 4 × 5 = 20점 만점
currentValidationScore = Σ (역코딩 적용 후 1~5 클램프한 값)
validationScore = (currentValidationScore / maxPossibleValidation) × 100
```

- **역코딩**: v3, v7 → `6 - score` (집합 `VALIDATION_REVERSE_IDS`로 관리)
- **동적 만점**: `VALIDATION_IDS.length * 5` → 검증 문항 수가 바뀌어도 자동 반영

### 3.3 효과
- **한 문항만 틀려도** 만점 대비 5점 감점 → 100점 기준으로는 약 **25점** 하락
- 방어적 응답·불일치에 더 민감하게 반응하여, 분석 정확도·검증 점수의 변별력 향상

### 3.4 관련 코드 위치
- `lib/mnps/darkNatureScoring.ts`: `VALIDATION_IDS`, `VALIDATION_REVERSE_IDS`, 검증 점수 계산 블록

---

## 4. NORM_CONFIG 조정 (구간·아키타입 임계)

### 4.1 변경 값

| 항목 | 변경 전 | 변경 후 | 의도 |
|------|---------|---------|------|
| **highCutoff** | 75 | **70** | 문항이 "매운맛"으로 바뀌어 고득점이 어려워짐 → high 구간 하한 완화 |
| **midCutoff** | 45 | **40** | mid 구간 하한 완화 |
| **archetypeHighCutoff** | 70 | 70 (유지) | 필요 시 65로 소폭 하향 고려 (주석 반영) |
| **subFactorHighCutoff** | 70 | 70 (유지) | — |
| **dTotalCritical / dTotalHigh** | 85 / 70 | 변경 없음 | — |

### 4.2 영향
- **리포트 구간**: high/mid/low 판정이 더 낮은 점수에서부터 적용됨 (예: 70점 이상 → high)
- **아키타입·SubFactor "높음"**: 70 유지로 기존과 동일; 추후 규준 데이터 확보 시 65 등으로 재조정 가능

---

## 5. 기타 변경 (타입·스크립트·문서)

### 5.1 DarkNatureResult
- **추가 필드**: `percentileAtCreation?: number` — 검사 완료 시점 D-Score 백분위, "상위 N% 위험군" 배지용

### 5.2 스크립트 (dotenv·path)
- **path → nodePath**: dotenv와 함께 사용하는 스크립트에서 `import * as path` → `import * as nodePath`, `path.join`/`path.resolve` → `nodePath.*` 로 변경 (이름 충돌 방지)
- **대상 파일**: `download-processed-images.ts`, `generate-blog-content.ts`, `check-blog-post-ids.ts`, `check-blog-images.ts`, `upload-blog-posts.ts`, `create-blog-post.ts`

### 5.3 문서
- **MNPS_TEST_OVERVIEW.md**: §7.3 이용약관·개인정보, §8 파일 구조, §10 완성도, §11.5 법적 페이지, §13 요약, §14.6 재평가 반영
- **MNPS_QUESTIONS_DATA.md**: 42문항 보정본 기준으로 표·카테고리 요약 갱신

---

## 6. 요약·권장 사항

### 6.1 변경 요약 표

| 영역 | 변경 요지 | 주의 사항 |
|------|-----------|-----------|
| **법적 페이지** | 이용약관·개인정보 4문단형, LegalPageShell 공통화 | 법률 자문 후 전문 보강 권장 |
| **문항 42개** | 검증 8→4, 신규 m5/p5/s5/sp4, 문장·매핑 보정 | DB questions 테이블 동기화 필요 시 마이그레이션 |
| **검증 점수** | 동적 만점(4×5=20), 합산 후 100점 환산 | 역문 v3·v7 유지 |
| **NORM_CONFIG** | highCutoff 70, midCutoff 40 | 규준 RPC 결과로 추가 조정 가능 |
| **타입·스크립트** | Question 인터페이스, percentileAtCreation, nodePath | 기존 import 호환 유지 |

### 6.2 권장 후속 작업
1. **DB**: `questions` 테이블에 m5, p5, s5, sp4 추가 및 v2, v5, v6, v8 제거(또는 비활성화) 시 SQL/시딩 반영
2. **규준**: `get_mnps_norm_distribution` / `analyze_mnps_norms` RPC 실행 후 NORM_CONFIG·archetypeHighCutoff 등 추가 보정 검토
3. **법적**: 상용 전환 전 이용약관·개인정보처리방침 전문 법률 검토

---

*작성 기준: app/mnps/test/questions.ts, lib/mnps/darkNatureScoring.ts, app/mnps/terms|privacy, 관련 API·문서 반영분*
