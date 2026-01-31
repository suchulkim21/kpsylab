# MNPS D-Total 가중치·Inter-correlation 설정

## 1. 개요

- **D-Total**: Dark Tetrad + D-Factor 문항의 가중 합산에 Inter-correlation 가산을 더한 **0~100 복합 점수**.
- **설정 위치**: `lib/mnps/darkNatureScoring.ts`의 `D_SCORE_CONFIG`.
- **문헌**: SD4(Short Dark Tetrad)는 4개 특성 각각 **동일 가중(평균)** 사용. 본 시스템의 복합 D 점수는 확장 형태.

---

## 2. D_SCORE_CONFIG 항목

| 항목 | 현재값 | 설명 | 문헌/실측 반영 시 |
|------|--------|------|-------------------|
| **traitWeights** | mach 1.0, narc 0.9, psych 1.1, sadism 1.0 | Dark Tetrad 특성별 가중치. SD4는 모두 1.0. | 표준 척도·요인 부하량·실측 회귀계수로 조정 |
| **subFactorWeights** | egoism 0.9, moralDisengagement 1.0, entitlement 1.0, spitefulness 1.1 | D-Factor 하위요인별 가중치. | darkfactor.org 등 D-Factor 문헌·실측 반영 |
| **interCorrelationCoeff** | 0.2 | trait 평균(0~100) × 이 값이 D-Total에 가산. | 0(가산 없음) 또는 실측 상관·회귀 기반 값 |
| **interCorrelationMax** | 20 | Inter-correlation 가산 상한(점). | 필요 시 상한 조정 |

---

## 3. D-Total 계산식

```
traitAvg = (mach + narc + psych + sadism) / 4   // 0~100
interCorrelationWeight = min(interCorrelationMax, max(0, traitAvg * interCorrelationCoeff))
base = (weightedSum / weightTotal) * 100
dTotal = clamp(0, 100, base + interCorrelationWeight)
```

- **base**: 문항별 (가중치 × 1~5 점수)의 합을 가중합 최대치로 나눈 뒤 0~100으로 환산.
- **interCorrelationWeight**: 4개 특성 평균이 높을수록 복합 “다크니스”에 가산(최대 20점).

---

## 4. 참고 문헌

- **Short Dark Tetrad (SD4)**: 4특성 각 7문항 평균, 동일 가중. [Buckels et al., SD4]
- **D-Factor of Personality**: 공통 D 핵심 + 하위요인(이기심, 악의성 등). [Moshagen et al., darkfactor.org]
- **타당도 검증**: 실측 데이터 확보 시 `D_SCORE_CONFIG`만 수정해 가중치·가산 공식 반영 가능.
