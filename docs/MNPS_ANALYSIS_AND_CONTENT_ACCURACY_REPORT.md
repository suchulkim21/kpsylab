# MNPS 분석 엔진 및 콘텐츠 제공 정확도 상세 보고서

## 1. 개요

본 문서는 MNPS(Dark Nature) 테스트의 **분석 엔진**과 **콘텐츠 제공**의 정확도를 코드·구조 기준으로 정리한 것이다.  
핵심 소스: `lib/mnps/darkNatureScoring.ts`, `dynamicProfileMatrix.ts`, `archetypeContent.ts`, `contentLibrary.ts`, `app/mnps/test/questions.ts`.

---

## 2. 분석 엔진 정확도

### 2.1 채점 파이프라인

| 단계 | 위치 | 설명 | 정확도 관련 요소 |
|------|------|------|------------------|
| 1. 문항→점수 매핑 | `questions.ts` + `scoreDarkNature()` | 42문항 중 **trait/subFactor가 있는 32문항**만 채점에 사용. Likert 1~5 → 0~100 정규화. | 역문항(v3, v7)은 `6 - value` 적용. 문항별 trait/subFactor 일치 여부가 곧 구인 측정 정확도. |
| 2. 특성 점수 | `darkNatureScoring.ts` 262~321행 | trait별 sum/count → 평균 → `normalizeLikert()` (1→0, 5→100). | 가중치: Mach 1.0, Narc 0.9, Psych 1.1, Sad 1.0. 동일 trait 내 문항 수 불균형 시 특성별 기여도 차이 가능. |
| 3. D-Total | 동일 323~339행 | 가중 합산 + Inter-correlation 가산(trait 평균×0.2, 상한 20). rawDTotal 90 초과 구간은 tanh로 압축. | 규준 미반영 시 high/low 구간 해석이 집단 대비가 아닌 **절대 점수 기준**으로만 동작. |
| 4. 아키타입 결정 | `dynamicProfileMatrix.ts` `determineArchetype()` | 1) 4개 모두 ≥75 → DARK_APEX 2) 1등 <50 → ALL_LOW 3) gap≥15 && 1등≥60 → PRIMARY_PURE 4) 1등 <60 → HYBRID_MID 5) 그 외 → PRIMARY_SECONDARY (예: MACH_NARC). | **경계값(50, 60, 75, gap 15)** 에서 1점 차이로 아키타입이 바뀜. 결정론적이지만 경계 부근에서는 민감. |
| 5. 분석 정확도 | `darkNatureScoring.ts` 417~441행 | Base 80 + 검증보너스 − 일관성패널티 + 내부일관성보너스 + 쌍일관성보너스 − 응답시간패널티 − 불성실패턴패널티. 50~99 clamp. | 검증 4문항, 일관성 쌍 2쌍(n1/n1b, m1/m1b), LSI≥6 또는 지그재그 비율≥0.28 시 불성실 플래그. |

### 2.2 검증·일관성 로직

- **검증 문항**: v1, v3, v4, v7 (4문항). v3, v7 역코딩. 비선형 매핑(0.25→40, 0.5→70, 0.75→90, 1→100)으로 False Positive 완화.
- **일관성 쌍**: (n1, n1b), (m1, m1b). 쌍별 |답1−답2| 평균으로 ±5점 보너스/패널티.
- **불성실 패턴**: Longstring Index(동일 응답 6회 연속) 또는 극단 지그재그(1-5-1-5) 비율 ≥0.28 → `insincereResponsePattern` + 분석 정확도 −10.
- **응답 시간**: 문항당 0.8초 미만 시 `responseTimePenalty` + 분석 정확도 −30.

이 부분은 **로직 자체는 명확하고 결정론적**이며, 단위 테스트(`__tests__/lib/mnps/darkNatureScoring.test.ts`)에서 동일 입력→동일 출력, 전저점/전고점 시 D점수·아키타입, 분석 정확도 50~99, 응답시간 패널티, 리포트 조립이 검증된다.

### 2.3 규준(NORM) 정확도

