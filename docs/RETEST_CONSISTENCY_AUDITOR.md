# 재검사 데이터 통합 및 일관성 유지 (Consistency Auditor)

## 개요

사용자가 특정 테스트를 재검사하여 새로운 결과가 나왔을 때, 이 변화가 전체 심리 프로필(Global Vector)에 미치는 영향을 분석하고, 연관된 모든 테스트 결과지의 맥락을 재구성하는 시스템입니다.

## 아키텍처

### 1. Global Master Vector (`lib/store/masterVector.ts`)

**가중치 합성 공식**
$$V_{master} = \frac{\sum_{m=1}^{k} (V_m \cdot W_m \cdot R_m)}{\sum_{m=1}^{k} (W_m \cdot R_m)}$$

- **Latent Trait Space** (6차원): anxiety, control, extraversion, deliberation, people_pleasing, impulsivity
- **W_m (신뢰 가중치)**: Module_1=0.9, Module_2=0.8, Module_3=0.7
- **R_m (최신성)**: `e^(-λ·Δt)`, λ=0.02 (약 35일 후 0.5)
- **C (일관성)**: 코사인 유사도 `(V_old · V_new) / (|V_old||V_new|)`, C ≤ 0.4 → **Anomaly** (심리적 급변/페르소나 분리)

### 2. Centralized State Store (`lib/store/userGlobalVector.ts`)

- **저장소 키**: `sg_global_profile` (localStorage)
- **역할**: `user_global_vector` 단일 소스로 관리
- **구조**:
  - `m1`, `m2`, `m3`: 모듈별 메타데이터
  - `master_vector`, `module_history`, `consistency_score`
  - `completedModules`, `dirtyFlags`

### 2. Consistency Auditor (`lib/services/consistencyAuditor.ts`)

| 함수 | 역할 |
|------|------|
| `detectDelta()` | 이전/신규 결과 비교, 변화 지점 식별 |
| `applyRetestAndPropagate()` | 전역 업데이트 + dirty flag 설정 + 진화 내러티브 생성 |
| `getEvolutionBannerText()` | M1 결과 페이지용 "진화 배너" 텍스트 |

### 3. 처리 순서

1. **변화 감지**: `previousResult` vs `newResult` → typeChanged 등
2. **전역 업데이트**: `updateM1Global()` 호출
3. **Cross-Reference**: M1 유형 변경 시 m2, m3 dirty flag 설정
4. **내러티브 동기화**: "이전 검사에서는 X였으나, 이번 검사에서 Y가 더 명확해졌습니다"

## 연동 지점

- **Module1 페이지** (`module1/page.tsx`): `finishAnalysis` 시 `applyRetestAndPropagate` 호출
- **Module1 결과** (`module1/result/page.tsx`): `getEvolutionBannerText`로 재검사 배너 표시
- **Module2 결과** (`module2/result/page.tsx`): `isDirty('m2')` 시 "M1 재검사로 관점 갱신" 배너

### 5. 동적 템플릿 주입 (adaptModule1)

- `adaptModule1(data, context)` – context에 `masterVector`, `m2Data`, `consistencyScore` 전달
- `deliberation > 0.8` 시 CAUTION_MODE: "신중함이 패턴을 보완할 잠재력" 문구 추가

### 6. 모순→인사이트 (conflictInsight.ts)

- M1 vs M2 결과 충돌 시 `getConflictInsight()` 호출
- "사회적 상황에서는 X이나, 개인적 공간에서는 Y" 심리적 역동 설명
- `UnifiedReportData.conflictInsight` → 리포트 카드에 "통합 관점: 심리적 역동" 섹션 표시

## 확장 포인트

- M3 리포트 생성 시 `master_vector` 참조
- 인과관계 맵 확장: `CAUSAL_DEPS`에 추가 모듈 연관 정의
