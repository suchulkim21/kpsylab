# MNPS 아키타입 유형 구분 가능성 분석 및 확장 계획

## 1. 현재 상태 요약

### 1.1 아키타입 결정에 사용하는 입력

| 입력 | 차원 | 용도 | 비고 |
|------|------|------|------|
| **traitScores** | 4개 (M, N, P, S) | 0~100, 순위·격차·수준 | **유일한 판별 입력** |
| **dTotal** | 1개 | DARK_APEX(전원 ≥75) 판별 | 특수 케이스만 |
| **subFactorScores** | 4개 (Ego, MD, Ent, Spite) | **미사용** | Good/Bad 해석 보조만 |
| **시나리오 응답** | 4문항 | trait 점수에 합산만 | 패턴·태그 미사용 |

즉, **19종 구분은 전부 “4개 trait 점수의 순위 + 격차(gap) + 최고점 수준”**으로만 이루어짐.

### 1.2 현재 구분 로직 (요약)

```
1) 4개 모두 ≥ 75        → DARK_APEX
2) 최고점 < 50         → ALL_LOW
3) gap ≥ 15 && 1등 ≥ 60 → {1등}_PURE (4종)
4) 1등 < 60            → HYBRID_MID
5) 그 외               → {1등}_{2등} (12종)
```

- **Pure**: 1등 특성 1개로 결정 (4종).
- **Hybrid**: 1등·2등 조합만 사용, **3등·4등은 미사용**.
- **Special**: DARK_APEX, ALL_LOW, HYBRID_MID (3종).

---

## 2. 유형 구분 가능성 분석

### 2.1 데이터가 주는 “차원”

| 차원 | 현재 사용 | 구분 가능 여부 | 근거 |
|------|-----------|----------------|------|
| **4 trait 순위** | ✅ 사용 | ✅ 가능 | 1·2등 순위로 12가지 Hybrid 구분 가능 |
| **1등–2등 격차** | ✅ 사용 | ✅ 가능 | Pure vs Hybrid 구분에 충분 (gap 15 등) |
| **최고점 절대 수준** | ✅ 사용 | ✅ 가능 | ALL_LOW(<50), MID(<60), DARK_APEX(≥75) 구분 |
| **3등 특성** | ❌ 미사용 | ✅ 가능 | 이미 계산된 4개 점수로 3등 확정 가능 |
| **4개 subFactor** | ❌ 미사용 | ✅ 가능 | Ego, MD, Ent, Spite 0~100 별도 산출됨 |
| **D-Total 구간** | 일부만 | ✅ 가능 | Extreme/High/Moderate/Low 이미 계산 |
| **시나리오 4문항** | 합산만 | △ 제한적 | 문항 수 적어 “패턴”만 보조용으로 활용 가능 |

### 2.2 측정 오차와 구분 한계

- 특성당 문항 수: **약 5문항** (n1~n4,n1b 등).
- 5문항 평균의 표준오차를 감안하면, **몇 점 차이로 유형을 나누는 것은 불안정**할 수 있음.
- 따라서 확장 시:
  - **순위·명확한 구간(예: gap ≥15, 1등 ≥60)** 기반 유형은 유지하고,
  - **“세밀한 점수 차이”(예: gap 15 vs 18)로만 구분하는 신규 유형**은 피하는 것이 좋음.
- **3등 특성**, **subFactor 우세**, **시나리오 태그**는 “추가 차원”이라 점수 미세 차이에 덜 의존해 구분 가능성이 높음.

### 2.3 결론: 여러 유형을 더 구분할 수 있는가?

- **현재 19종**: 4 trait 순위·격차·수준만으로도 구분 가능하며, 로직상 무리 없음.
- **추가 구분도 가능**:
  - **3등 특성**으로 Hybrid 세부 유형 (같은 1·2등이라도 “3등이 Psych vs Sad” 등).
  - **subFactor 우세**로 “같은 아키타입 내 하위 스타일” (전략적 vs 이기적 vs 악의적 등).
  - **강도(intensity)**로 같은 19종 내에서 “메시지/강조만” 다르게 (Extreme vs High 등).
  - **시나리오**는 “태그”(복수적·공리적 등) 수준으로만 사용하는 것이 안전.