- **NORM_CONFIG**는 **상수 고정값** (highCutoff 70, midCutoff 40, archetypeHighCutoff 70, dTotalCritical 85, dTotalHigh 70).
- `normConfigFromDistribution.ts`는 DB/RPC 분포(raw_d_total, traits의 p50/p80/p90 등)를 받아 **권장 NORM**을 제안만 하고, **실제 채점에 자동 반영하지 않음**.  
→ 즉, **규준 반영 여부는 운영자가 수동으로 NORM_CONFIG를 갱신했는지에 따름**. 미반영 시 high/mid/low 구간 해석이 **실제 수검자 분포와 불일치**할 수 있어, 규준 정확도는 “구현된 도구는 있으나, 적용 주기가 불명확”한 상태다.

### 2.4 문항–구인 매핑 정확도

- 32문항이 trait/subFactor와 1:1로 연결되어 있음. 문항 내용과 구인 정의가 일치하는지는 **내용 타당도(전문가 검토)** 영역이며, 코드 상으로는 **한 문항이 한 trait + 선택적 subFactor**에만 기여한다.
- **시나리오 문항(sc1~sc4)** 도 동일하게 trait/subFactor에 합산되므로, 채점 알고리즘 상 다른 문항과 동일한 방식으로 반영된다.

---

## 3. 콘텐츠 제공 정확도

### 3.1 아키타입 → 콘텐츠 매핑

- **determineArchetype()** 반환값(`MnpsArchetypeId`)은 19종: MACH_PURE, MACH_NARC, …, DARK_APEX, ALL_LOW, HYBRID_MID.
- **ARCHETYPE_CONTENT**(`archetypeContent.ts`)는 **동일 19개 키를 모두** 보유. 따라서 **아키타입 ID당 전용 goodReport/badReport가 1:1로 존재**하며, 빈칸/폴백으로 인한 잘못된 콘텐츠 노출 가능성은 낮다.
- **레거시 매핑**: `getProfileMatrix()` → `legacyArchetypeKey`는 `LEGACY_ARCHETYPE_MAP`으로 contentLibrary의 archetypeIntros 등과 연결된다. **assembleReport**는 `archetypeId`가 있으면 **ARCHETYPE_CONTENT**만 사용하고, 없을 때만 contentLibrary(archetypeIntros)를 fallback으로 쓰므로, 실제 노출은 대부분 ARCHETYPE_CONTENT 기준으로 일관된다.

### 3.2 트레이트 수준 → 스니펫 선택

- **Trait 레벨**: `getTraitLevel(v)` → high(≥70), mid(40~70), low(<40). NORM_CONFIG의 highCutoff/midCutoff 사용.
- **스니펫 선택**: `getTraitSnippet(trait, level, type, indexMod)`  
  - `contentTraitScores[trait][level]`이 배열이면:  
    `idx = (floor((m+n+p+s)/100) + traitSeedOffset[trait] + synergySeed + indexMod + 100) % snippets.length`  
  - **시드**: trait별 0,3,6,9 + synergyKeys[0] 문자열 시드 + moralHigh/spiteHigh에 따른 indexMod(0 또는 1).  
→ **같은 프로파일이라도 점수 합·시너지·서브팩터에 따라 다른 스니펫이 선택**되며, 이는 “정확도”라기보다 **다양성·비단조로움**을 위한 설계다. 다만 시드 공식이 **실제 프로파일과의 의미적 대응**을 보장하지는 않으며, “같은 레벨이면 후보 중 하나가 무작위에 가깝게 선택된다”에 가깝다.

### 3.3 시너지 콘텐츠

- **synergyKeys**는 6가지 조합(mach_sad, mach_psych, mach_narc, psych_sad, narc_psych, narc_sad) 중 **조건을 만족하는 것만** 필터링.  
- **assembleReport**에서는 **첫 번째 시너지 하나만** 사용(`break`). 즉, 동시에 여러 시너지가 있어도 **한 가지 시너지 문단만** 노출된다.  
→ 2개 이상 시너지가 있는 프로파일에서 “가장 중요한 시너지”를 선택하는 로직은 없고, **배열 순서(하드코딩)**에 의해 결정된다. 이는 해석의 완전성보다는 단순화를 위한 트레이드오프다.

### 3.4 D-Factor·서브팩터

- **moralDisengagement**, **spitefulness** 등이 subFactorHighCutoff(70) 이상일 때만 별도 문단이 붙음.  
- **dFactorInterpretations**: 4개 요인(이기주의, 권리의식, 도덕적 이탈, 악의성) × High/Low별 Good/Bad 문장이 contentLibrary에 정의되어 있고, **fullBadReport**에서만 D-Factor 섹션으로 출력.  
→ 서브팩터 점수와 문장 내용의 대응은 **정의된 텍스트에 의존**하며, High/Low 이분만 사용하므로 **중간 구간(40~70)** 은 “High도 Low도 아닌” 해석이 명시되지 않는다.

