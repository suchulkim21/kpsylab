# 질의·응답 분석 레포트: 프로젝트 핵심 파이프라인

> **문서 성격**: MNPS 및 성장 로드맵에서 **질의(문항)** 와 **응답(사용자 선택)** 이 **분석 레포트**로 변환되는 전 과정을 정의하는 핵심 설계 문서.  
> **참조**: MNPS_TEST_OVERVIEW, MNPS_ACCURACY_95_RESEARCH, darkNatureScoring.ts, MNPS_CONTENT_STRATEGY

---

## 1. 개요

이 프로젝트의 **핵심 산출물**은 “사용자가 문항(질의)에 답한 결과(응답)”를 입력으로, **채점·해석·리포트 조립**을 거쳐 **분석 레포트**를 생성하는 파이프라인이다.  
단순 “점수 표시”가 아니라 **Good/Bad 이중 리포트, 아키타입, D요인, 시너지, 딥다이브, 분석 정확도**까지 포함한 **통합 분석 레포트**가 최종 사용자에게 전달된다.

---

## 2. 파이프라인 개요

```
[질의] 42문항 (문제 은행 126 중 슬롯당 랜덤 1문항)
    +
[응답] 문항별 1~5 Likert (역문항은 6−점수로 역코딩)
    ↓
[채점] scoreDarkNature(answers, options)
    → traitScores, subFactorScores, dTotal, rawDTotal, validationScore,
      consistencySpread, analysisAccuracy, archetype, ...
    ↓
[해석] buildInterpretation(result)
    → good: { title, summary, highlights }, bad: { title, summary, highlights, risks }
    ↓
[리포트 조립] assembleReport(result, isPaid)
    → goodReport(마크다운), badReport/badTeaser(유료 시 전체/일부),
      radarChartData, 아키타입·시너지·딥다이브·D요인·Final Ruin 블록
    ↓
[최종 산출물] 분석 레포트 (API/결과 페이지에 저장·표시)
```

---

## 3. 입력 정의

### 3.1 질의(문항)

| 항목 | 설명 |
|------|------|
| **출처** | `app/mnps/test/questions.ts`: 문제 은행 126문항(42슬롯×3변형) |
| **선택 방식** | `getRandomQuestionSet()`: 슬롯당 1문항 랜덤 → 42문항, order 순 정렬 |
| **구조** | 각 문항: `id`, `text`, `category`, `trait?`, `subFactor?`, `order`, `isReverse?` |
| **카테고리** | darkTetrad, dFactor, scenario, validation |
| **검증 문항** | v1, v3, v4, v7 (baseId 기준; v1_v2 등 변형 포함) |

### 3.2 응답(사용자 선택)

| 항목 | 설명 |
|------|------|
| **형식** | `{ questionId: string, score: number }[]`, score 1~5 (원점수) |
| **역코딩** | 검증 문항 v3, v7: 채점/해석 시 `6 - score` 적용. 전달 시에는 원점수 유지 |
| **검증 점수 전달** | API/클라이언트에서 baseId(v1,v3,v4,v7)로 정규화해 `validationScores` 객체로 전달 |

---

## 4. 채점 엔진 (scoreDarkNature)

### 4.1 입력

- **answers**: `DarkAnswer[]` — `questionId`, `trait?`, `subFactor?`, `value`(1~5, 역문 반영 후)
- **options**: `validationScores`, `responseTimeMs`, `questionCount`, `patternAnalysisValues`

### 4.2 핵심 산출물

| 출력 | 설명 | 범위/비고 |
|------|------|------------|
| **traitScores** | 4개 Dark Tetrad 특성 점수 | 0~100 (Likert 1~5 → (x−1)/4×100) |
| **subFactorScores** | D-Factor 4개 하위요인 | 0~100 |
| **dTotal** | 표출용 종합 D점수 | 0~100 (비선형 매핑) |
| **rawDTotal** | 가중합+Inter-correlation, 천장 없음 | 0 이상 |
| **validationScore** | 검증 4문항 가중 평균 후 비선형 매핑 | 0~100 |
| **consistencySpread** | 4개 trait max−min (평탄 응답 감지) | 0~100 |
| **analysisAccuracy** | 응답 신뢰도 지표 | 50~99 |
| **archetype** | 다이내믹 아키타입 ID | MnpsArchetypeId |

### 4.3 주요 공식