---

## 3. 확장 계획 (단계별)

### Phase 1: 현재 19종 검증 (단기)

- **목표**: 19종이 실제 데이터에서 잘 구분되는지 확인.
- **방법**:
  - 완료된 검사 결과 샘플에서 `archetypeId`별 분포 확인 (한 유형에 과도하게 몰리지 않는지).
  - Pure 조건(gap ≥15, 1등 ≥60) 충족 비율, HYBRID_MID 비율 확인.
- **산출물**: “19종 분포 리포트” (내부용). 필요 시 임계값(예: PURE_GAP_PRECISE, PURE_MIN_SCORE) 미세 조정.

### Phase 2: 3등 특성 활용 — Hybrid 세분화 (중기)

- **아이디어**: 동일 `PRIMARY_SECONDARY`라도 **3등(auxiliary2)** 특성에 따라 하위 유형 부여.
- **예시**:
  - `MACH_NARC` + 3등 Psych → `MACH_NARC_PSYCH` (무대 연출가·충동 쪽)
  - `MACH_NARC` + 3등 Sad  → `MACH_NARC_SAD`  (무대 연출가·지배/가학 쪽)
- **규칙 (제안)**:
  - 3등과 2등 점수 차이가 **일정 이하**(예: 10점 이하)일 때만 3등 반영.
  - 그렇지 않으면 기존 `MACH_NARC` 등으로 유지 (과도한 세분화 방지).
- **추가 유형 수**: 12 Hybrid × (3등이 의미 있게 구분되는 경우) → 최대 12×2 = 24개 세부 Hybrid.  
  실제로는 “3등이 2등과 격차 작을 때”만 세분화하면 **+5~10종** 수준이 적당.
- **구현**:
  - `determineArchetype` (또는 그 상위)에서 3등 trait 계산.
  - `MnpsArchetypeId`에 `MACH_NARC_PSYCH` 형태 추가.
  - `archetypeContent.ts`에 해당 ID용 headline / goodReport / badReport / advice 추가.

### Phase 3: SubFactor 프로필로 스타일 레이블 (중기)

- **아이디어**: 아키타입은 19종(또는 Phase 2 확장분) 유지하고, **subFactor 우세**로 “스타일”만 추가.
- **예시**:
  - MACH_PURE + MoralDisengagement 최고 → “전략적·도덕이탈형”
  - MACH_PURE + Egoism 최고 → “이기적·자기이익형”
- **표시**: 아키타입 이름 아래 “스타일: OOO” 형태로만 노출 (유형 수 폭증 방지).
- **구현**:
  - 4개 subFactor 중 최고인 것(또는 상위 2개)으로 스타일 코드 결정.
  - `AssembledReport`에 `styleLabel?: string` 추가.
  - UI에서 아키타입 + 스타일 레이블 함께 표시.

### Phase 4: 강도(Intensity)별 메시지 분기 (단기~중기) ✅ 적용됨

- **아이디어**: 아키타입 ID는 그대로 두고, **D-Total 구간**(Extreme/High/Moderate/Low)에 따라 문구만 분기.
- **예시**:
  - The Cold Architect (High): “효율과 목표 달성이 강점입니다. 감정 배제가 과하면 관계 리스크가 커질 수 있습니다.”
  - The Cold Architect (Extreme): “극단적 효율 추구는 인간관계와 법적 경계를 흐리게 할 수 있습니다. 전문가 상담을 권합니다.”