### 3.5 강도(Intensity)·레거시 키

- **getIntensity(dTotal)** → Extreme(≥85), High(≥70), Moderate(≥40), Low.  
- **ARCHETYPE_CONTENT**의 `intensityOverrides`는 Extreme/High 등에서 headline·advice를 덮어쓸 수 있게 되어 있으나, **goodReport/badReport 본문 자체는 강도별로 분리되지 않고** 아키타입당 1세트다.  
- **legacyArchetypeKey**는 TheColdArchitect → Strategic Game Architect 등 **다대일 매핑**이 있어, 서로 다른 정밀 아키타입이 같은 레거시 문단을 참조할 수 있다. 현재 assembleReport는 ARCHETYPE_CONTENT 우선이므로, **실제 사용자에게 보이는 메인 콘텐츠는 아키타입 19종과 1:1 대응**한다.

---

## 4. 정확도 요약 및 한계

### 4.1 분석 엔진

| 항목 | 정확도·상태 | 비고 |
|------|-------------|------|
| 입력→점수·아키타입 | **결정론적·재현 가능** | 단위 테스트로 검증됨. |
| 문항–구인 매핑 | **코드 상 일관됨** | 내용 타당도는 별도 검토 필요. |
| 규준(high/mid/low) | **실제 분포 미반영 가능** | NORM_CONFIG 상수 고정; normConfigFromDistribution은 권장만 제공. |
| 아키타입 경계 | **경계값 민감** | 50, 60, 75, gap 15 근처에서 1점 차이로 유형 변경. |
| 분석 정확도·검증 | **로직 명확** | 검증 4문항, 일관성 쌍 2쌍, LSI/지그재그, 응답 시간 반영. |

### 4.2 콘텐츠 제공

| 항목 | 정확도·상태 | 비고 |
|------|-------------|------|
| 아키타입→콘텐츠 | **19종 전부 1:1 매핑** | ARCHETYPE_CONTENT 키 완비. |
| 트레이트 스니펫 | **레벨(high/mid/low) 기반 선택** | 시드로 후보 중 하나 선택; 의미적 “최적” 스니펫 보장은 없음. |
| 시너지 | **1개만 노출** | 다중 시너지 시 순서 고정으로 첫 번째만 사용. |
| D-Factor | **High/Low 이분** | mid 구간 전용 문구 없음. |
| 강도(Intensity) | **headline/advice만 오버라이드** | good/bad 본문은 강도 무관 1종. |

### 4.3 종합

- **분석 엔진**: 수학·로직·테스트 관점에서 **결정론적이고 재현 가능**하다. 정확도 리스크는 (1) **규준을 실제 수검자 분포에 주기적으로 맞추지 않을 때**의 high/mid/low 해석, (2) **경계값 근처**에서의 아키타입 전환이다.
- **콘텐츠 제공**: **아키타입별 메인 리포트는 정확히 1:1로 연결**된다. 트레이트 스니펫은 “정확한 한 문장”보다 “같은 레벨 내 다양성” 설계에 가깝고, 시너지·서브팩터는 단순화된 규칙(1개 시너지, High/Low만)을 사용한다.

---

## 5. 개선 제안 (참고)

1. **규준**: `analyze_mnps_norms()`(또는 동등 분포 API) 결과를 주기적으로 반영해 NORM_CONFIG를 갱신하거나, 설정/배포 단계에서 “규준 적용” 플래그를 두고 자동 반영 옵션을 고려.
2. **아키타입 경계**: 경계 근처(예: 1등 58~62, gap 13~17)일 때 **보조 지표(예: 2·3위 특성)** 또는 “경계 구간” 안내 문구를 노출하는 방식 검토.
3. **시너지**: 2개 이상일 때 “주 시너지”를 정의(예: 1·2위 trait 조합)하고, 해당 조합에 맞는 시너지 문단을 우선 선택하도록 로직 명시.
4. **콘텐츠**: 트레이트 스니펫 선택을 “시드 기반 1개”에서 “프로파일 요약(예: 1등 trait)과 의미적으로 가장 맞는 스니펫”을 선택하는 규칙으로 보강하는 방안 검토.

— 이상으로 분석 엔진과 콘텐츠 제공의 정확도를 상세히 정리하였다.