- **Trait/SubFactor 점수**: 문항별 `value`의 평균(가중치 반영) → `normalizeLikert(avg)` = (clamped−1)/4×100.
- **D-Total (raw)**:  
  `weightedSum/weightTotal * 100 + interCorrelationWeight`  
  (interCorrelationWeight = min(20, trait평균×0.2)).
- **표출용 dTotal**: raw ≤ 90이면 선형, 90 초과분은 tanh로 압축해 100에 수렴.
- **검증 점수**: v1,v3,v4,v7 **가중** 평균(역문 6−점수) 후 비선형 매핑. 가중치: v1(정직)·v3(역문)·v4(실제반영) 1.2, v7 1.0 — 정직·역문 강조로 질의·응답만 95% 기여(MNPS_ACCURACY_95_RESEARCH §3.5).
- **분석 정확도**:  
  `80 + validationBonus(0~20) − consistencyPenalty(검증 높을수록 완화) + internalConsistencyBonus(0~5) + pairConsistencyBonus(−5~+5) − 시간/패턴 패널티`  
  → 50~99 클램프.

---

## 5. 해석 단계 (buildInterpretation)

- **입력**: `DarkNatureResult` (채점 결과 전체).
- **출력**: `DarkNatureInterpretation`  
  - **good**: 전략적 잠재력 관점 요약·하이라이트.  
  - **bad**: 임상/원시 관점 요약·하이라이트·리스크.
- **로직**: NORM_CONFIG 임계값(highCutoff, midCutoff, dTotalHigh 등)으로 veryHigh/high/medium/low 구간 판별 후, trait·subFactor별 문구 선택.

---

## 6. 리포트 조립 (assembleReport)

- **입력**: `DarkNatureResult`, `isPaid`(유료 여부).
- **출력**: `AssembledReport` — goodReport(마크다운), badReport/badTeaser, radarChartData, 아키타입·시너지·딥다이브·D요인·Final Ruin 등 블록.
- **로직**:  
  - 아키타입: `result.archetype` 또는 `getProfileMatrix()`로 표시명 결정.  
  - contentLibrary·ARCHETYPE_CONTENT에서 스니펫 선택(trait level, 시너지 키, subFactor 고점 여부 반영).  
  - isPaid false 시 Bad는 티저만, true 시 전체 Bad 리포트 포함.

---

## 7. 최종 산출물 (분석 레포트)

| 구성 요소 | 저장/표시 위치 |
|----------|----------------|
| Good 리포트 | results_metadata.good_report_json, 결과 페이지 |
| Bad 리포트(전체/티저) | results_metadata.bad_report_json, 유료 시 전체 공개 |
| 레이더 차트 | results_metadata.radar_chart_data |
| 아키타입·시너지·딥다이브·D요인·Final Ruin | goodReport/badReport 마크다운 내 블록 |
| 분석 정확도·응답 시간 경고·불성실 패턴 | result_snapshot, 결과 페이지 안내 문구 |

---

## 8. 질의·응답만으로 정확도 반영 (제약)

- **인위적 상한 금지**: `Math.max(95, ...)` 등으로 강제로 95%를 만들지 않음.
- **검증 보너스**: 정직·일관·역문·실제반영 검증 문항 점수가 높을수록 analysisAccuracy 상승.
- **일관성 패널티 완화**: 검증 점수가 높을 때 consistencySpread 패널티를 `(1 − validationScore/100)` 비율로 감소.
- **일관성 쌍·trait 내부 일관성**: 동의어 쌍(n1/n1b, m1/m1b) 차이, trait 내 SD 구간으로 보너스/패널티.

이를 통해 **“질의·응답만”**으로 정직·일관 응답자는 95% 근접, 방어/조작 응답자는 낮은 정확도가 유지된다.

---

## 9. 관련 파일

| 역할 | 파일 |
|------|------|
| 문항·문제 은행·랜덤 출제 | `app/mnps/test/questions.ts` |
| 채점·해석·리포트 조립 | `lib/mnps/darkNatureScoring.ts` |
| 규준·아키타입 매트릭스 | `lib/mnps/dynamicProfileMatrix.ts` |
| 콘텐츠 스니펫·아키타입 문구 | `lib/mnps/contentLibrary.ts`, `lib/mnps/archetypeContent.ts` |
| 완료 API(채점·저장) | `app/api/mnps/complete/route.ts` |

---

*이 문서는 “질의(문항) + 응답(선택)”이 “분석 레포트”가 되기까지의 핵심 파이프라인과 입출력·공식을 정의하며, 분석 엔진 최적화 시 기준 문서로 사용한다.*