- **구현** (적용 완료):
  - `dynamicProfileMatrix.ts`: `getIntensity(dTotal)` export.
  - `archetypeContent.ts`: `ArchetypeContent`에 `intensityOverrides?: IntensityOverrides` 추가.
  - DARK_APEX, MACH_PURE, NARC_PURE, ALL_LOW에 Extreme/High 또는 Low/Moderate 오버라이드 예시 추가.
  - `assembleReport`: `getIntensity(totalDScore)`로 강도 산출 후 headline·advice 오버라이드 적용.

### Phase 5: 시나리오 태그 (선택)

- **아이디어**: sc1~sc4 응답이 극단(예: 4~5)인 개수/패턴으로 “복수적”“공리적”“권리주장형” 등 **태그**만 부여.
- **표시**: 결과 요약에 태그 1~2개만 노출 (유형 수는 늘리지 않음).
- **구현**: 문항별 점수 접근 가능 여부 확인 후, 태그 규칙 테이블 추가 및 `AssembledReport.tags?: string[]` 등으로 전달.

### Phase 6: 문항 확장 (장기)

- **목적**: 특정 아키타입·subFactor 구분력 향상.
- **방향**:
  - 3등·subFactor 구분을 위해 “도덕 이탈 vs 이기심” 등 구인별 문항 1~2개씩 추가.
  - 시나리오 1~2개 추가 시, Phase 5 태그 신뢰도 상승.
- **전제**: 검사 길이·피로도와 타협점 필요 (42문항 → 48~50문항 수준 제안).

---

## 4. 확장 시 유형 수 요약 (참고)

| 단계 | 내용 | 대략 유형 수 | 비고 |
|------|------|--------------|------|
| 현재 | 19종 (Pure 4 + Hybrid 12 + Special 3) | 19 | 구현 완료 |
| Phase 2 | Hybrid에 3등 반영 (세부 ID) | 19 ~ 29 | +5~10 종 |
| Phase 3 | SubFactor 스타일 레이블 | 19(또는 29) + 스타일 조합 | 유형 수는 유지, 레이블만 추가 |
| Phase 4 | Intensity별 문구 분기 | 19(또는 29) × 4 강도 변형 | ID 수 동일, 메시지만 분기 |
| Phase 5 | 시나리오 태그 | 19(또는 29) + 태그 | ID 수 동일 |
| Phase 6 | 문항 추가 | 동일 또는 소폭 확장 | 구분력·안정성 향상 |

---

## 5. 권장 순서

1. **Phase 1** — 19종 분포·임계값 점검 (데이터 기반 검증).
2. **Phase 4** — Intensity별 메시지 분기 (구현 부담 적고, 리스크 메시지 차별화에 유리).
3. **Phase 2** — 3등 특성 Hybrid 세분화 (구분 가능성 높고, 콘텐츠만 추가하면 됨).
4. **Phase 3** — SubFactor 스타일 레이블 (아키타입 유지하면서 설명력만 보강).
5. **Phase 5** — 시나리오 태그 (선택).
6. **Phase 6** — 문항 확장 (장기, 설계·검증 후).

---

## 6. 정리

- **여러 유형을 구분할 수 있는가?**  
  → **가능하다.** 현재 19종은 4 trait 순위·격차·수준만으로도 구분 가능하며, 3등·subFactor·강도·시나리오를 쓰면 **구분 가능한 유형/스타일/메시지를 더 늘릴 수 있음**.
- **확장 시 유의점**:
  - **측정 오차**: 몇 점 차이로만 나누는 신규 유형은 피하고, **순위·명확 구간·추가 차원(3등, subFactor)** 위주로 설계.
  - **콘텐츠 부담**: Phase 2 확장 시 새 ID마다 headline / goodReport / badReport / advice 필요.
  - **일관성**: `MnpsArchetypeId` 타입, `ARCHETYPE_CONTENT`, `getDisplayFromArchetypeId` 등 한 곳만 수정해도 되도록 유지.

이 문서는 `docs/MNPS_ARCHETYPE_SYSTEM.md`, `docs/MNPS_TEST_OVERVIEW.md`와 함께 두고, 확장 시 Phase별로 업데이트하는 것을 권장합니다.
