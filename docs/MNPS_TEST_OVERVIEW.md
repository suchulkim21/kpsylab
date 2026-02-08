# MNPS(Dark Nature Test) 개발 개요 문서

본 문서는 현재까지 개발된 **MNPS(MNPS: Dark Nature Test)** 테스트의 구조, 채점 체계, 리포트, API, UI를 한국어로 정리한 기술 문서입니다.

---

## 1. 개요 및 목적

### 1.1 MNPS란

- **Dark Tetrad**(마키아벨리즘, 나르시시즘, 사이코패시, 사디즘)와 **D-Factor**(이기주의, 권리 의식, 도덕적 이탈, 악의성)를 측정하는 **자기보고식 심리 검사**입니다.
- 1~5점 리커트 척도, **42문항**으로 구성되며, 응답 품질(정직성·일관성)을 반영한 **분석 정확도**와 **이중 리포트(Good/Bad)**를 제공합니다.
- 문헌: Short Dark Tetrad(SD4), D-Factor of Personality(darkfactor.org) 등을 참고하여 설계되었으며, 복합 D 점수·아키타입·시너지 해석은 자체 규칙 기반으로 확장되어 있습니다.

### 1.2 제공 기능

| 기능 | 설명 |
|------|------|
| **42문항 테스트** | Dark Tetrad·D-Factor·검증·시나리오·일관성 쌍 문항 포함 |
| **4개 특성 점수** | 마키아벨리즘, 나르시시즘, 사이코패시, 사디즘 (0~100) |
| **D-Total** | 가중 합산 + Inter-correlation 가산으로 산출한 종합 D 점수 (0~100) |
| **분석 정확도** | 검증·일관성·쌍 문항 기반 50~99% (실제 신뢰도 반영) |
| **Good 리포트** | 무료 공개, 긍정 해석(엘리트 관점) |
| **Bad 리포트** | 유료(또는 잠금 해제 후), 어두운 이면·최종 리스크 시나리오 |
| **아키타입·시너지** | 상위 2개 특성 조합에 따른 프로파일 및 시너지 해석 |

---

## 2. 문항 구성 (42문항)

### 2.1 카테고리별 구성

| 카테고리 | 문항 수 | 설명 |
|----------|---------|------|
| **Dark Tetrad (핵심)** | 18문항 | 나르시시즘 5문항(n1~n4, n1b), 마키아벨리즘 5문항(m1~m4, m1b), 사이코패시 4문항(p1~p4), 사디즘 4문항(s1~s3 + 시나리오 등) |
| **D-Factor (확장)** | 12문항 | 이기주의 3문항(e1~e3), 권리 의식 3문항(en1~en3), 도덕적 이탈 3문항(md1~md3), 악의성 3문항(sp1~sp3) |
| **Validation (검증)** | 8문항 | v1~v8. 정직·일관성·사회적 바람직성(역문)·실제반영. 채점 합산에는 넣지 않고 **분석 정확도·방어적 응답 판정**에만 사용 |
| **Scenario (심화)** | 4문항 | sc1~sc4. 상황별 선택, trait/subFactor 매핑으로 채점에 반영 |

- **일관성 쌍**: n1/n1b(나르시시즘), m1/m1b(마키아벨리즘). 같은 구인을 다른 표현으로 묻는 문항 쌍이며, 쌍별 답 차이로 **분석 정확도**에 보너스/패널티를 반영합니다.

### 2.2 응답 척도

- **MNPS_OPTIONS**: 1=전혀 아니다, 2=아니다, 3=보통이다, 4=그렇다, 5=매우 그렇다.
- **역문항**: v3, v7 등 사회적 바람직성 문항은 6−점수로 역코딩 후 사용합니다.

### 2.3 주요 파일

- **문항 정의**: `app/mnps/test/questions.ts`  
  - `DARK_NATURE_QUESTIONS`, `MNPS_QUESTIONS`(order 정렬), `VALIDATION_QUESTION_IDS`, `CONSISTENCY_PAIR_IDS`

---

## 3. 채점 체계

### 3.1 채점 대상

- **trait** 또는 **subFactor**가 있는 문항만 D 점수·trait/subFactor 점수에 기여합니다.
- 검증 문항(v1~v8)은 **채점 합산에 포함되지 않고**, 검증 점수(validationScore)·분석 정확도(analysisAccuracy)·방어/일관성 경고에만 사용됩니다.

### 3.2 특성 점수 (traitScores, subFactorScores)

- **traitScores**: 4개 Dark Tetrad 특성별 해당 문항의 1~5 평균을 **(1→0, 5→100)** 선형 변환한 값 (0~100).
- **subFactorScores**: 4개 D-Factor 하위요인별 동일 방식으로 0~100 산출.
- 문항에 trait와 subFactor가 모두 있으면, 해당 문항은 두 점수 계산에 모두 반영됩니다.

### 3.3 D-Total (종합 D 점수)

- **공식** (설정: `lib/mnps/darkNatureScoring.ts`의 `D_SCORE_CONFIG`):
  - **base** = (문항별 가중치 × 1~5 점수)의 합 ÷ 가중합 최대치 × 100.
  - **traitAvg** = (mach + narc + psych + sadism) / 4 (0~100).
  - **interCorrelationWeight** = min(interCorrelationMax, traitAvg × interCorrelationCoeff).
  - **rawDTotal** = base + interCorrelationWeight (**100 초과 가능**, 천장 효과 제거).
  - **isExtremeTop** = (rawDTotal > 100). 상위 극단 구간 플래그.
  - **dTotal** = 표출용 0~100. **비선형 매핑** `mapRawDTotalToDisplay(rawDTotal)`: 0~90은 선형, 90 초과는 sigmoid 유사 곡선으로 90~100 구간 변별력 확보.
- **가중치**:  
  - Dark Tetrad: mach 1.0, narc 0.9, psych 1.1, sadism 1.0.  
  - D-Factor: egoism 0.9, moralDisengagement 1.0, entitlement 1.0, spitefulness 1.1.  
- **Inter-correlation**: 4개 특성 평균이 높을수록 D-Total에 최대 20점까지 가산됩니다. (계수·상한은 `D_SCORE_CONFIG`에서 변경 가능.)

### 3.4 분석 정확도 (analysisAccuracy, 50~99%)

- **목적**: 응답의 신뢰도(정직성·일관성)를 반영한 지표. 강제 상한 없이, 질의·응답만으로 산출합니다.
- **구성**:
  - **기본점** 80.
  - **검증 보너스**: v1~v8 가중 평균(정직·역문 강조)을 0~100으로 정규화한 뒤 최대 +20.
  - **일관성 패널티**: 4개 trait 점수 범위(spread) &lt; 20이면 “평탄 응답”으로 간주해 최대 −20. 단, 검증 점수가 높을 때는 패널티를 완화(× (1 − validationScore/100)).
  - **Trait 내부 일관성 보너스**: trait별 4문항 점수 표준편차(SD)가 0.3~1.2 구간이면 최대 +5.
  - **일관성 쌍 보너스/패널티**: n1/n1b, m1/m1b 쌍별 |답1−답2| 평균에 따라 +5 ~ −5.
  - **응답 시간 페널티**: 문항당 0.8초 미만으로 완료 시 **−30점** (물리적으로 읽기 어려운 속도로 간주). `responseTimePenalty` 플래그로 저장·표시.
  - **불성실 응답 패턴 패널티**: **Longstring Index(LSI)** — 동일 응답이 연속 6회 이상이면 "기둥 세우기(3번만 찍기)" 의심. **Alternating Pattern** — 연속 쌍 중 극단값(1-5, 5-1) 비율이 28% 이상이면 "지그재그 찍기" 의심. 감지 시 **−10점** 및 `insincereResponsePattern` 플래그. 리포트·결과 페이지에 "불성실 응답 의심" 태그 표시.
- **최종**: 50~99 범위로 클램프하여 표시합니다. 결과 페이지에서는 90% 이상·75~89%·75% 미만에 따라 색상(녹색·노랑·빨강)으로 구분합니다.

### 3.5 검증 점수 (validationScore) 및 일관성 지표

- **validationScore**: v1~v8의 가중 평균(역문 v3, v7 역코딩)을 0~100으로 정규화한 값. 높을수록 “정직·일관하게 답했다”는 자기보고에 가깝습니다.
- **consistencySpread**: 4개 trait 점수의 (최대 − 최소). 낮을수록 “전부 비슷하게 답함” 또는 방어적 응답 가능성으로 해석하며, 리포트의 “응답 신뢰도 참고” 블록에서 사용합니다.
- **insincereResponsePattern**: LSI 또는 Alternating 패턴 감지 시 true. Good/Bad 리포트와 결과 페이지에 "불성실 응답 의심" 문구가 노출됩니다. complete API는 문항 표시 순서(question_order)대로 patternAnalysisValues를 넘겨 패턴 분석을 수행합니다.

---

## 4. 설정 (Config)

### 4.1 NORM_CONFIG (규준·임계값)

- **위치**: `lib/mnps/darkNatureScoring.ts`
- **역할**: high/mid/low 구간, 아키타입·SubFactor·D-Total 강도 구간의 임계값.
- **주요 항목**:
  - **highCutoff**: 75 (high 구간 하한)
  - **midCutoff**: 45 (mid 구간 하한)
  - **archetypeHighCutoff**: 70 (아키타입 단일 최고 trait 판정)
  - **subFactorHighCutoff**: 70 (도덕적 이탈·악의성 “높음” 판정)
  - **dTotalCritical**: 85, **dTotalHigh**: 70 (최종 시나리오 강도: critical/high/moderate)
- 규준 데이터(평균·표준편차·백분위) 확보 시 이 값들만 수정하면 전체 해석 구간이 일관되게 바뀌도록 되어 있습니다.

### 4.2 D_SCORE_CONFIG (D-Total 가중치·Inter-correlation)

- **위치**: `lib/mnps/darkNatureScoring.ts`
- **역할**: trait/subFactor 가중치, Inter-correlation 계수·상한.
- **주요 항목**:
  - **traitWeights**, **subFactorWeights**: 위 §3.3 참조.
  - **interCorrelationCoeff**: 0.2 (trait 평균 × 이 값이 D-Total에 가산).
  - **interCorrelationMax**: 20 (가산 상한).
- 상세: `docs/MNPS_D_SCORE_CONFIG.md` 참고.

---

## 5. 리포트 (Good / Bad)

### 5.1 리포트 생성

- **함수**: `assembleReport(result, isPaid)` (`lib/mnps/darkNatureScoring.ts`).
- **입력**: `DarkNatureResult`(traitScores, subFactorScores, dTotal, validationScore, consistencySpread, analysisAccuracy 등), **isPaid**(유료 여부).
- **출력**: totalDScore, archetype, goodReport, badTeaser, fullBadReport( isPaid일 때만 의미 있음 ).

### 5.2 Good 리포트 (무료)

- **아키타입 소개** (contentLibrary의 archetypeIntros).
- **4개 특성별 스니펫** (high/mid/low 구간, NORM_CONFIG 사용). SubFactor(도덕적 이탈·악의성)가 높을 때 추가 문장과 스니펫 인덱스 변동.
- **시너지 Good 텍스트** (상위 2개 특성 조합에 따른 synergyCombinations).
- **SubFactor 강조**: 도덕적 이탈·악의성 높을 때 긍정 해석 문장 추가.
- **전체 프로파일 요약** (totalDScore 구간별).

### 5.3 Bad 리포트 (유료/잠금 해제)

- **Bad 티저**: 항상 노출 (첫 번째 시너지 Bad 또는 아키타입 Bad 소개).
- **fullBadReport** (isPaid 또는 잠금 해제 시):
  - 아키타입 Bad 소개
  - 4개 특성 Bad 스니펫
  - **SubFactor 강조** (도덕적 이탈·악의성 높을 때 경고 문장)
  - **응답 신뢰도 참고**: 구간별(심각/중등/경미) 방어·일관성 경고
  - 시너지 Bad 텍스트
  - **최종 리스크 시나리오** (강도: critical/high/moderate). **Critical** 시 테마별 시나리오 1종 노출: Corporate Purge(조직적 숙청), Gaslight Backfire(통제의 역습), Dopamine Burnout(쾌락의 종말) + 생존 전략. 리포트 내 섹션 제목은 한글 "최종 리스크 시나리오".
  - **D-Factor 해석**: 4대 하위 요인 **한글 표기**(이기주의, 권리의식, 도덕적 이탈, 악의성) 및 **높음/낮음**별 Bad 관점 2문장. `contentLibrary.dFactorInterpretations` + `D_FACTOR_DISPLAY_KO`.
  - **최종 리스크 시나리오** 섹션 제목은 한글 "최종 리스크 시나리오"로 표시. Critical 시 테마별 시나리오 1종 + 생존 전략.
  - 법적·임상적 진단이 아님을 밝히는 안내 문구

### 5.4 아키타입 (Dynamic Profile Matrix)

- **19종 세분화 시스템**: Pure Types(4종), Hybrid Types(12종), Special Types(3종)
- **결정 로직**:
  1. `DARK_APEX`: 모든 특성 ≥ 75
  2. `ALL_LOW`: 최고점 < 50
  3. `{TRAIT}_PURE`: gap ≥ 15 AND 최고점 ≥ 60
  4. `HYBRID_MID`: 최고점 < 60
  5. `{PRIMARY}_{SECONDARY}`: 지배 + 보조 조합
- **콘텐츠**: 각 아키타입은 headline, highlights(핵심 특징 3~5개), goodReport, badReport, advice 포함
- **상세**: `docs/MNPS_ARCHETYPE_SYSTEM.md` 참고

### 5.5 스니펫 선택 다양화

- trait 레벨(high/mid/low) + **시너지 시드** + **trait별 시드** + **SubFactor 보정**으로 contentLibrary에서 선택하는 스니펫 인덱스를 변동하여, 프로필·시너지별로 문장이 다르게 나오도록 되어 있습니다.

---

## 6. API 및 데이터 흐름

### 6.1 API 라우트

| 경로 | 메서드 | 역할 |
|------|--------|------|
| `/api/mnps/assessments` | POST | 테스트 세션(assessment) 생성. body: userId(선택), sessionId(비로그인 식별). DB 미설정 시 503. |
| `/api/mnps/responses` | POST | 문항별 응답(assessment_id, question_id, score) 저장. |
| `/api/mnps/complete` | POST | **서버 주도 채점**: body는 assessmentId, responses(문항 ID·선택지만), startedAt(ISO). 서버에서 scoreDarkNature 실행 후 결과 전체 저장. **멱등성**: 이미 COMPLETED인 assessment면 재채점 없이 저장된 결과만 반환(idempotent: true). 클라이언트는 네트워크/5xx 시 재시도(최대 3회, 지수 백오프). |
| `/api/mnps/results` | GET | assessmentId로 결과 조회. 서버 저장 데이터만 반환(dTotal, rawDTotal, isExtremeTop, traitScores, subFactorScores, analysisAccuracy, responseTimePenalty, insincereResponsePattern, **percentileAtCreation**(검사 시점 백분위), goodReport, badReport(결제 시), radarChartData, isPaid). |

### 6.2 테스트 진행 흐름

1. **테스트 시작**: `/api/mnps/assessments` POST(body: userId, sessionId) → assessmentId 확보(실패 시 null, sessionStorage만 사용).
2. **문항 응답**: 선택 시 `/api/mnps/responses` POST로 저장(assessmentId 있을 때).
3. **마지막 문항 제출**: `/api/mnps/complete` POST에 **assessmentId, responses(문항 ID·점수만), startedAt(ISO)** 전송. 클라이언트는 채점 결과를 보내지 않음.
4. **채점**: 서버에서 questions 테이블로 trait/subFactor 매핑 → `scoreDarkNature(darkAnswers, { validationScores, responseTimeMs, questionCount, patternAnalysisValues })` 호출 → 결과·radarChartData·result_snapshot 저장. **실시간 백분위**: RPC `get_d_score_percentile(score)` 호출 후 `results_metadata.percentile_at_creation` 저장(assessments: total_d_score, raw_d_total, is_extreme_top / results_metadata: result_snapshot, percentile_at_creation).
5. **결과 페이지**: `/mnps/result?assessmentId=...` 로 이동. **assessmentId가 있으면 반드시 GET `/api/mnps/results`만 사용**(서버 저장 데이터). assessmentId 없을 때만 sessionStorage fallback. `assembleReport(result, isPaid)` 로 Good/Bad 리포트 생성·표시.
6. **제출 회복성**: complete 호출 실패 시(네트워크 끊김·5xx) 클라이언트가 **fetchWithRetry**로 최대 3회 재시도(1s, 2s, 4s 지수 백오프). 동일 assessmentId로 여러 번 제출되어도 이미 완료된 건이면 API가 **멱등 응답**(저장된 결과만 반환)하여 "처음부터 다시 하세요" 상황을 방지합니다.

### 6.3 DB 미사용 시

- Supabase 미설정 또는 503 응답 시: assessment 생성·응답·완료 API는 실패하지만, 클라이언트는 **sessionStorage**에 결과를 저장하고 결과 페이지에서 이를 읽어 표시합니다. 이 경우 isPaid는 false로 간주됩니다.

---

## 7. UI 구조

### 7.1 테스트 페이지 (`/mnps/test`)

- **파일**: `app/mnps/test/page.tsx`, `app/mnps/test/InterstitialView.tsx`, `app/mnps/test/questions.ts`
- **3단계 분할 진행(Phased Assessment)**:
  - **Phase 1**: Q1~Q14 (index 0~13)
  - **Phase 2**: Q15~Q28 (index 14~27)
  - **Phase 3**: Q29~Q42 (index 28~41)
- **중간 휴식 화면(Interstitial)**: Q14·Q28 답변 직후 다음 문항으로 넘어가지 않고 **중간 분석 화면**을 표시. "데이터 분석 중..." 로딩 애니메이션(약 1.8초) 후, 현재 진행 상황·흥미 유발 멘트·다음 단계 시작 버튼 노출. Phase 1 종료 후 3종·Phase 2 종료 후 3종 **메시지 변형**을 랜덤 선택하여 표시(subtitle, message, insights 3개, buttonLabel).
- **진행 표시**: 상단 진행 바는 전체 42문항 기준 비율 유지. 라벨은 **Step 1/3**, **Step 2/3**, **Step 3/3** 형태로 단계별 성취감 제공. 단계별 안내 문구(1단계: 기본 성향 파악, 2단계: 심층 패턴 분석, 3단계: 마지막 확인).
- **상태**: `viewMode`(question | interstitial), `interstitialPhase`(1 | 2), `currentPhase`(1~3)로 문항 뷰와 휴식 뷰 전환. Framer Motion으로 화면 전환 애니메이션 적용.
- **동작**: 42문항을 order 순으로 1문항씩 표시, 1~5 선택 시 다음 문항으로 이동(Phase 경계에서는 Interstitial 표시 후 버튼 클릭 시 다음 Phase 첫 문항으로 이동). 진행률·카테고리·Step 라벨 표시.
- **완료 시**: assessmentId가 있으면 `/api/mnps/complete`에 responses·startedAt 전송 후 `/mnps/result?assessmentId=...` 로 이동(클라이언트는 결과 객체를 sessionStorage에 저장하지 않음). 없으면 sessionStorage에 미리보기용 저장 후 `/mnps/result` 로 이동.
- **채점**: 클라이언트의 `scoreDarkNature` 호출은 **UI 미리보기용**이며, 최종 결과는 서버에서 산출·저장한 데이터를 results API로만 표시합니다.

### 7.2 결과 페이지 (`/mnps/result`)

- **파일**: `app/mnps/result/page.tsx`, `app/mnps/result/MnpsResultClient.tsx`, `app/mnps/result/DisclaimerBanner.tsx`
- **표시 내용**:
  - **종합 D 점수** (0~100), **극단** 태그(rawDTotal > 100 시, 한글 "(극단)"), **아키타입**, **분석 정확도**(색상 구간: 90% 이상 녹색, 75~89% 노랑, 75% 미만 빨강). 응답 시간 페널티 시 안내 문구 표시.
  - **엘리트 뷰**(Good 리포트)·**어두운 이면**(Bad 리포트) 섹션 제목 한글 표기.
  - **실시간 백분위 배지**: `percentile_at_creation`이 있으면 "당신은 N%의 위험군입니다"(N = 100 − 백분위, 소수 1자리). **상위 10% 이내**는 붉은색 경고 스타일, **하위 50%**는 안전(녹색) 스타일, 그 외는 중간(노랑) 스타일.
  - **다크 테트라드 프로필** 레이더 차트 (마키아벨리즘, 나르시시즘, 사이코패시, 사디즘).
  - **긍정 해석(엘리트 관점)**: Good 리포트 전문.
  - **어두운 이면(가공 없는 분석)**: Bad 티저 + 유료 시 fullBadReport. 결제 전에는 블러·CTA(최종 리스크 시나리오 열기) 표시.
- **결과 로드**: **assessmentId가 있으면 `/api/mnps/results`만 사용**(서버 저장 데이터). assessmentId 없거나 API 미사용 경로일 때만 sessionStorage의 `darkNatureResult` 사용. 결과가 없으면 `/mnps/test`로 리다이렉트.
- **DisclaimerBanner**: 결과 하단에 면책 조항(의학적·임상적 진단 아님, 오락·자기 성찰 목적) 및 이용약관·개인정보처리방침 링크 노출.

### 7.3 이용약관·개인정보 처리방침 (`/mnps/terms`, `/mnps/privacy`)

- **파일**: `app/mnps/terms/page.tsx`, `app/mnps/privacy/page.tsx`, `app/mnps/components/LegalPageShell.tsx`
- **디자인**: MNPS 다크 모드 유지(검정·회색 텍스트, 포인트 컬러). 상단 "MNPS로 돌아가기" 링크, `LegalPageShell`·`LegalSection`·`LegalSectionTitle`로 여백·타이포그래피 통일.
- **이용약관** 주요 내용:
  - **베타 서비스 안내**: 현재 베타 테스트 중, 기능·정책·약관·개인정보처리방침이 예고 없이 변경될 수 있음.
  - **면책 조항**: 본 테스트 결과는 심리학적 이론 기반이나 **의학적/임상적 진단을 대체할 수 없음**. 결과는 **자기 성찰·오락 목적**만, 심각한 심리 문제 의심 시 전문가 상담 권고.
  - **저작권**: 콘텐츠·로고 무단 복제·배포·전송·수정·2차 저작물 금지.
- **개인정보 처리방침** 주요 내용:
  - **수집 항목**: 테스트 응답, 산출 점수, 접속 로그. **회원가입·이메일·실명·전화번호 등 식별 정보는 수집하지 않음** 강조.
  - **수집 목적**: 서비스 제공·결과 분석, 통계·규준 연구, 알고리즘 정확도 개선(익명화·집계 후).
  - **보관 기간**: 법률 자문 후 구체화 예정. 기본적으로 브라우저 캐시·세션 삭제 또는 삭제 요청 시 파기·비공개 처리 방향.
  - **면책 조항**: 이용약관과 동일 문구 요약 + 이용약관 참고 안내.

---

## 8. 파일 구조 요약

```
apps/portal/
├── app/
│   ├── mnps/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── components/
│   │   │   └── LegalPageShell.tsx   # 이용약관·개인정보처리방침 공통 레이아웃 (LegalSection, LegalSectionTitle)
│   │   ├── terms/
│   │   │   └── page.tsx             # 이용약관 (베타 안내, 면책, 저작권)
│   │   ├── privacy/
│   │   │   └── page.tsx             # 개인정보 처리방침 (수집·목적·보관·면책)
│   │   ├── test/
│   │   │   ├── page.tsx             # 테스트 진행 UI (3단계 분할, Step 1/3, Interstitial 연동)
│   │   │   ├── InterstitialView.tsx # 중간 휴식 화면 (Phase 1/2 종료 후, 로딩+메시지 변형 3종×2)
│   │   │   └── questions.ts         # 42문항 정의, VALIDATION_QUESTION_IDS, CONSISTENCY_PAIR_IDS
│   │   └── result/
│   │       ├── page.tsx            # 결과 페이지 (generateMetadata, OG)
│   │       ├── MnpsResultClient.tsx # 결과 클라이언트 (레이더, Good/Bad, CTA)
│   │       └── DisclaimerBanner.tsx # 면책 + 이용약관·개인정보 링크
│   ├── api/
│   │   ├── og/route.tsx            # 동적 OG 이미지 (@vercel/og)
│   │   └── mnps/
│   │       ├── assessments/route.ts  # POST: 세션 생성
│   │       ├── responses/route.ts    # POST: 응답 저장
│   │       ├── complete/route.ts     # POST: 완료·채점·결과 저장
│   │       ├── results/route.ts      # GET: 결과 조회
│   │       └── payment/
│   │           ├── create-checkout/route.ts  # Stripe Checkout 세션 생성
│   │           └── complete/route.ts         # 결제 검증 후 is_paid 갱신
│   └── ...
├── lib/
│   ├── mnps/
│   │   ├── darkNatureScoring.ts  # scoreDarkNature, assembleReport, NORM_CONFIG, D_SCORE_CONFIG; D-Factor/최종 시나리오 한글 표기
│   │   ├── contentLibrary.ts    # trait 스니펫, 시너지, 아키타입 소개·딥다이브, D_FACTOR_DISPLAY_KO, finalRuinScenarios
│   │   ├── archetypeContent.ts  # ARCHETYPE_CONTENT(19종), PUPPET_MASTER_CONTENT, ARCHETYPE_DETAILED_CONTENT.puppetMaster
│   │   ├── dynamicProfileMatrix.ts  # determineArchetype, getIntensity, MnpsArchetypeId
│   │   └── normConfigFromDistribution.ts  # 규준 분포 기반 권장 NORM_CONFIG
│   └── db/
│       └── migrations/
│           ├── 003_mnps_schema_and_rls.sql   # (단일) 스키마 확장 + RLS. Service Role로 results 쓰기.
│           ├── 003_mnps_result_fields_and_session.sql
│           ├── 004_mnps_rls_policies.sql
│           ├── 005_calculate_percentile.sql  # get_d_score_percentile, percentile_at_creation
│           ├── 006_mnps_norm_distribution.sql # get_mnps_norm_distribution
│           └── 007_analyze_mnps_norms.sql    # analyze_mnps_norms
└── docs/
    ├── MNPS_TEST_OVERVIEW.md     # 본 문서
    ├── MNPS_ALGORITHM_IMPROVEMENTS.md
    ├── MNPS_D_SCORE_CONFIG.md
    ├── MNPS_ACCURACY_95_RESEARCH.md
    └── MNPS_ACCURACY_ANALYSIS.md
```

---

## 9. 고도화: 보안 및 로직 정교화

다음 4가지 변경이 적용되어 있습니다.

### 9.1 서버 주도 채점 (Server-Authoritative)

- **목적**: 클라이언트가 계산한 결과를 API로 보내는 것을 차단하고, 최종 결과는 서버만 산출·저장·제공합니다.
- **동작**:
  - `/api/mnps/complete`는 클라이언트로부터 **assessmentId, responses(문항 ID·선택지), startedAt(ISO)** 만 받습니다.
  - 서버 내부에서 `scoreDarkNature`를 실행해 결과를 산출하고, **Service Role**(`supabaseAdmin`)로 responses·assessments·results_metadata에 저장(RLS 우회). Service Role 미설정 시 anon 클라이언트로 fallback.
  - 응답에 **redirectUrl** (`/mnps/result?assessmentId=...`) 포함. 클라이언트는 결과 데이터 없이 리다이렉트 URL만 사용 가능.
  - 클라이언트의 `scoreDarkNature` 호출은 **UI 미리보기용**이며, 결과 페이지는 **assessmentId가 있을 때 반드시 GET `/api/mnps/results`로 서버 저장 데이터(result_snapshot 등)만** 표시합니다. assessmentId 없을 때만 sessionStorage fallback(미리보기/오프라인).
- **관련 파일**: `app/api/mnps/complete/route.ts`, `app/api/mnps/results/route.ts`, `lib/db/supabase.ts`(supabaseAdmin), `app/mnps/result/page.tsx`, `app/mnps/test/page.tsx`.

### 9.2 D-Total 천장 효과(Ceiling Effect) 개선

- **목적**: 단순 합산 후 100점 clamp로 인해 고득점 구간(High Risk) 변별력이 사라지는 문제를 완화합니다.
- **로직** (`lib/mnps/darkNatureScoring.ts`):
  - **Raw D-Score**: `rawDTotal = base + interCorrelationWeight`로 계산하며 **100점을 초과할 수 있음**.
  - **표출용 dTotal**: `mapRawDTotalToDisplay(rawDTotal)` — 0~90은 선형, 90 초과는 sigmoid 유사 곡선으로 90~100 구간을 세밀하게 나눔.
  - **isExtremeTop**: `rawDTotal > 100`일 때 true. 결과 페이지에서 "Extreme" 태그로 표시.
- **DB**: assessments에 `raw_d_total`(NUMERIC), `is_extreme_top`, `session_id`(UUID) 저장. results_metadata에 `result_snapshot`(JSONB) 및 `response_time_penalty`(BOOLEAN) 저장.

### 9.3 Supabase RLS 정책

- **목적**: assessments, responses, results_metadata에 대한 행 단위 접근 제어.
- **정책** (단일 파일 `lib/db/migrations/003_mnps_schema_and_rls.sql` 또는 분리: 003 + `004_mnps_rls_policies.sql`):
  - **assessments**
    - (1) 로그인: `"Users can view own assessments"` (FOR SELECT), `"Users can update own assessments"` (FOR UPDATE). auth.uid() = user_id.
    - (2) 비로그인: `"Anonymous access via session_id"` (FOR SELECT만). `session_id::text = current_setting('app.session_id', true)` — API에서 조회 전 `SET app.session_id = '...'` 호출 필요. UPDATE는 Service Role만(비로그인은 조회만).
    - (3) `"Anyone can create assessment"` (FOR INSERT WITH CHECK (true)).
  - **responses**: `"Access responses via assessment ownership"` (FOR ALL). EXISTS 서브쿼리로 assessment 소유(user_id = auth.uid() OR session_id = app.session_id) 확인.
  - **results_metadata**: `"Read own results metadata"` (FOR SELECT만). 동일 소유 조건. INSERT/UPDATE/DELETE 정책 없음 → **쓰기는 Service Role만** 가능(의도된 보안 설계).
- **session_id**: assessments의 `session_id`는 UUID. 생성 시 body의 `sessionId`(문자열) 저장. 테스트 페이지에서 `crypto.randomUUID()` 또는 fallback으로 생성해 전달. 보안 수준을 높일 때는 JWT claim 사용 권장.

### 9.4 응답 시간(Time-based) 검증

- **목적**: 문항당 0.8초 미만으로 완료된 경우, 물리적으로 읽기 어려운 속도로 간주해 분석 정확도에 페널티를 부여합니다.
- **로직** (`lib/mnps/darkNatureScoring.ts`):
  - `scoreDarkNature(answers, { responseTimeMs?, questionCount? })` 옵션 추가.
  - `(responseTimeMs / questionCount) < 800`이면 **analysisAccuracy에 −30점** 적용(최종 50~99 클램프 전). `responseTimePenalty` 플래그 저장.
- **API**: `/api/mnps/complete`에서 body의 `startedAt`(ISO)으로 `responseTimeMs = Date.now() - new Date(startedAt).getTime()`, `questionCount = responses.length` 계산 후 `scoreDarkNature`에 전달.
- **UI**: 결과 페이지에서 `responseTimePenalty`일 때 "응답이 매우 빠름 — 분석 정확도에 반영됨" 문구 표시.

### 9.5 마이그레이션 적용 순서

**옵션 A — 단일 파일 (권장)**  
1. **003_mnps_schema_and_rls.sql**  
   - 스키마: assessments에 `raw_d_total`(NUMERIC), `is_extreme_top`, `session_id`(UUID). results_metadata에 `result_snapshot`(JSONB), `response_time_penalty`. 인덱스 `idx_assessments_session_id`.  
   - RLS 활성화 후 정책: assessments("Users can view/update own", "Anonymous access via session_id", "Anyone can create assessment"), responses("Access responses via assessment ownership"), results_metadata("Read own results metadata"만, 쓰기 정책 없음).

**옵션 B — 분리 파일**  
1. **003_mnps_result_fields_and_session.sql**: 스키마 확장만.  
2. **004_mnps_rls_policies.sql**: RLS 정책만.

### 9.6 실시간 백분위(Percentile) 시스템

- **목적**: D-Score의 상대적 위치(순위)로 정확도·오락성 강화. "상위 N%" 문구로 수긍감·공유 욕구 자극.
- **DB** (`lib/db/migrations/005_calculate_percentile.sql`):
  - **get_d_score_percentile(score numeric)**: 완료된 응답 중 `raw_d_total < score`인 비율×100을 소수점 1자리로 반환(0~100). 10건 미만이면 50 반환. `SECURITY DEFINER`.
  - **results_metadata.percentile_at_creation**: 검사 완료 시점 백분위 저장. 상위 X% = (100 − percentile_at_creation).
- **API**: `/api/mnps/complete`에서 채점 후 `get_d_score_percentile(rawDTotal 또는 dTotal)` RPC 호출 → `percentile_at_creation` 저장. `/api/mnps/results`는 해당 컬럼을 `percentileAtCreation`으로 반환.
- **UI**: 결과 페이지 상단에 "당신은 N%의 위험군입니다" 배지. **상위 10% 이내**(N≤10) 붉은색 경고, **하위 50%**(N≥50) 녹색 안전, 그 외 노란색 중간 스타일.

### 9.7 규준 보정(분포 분석)

- **목적**: 하드코딩된 NORM_CONFIG(highCutoff 75, midCutoff 45 등)를 누적 데이터 기반으로 **동적 보정**할 수 있도록 분포 분석·권장값 산출.
- **DB** (`lib/db/migrations/006_mnps_norm_distribution.sql`):
  - **get_mnps_norm_distribution()**: COMPLETED assessments의 `raw_d_total` 및 results_metadata.result_snapshot의 4개 Trait 점수에 대해 **n, mean, stddev, p10~p90** 반환(JSONB). SECURITY DEFINER.
- **유틸** (`lib/mnps/normConfigFromDistribution.ts`):
  - **recommendNormConfig(distribution, current)**: 분포 결과와 현재 NORM_CONFIG를 비교해 **권장 highCutoff(=p80), midCutoff(=p50), archetypeHighCutoff(4 trait p80 평균), dTotalCritical(=p90), dTotalHigh(=p80)** 및 설명 메시지(suggestions) 반환. **formatNormConfigAsCode(config)** 로 코드 붙여넣기용 문자열 생성.
- **API** (`GET /api/admin/mnps/norm-analysis`):
  - RPC `get_mnps_norm_distribution` 호출 후 recommendNormConfig 실행. 응답: `distribution`, `currentConfig`, `recommendedConfig`, `suggestions`, `configAsCode`. x-admin-secret 헤더 권장(ADMIN_SECRET 설정 시).
- **사용**: Admin 페이지에서 버튼 클릭 또는 주기적 실행으로 분석 후, `configAsCode`를 `darkNatureScoring.ts`의 NORM_CONFIG에 **수동 반영**. 샘플 10건 미만 시 권장값 미제공.

---

## 10. 현재 테스트 완성도

### 10.1 구현 완료·운영 가능한 항목

| 영역 | 상태 | 비고 |
|------|------|------|
| **문항·채점** | ✅ 완료 | 42문항, trait/subFactor/검증/시나리오/일관성 쌍, D-Total·rawDTotal·비선형 매핑·isExtremeTop |
| **분석 정확도** | ✅ 완료 | 검증 보너스, 일관성 패널티, SD·쌍 문항 보너스, 응답 시간 −30, LSI·지그재그 패턴 −10 |
| **리포트** | ✅ 완료 | Good/Bad 이중 리포트, 아키타입·시너지·SubFactor, 응답 신뢰도 참고·불성실 의심 태그 |
| **서버 주도 채점** | ✅ 완료 | complete는 responses만 수신, 서버에서 채점·저장, 결과 페이지는 API fetch 전용 |
| **보안·RLS** | ✅ 완료 | assessments/responses/results_metadata RLS, results 쓰기 Service Role 전용, session_id(UUID) |
| **제출 회복성** | ✅ 완료 | complete 멱등(이미 완료 시 저장 결과만 반환), 클라이언트 재시도(최대 3회, 지수 백오프) |
| **DB·API** | ✅ 완료 | assessments, responses, results_metadata, 003/004 마이그레이션, 4개 API 라우트 |
| **UI** | ✅ 완료 | 테스트 진행·결과 페이지(한국어), 레이더 차트, 분석 정확도·Extreme·불성실 의심 표시 |
| **이용약관·개인정보처리방침** | ✅ 완료 | `/mnps/terms`, `/mnps/privacy`, LegalPageShell. 베타 안내·면책·저작권 / 수집·목적·보관·면책. 결과 하단 DisclaimerBanner 링크 |

→ **핵심 플로우(응답 → 채점 → 저장 → 결과 표시)** 와 **심리측정·보안·회복성·법적 구색**까지 한 사이클은 구현 완료된 상태이며, DB(Supabase)와 환경 변수(Service Role 등)만 갖추면 서비스 가능한 수준입니다.

### 10.2 선택·보완 권장 항목

| 항목 | 상태 | 권장 |
|------|------|------|
| **결제 연동** | 미구현 | Bad 리포트 공개는 현재 `setHasPaid(true)` 등 UI만. 실제 결제(Stripe 등) 연동 시 `is_paid` 갱신 필요. |
| **로그인 연동** | 부분 | assessments에 `user_id` 전달 가능하나, Supabase Auth 등과의 연동·세션 정책은 앱 전역 설계에 따름. |
| **startedAt 검증** | 생략 | 터무니없는 미래/과거 `startedAt` 차단은 문서에만 권장, API에는 미적용. 필요 시 서버 시간과 비교해 거절. |

### 10.3 미구현·추가 기획 항목

| 항목 | 설명 |
|------|------|
| **동적 OG 이미지** | 공유 시 아키타입·상위 2특성 등이 들어간 썸네일(@vercel/og 등)로 클릭률 개선. |
| **규준 루프(Norming)** | 분포 분석·권장값 API(§9.7)는 구현됨. highCutoff 등은 **수동 반영**; 1만 건 등 축적 후 API로 권장 Config 추출 → NORM_CONFIG 교체. |

### 10.4 요약 점수 (관점별)

- **기능 완성도**: 약 **90%** — 테스트·채점·리포트·보안·회복성까지 구현됨. 결제·규준 자동화·OG는 미구현.
- **운영 준비도**: 약 **85%** — DB 마이그레이션·환경 변수·(선택) 결제만 정리하면 배포 가능.
- **심리측정 무결성**: **높음** — 서버 주도 채점, 응답 시간·패턴(LSI·지그재그) 검증, 분석 정확도·불성실 의심 노출로 데이터 품질·해석 신뢰도 반영됨.

### 10.5 콘텐츠 분량

| 구분 | 수량 | 비고 |
|------|------|------|
| **문항** | 42문항 | 문항당 1문장 + 5지 선다. Dark Tetrad 18 + D-Factor 12 + 검증 8 + 시나리오 4 |
| **특성 스니펫** | 4특성 × 3수준(high/mid/low) × 2~3종 | Good/Bad 각 1~3문장. 프로필별 변동으로 반복 감소 |
| **시너지** | **6조합** × 2~3종 | mach–sadism, mach–psych, mach–narc, psych–sadism, narc–psych, **narc–sadism**(Spotlight Predator). Good/Bad 쌍. 500자 분량 해석 문서: `docs/mnps_synergy_interpretations.md` |
| **아키타입 소개** | 9종 × (Good + Bad) | Puppet Master, Silent Predator, Mirror Egoist, Volatile Outlaw, 단일 특성 4종, Mixed. 각 1~2문장 |
| **아키타입 딥다이브** | **10종** × 3블록 | Puppet Master, Silent Predator, Mirror Egoist, Volatile Outlaw, Strategic Game Architect, High-Impact Ego Architect, Cold Crisis Operator, Social Predator, Mixed Strategic Profile, **The Chaos Engine**. Bad 전용: 무의식적 작동 원리 / 필연적 관계 파탄 / 사회적 붕괴 트리거 |
| **D-Factor 해석** | 4요인 × 높음/낮음 × Good/Bad | 이기주의, 권리의식, 도덕적 이탈, 악의성(한글 표기). 각 2문장. `contentLibrary.dFactorInterpretations` + `D_FACTOR_DISPLAY_KO` |
| **Final Ruin 3테마** | 3종 | Corporate Purge(조직적 숙청), Gaslight Backfire(통제의 역습), Dopamine Burnout(쾌락의 종말). Critical 시 1종 + 생존 팁. 섹션 제목 한글 "최종 리스크 시나리오". `contentLibrary.finalRuinScenarios` |
| **중간 피드백(Interstitial)** | Phase 1 × 3종, Phase 2 × 3종 | Q14·Q28 답변 후 표시. subtitle, message(2~3문단), insights(3개 불릿), buttonLabel. "데이터 분석 중..." 로딩 후 랜덤 변형. `app/mnps/test/InterstitialView.tsx` |
| **아키타입 상세(puppetMaster)** | 1종 확장 구조 | title, quote, summary, analysis, traits, dFactor, ruinScenario(발단~결말), strategy. `lib/mnps/archetypeContent.ts` → `PUPPET_MASTER_CONTENT`, `ARCHETYPE_DETAILED_CONTENT.puppetMaster` |
| **특성 스니펫 톤 변형** | 4특성 × 3레벨 × 3톤 | Clinical / Social / Direct. Good·Bad 각 변형. `contentLibrary.traitSnippetToneVariations` |
| **최종 경고** | 3강도 × 3종 | critical/high/moderate. Final Ruin 시나리오 |
| **추가 Bad 블록** | 6블록 | 어두운 알고리즘·페르소나 괴리·실제 사례·붕괴 단계·법적 리스크·회복 가능성 등, 2000자 이상 분량 |

- **총괄**: 문항·선택지·리포트 스니펫·아키타입·시너지·딥다이브·경고를 합치면 상당한 텍스트량이지만, **서비스의 중심은 문항이 아니라 테스트 진행 후 사용자에게 보여줄 분석 리포트**이다. 문답은 콘텐츠의 **시작**일 뿐 최종이 아님. 재검사 시 같은 42문항만 반복하면 2~3회 검사하는 사용자에게 의미가 없으므로 **문제 은행(Item Bank)** 구축이 필요하다. 전략 정리: [MNPS_CONTENT_STRATEGY.md](./MNPS_CONTENT_STRATEGY.md).

### 10.6 상업 서비스 적합성

| 관점 | 적합성 | 설명 |
|------|--------|------|
| **콘텐츠량** | ✅ 적합 | 위 분량으로 무료 Good + 유료 Bad 구조를 채우기에 충분. 딥다이브·추가 블록으로 유료 구간 가치 부여 가능. |
| **과금 구조** | ⚠️ 준비됨·미연동 | Bad 리포트 잠금/해제·`is_paid` 플래그·CTA(결제 유도)까지 구현됨. **실제 결제(Stripe 등) 연동**만 하면 유료화 가능. |
| **차별화** | ✅ 적합 | 이중 리포트(Good/Bad), 아키타입·시너지, 분석 정확도·불성실 의심 등으로 “단순 점수 공개”와 구분 가능. |
| **법·윤리** | ✅ 기본 구비 | 결과에 “법적·임상적 진단이 아님” 안내 있음. 상업 이용 시 **전문 법률 자문** 및 결제 약관·심리검사 관련 법규 검토 권장. |
| **규준·가격 정당화** | ⚠️ 보완 권장 | highCutoff 75 등이 하드코딩. 데이터 축적 후 **백분위 기반 규준**과 “규준 기반 해석” 문구로 가격·신뢰도 정당화 가능(§10.3 규준 루프). |

**결론**: 콘텐츠 분량과 구조는 **소규모 상업 서비스(결제형 프리미엄 리포트)** 에 적합한 수준입니다. 실제 결제 연동·이용약관·규준 보강만 하면 상업 서비스로 전환 가능합니다.

---

## 11. 최근 변경 사항 (개발 이력)

아래는 지금까지 반영된 주요 변경 사항을 정리한 목록입니다.

### 11.1 서버·채점·검증

| 항목 | 내용 |
|------|------|
| **서버 주도 채점** | complete API는 assessmentId·responses·startedAt만 수신. 서버에서 scoreDarkNature 실행 후 assessments·results_metadata 저장. 결과 페이지는 assessmentId 있을 때 GET `/api/mnps/results`만 사용. |
| **D-Total 천장 완화** | rawDTotal 100 초과 허용, mapRawDTotalToDisplay 비선형 매핑, isExtremeTop 플래그. |
| **응답 시간 검증** | 문항당 0.8초 미만 시 analysisAccuracy −30, responseTimePenalty 플래그. |
| **불성실 응답 패턴** | LSI(동일 응답 6회 이상 연속)·지그재그(극단값 28% 이상) 감지 시 −10 및 insincereResponsePattern. complete는 question_order 기준 정렬 후 patternAnalysisValues 전달. |
| **멱등성·회복성** | complete는 이미 COMPLETED면 재채점 없이 저장 결과만 반환. 클라이언트는 5xx/네트워크 오류 시 최대 3회 지수 백오프 재시도. |

### 11.2 DB·RLS

| 항목 | 내용 |
|------|------|
| **스키마** | assessments: raw_d_total, is_extreme_top, session_id. results_metadata: result_snapshot, response_time_penalty, **percentile_at_creation**. |
| **RLS** | assessments(research/update own, anonymous via session_id, anyone create), responses(ownership), results_metadata(SELECT만, 쓰기 Service Role). |
| **005 마이그레이션** | get_d_score_percentile(score), results_metadata.percentile_at_creation 추가. |

### 11.3 실시간 백분위

| 항목 | 내용 |
|------|------|
| **RPC** | get_d_score_percentile(score): 완료 응답 중 raw_d_total &lt; score 비율×100, 소수 1자리. SECURITY DEFINER. |
| **저장** | complete 채점 후 RPC 호출 → percentile_at_creation 저장. |
| **UI** | 결과 페이지 "당신은 N%의 위험군입니다" 배지. 상위 10% 빨강, 하위 50% 녹색, 그 외 노랑. |

### 11.4 리포트 콘텐츠 확장

| 항목 | 내용 |
|------|------|
| **아키타입 딥다이브** | 10종 × 3블록(무의식/관계 파탄/사회적 붕괴 트리거). The Chaos Engine(고 Psych·낮 Mach) 추가. |
| **시너지 6종** | narc_high_sadism_high(Spotlight Predator) 추가. 500자 분량 해석: `docs/mnps_synergy_interpretations.md`. |
| **D-Factor 해석** | Egoism, Entitlement, MoralDisengagement, Spitefulness × High/Low × Good/Bad. Bad 리포트 "D-Factor 해석" 섹션에 노출. |
| **Final Ruin 3테마** | Corporate Purge, Gaslight Backfire, Dopamine Burnout. Critical 시 1종 + 생존 팁. |
| **특성 톤 변형** | traitSnippetToneVariations: 4특성×3레벨×Clinical·Social·Direct. Good/Bad 각 변형. |
| **마키아벨리즘 서문** | High bad 스니펫에 바넘 효과 적용(양면성·잠재적 불안·엘리트 프레이밍). "냉철해 보이지만 내 사람에게는 헌신적이고 싶어 함" + 통제력·무능 공포 + 사회적 생존 기술·고독 대가. |

### 11.5 이용약관·개인정보 처리방침

| 항목 | 내용 |
|------|------|
| **경로** | `/mnps/terms` (이용약관), `/mnps/privacy` (개인정보 처리방침) |
| **공통 레이아웃** | `LegalPageShell`: 상단 "MNPS로 돌아가기", 제목·부제, 푸터. `LegalSection`·`LegalSectionTitle`로 섹션·타이포 통일. |
| **이용약관** | 베타 서비스 안내(예고 없이 변경 가능), 면책 조항(의학적/임상적 진단 대체 불가·자기 성찰·오락 목적·전문가 상담 권고), 저작권(무단 복제·배포 금지). |
| **개인정보 처리방침** | 수집 항목(응답·점수·접속 로그, 회원 식별 정보 미수집), 수집 목적(서비스·통계·알고리즘 개선·익명화), 보관 기간(법률 자문 후 구체화·캐시 삭제·요청 시 파기 방향), 면책 요약. |
| **연결** | 결과 페이지 하단 `DisclaimerBanner`에서 이용약관·개인정보처리방침 링크 노출. |

### 11.6 3단계 분할 진행·중간 피드백·한글화

| 항목 | 내용 |
|------|------|
| **3단계 분할(Phased Assessment)** | Phase 1(Q1~Q14), Phase 2(Q15~Q28), Phase 3(Q29~Q42). Q14·Q28 답변 직후 중간 휴식 화면 표시. |
| **InterstitialView** | "데이터 분석 중..." 로딩(약 1.8초) 후, Phase 1 종료 3종·Phase 2 종료 3종 메시지 변형(subtitle, message, insights 3개, buttonLabel) 랜덤 표시. Framer Motion 전환. |
| **진행 표시** | 상단 라벨 "Step 1/3", "Step 2/3", "Step 3/3". 단계별 안내 문구. |
| **D-Factor 한글 표기** | 리포트 내 Egoism→이기주의, Entitlement→권리의식, MoralDisengagement→도덕적 이탈, Spitefulness→악의성. High/Low→높음/낮음. `contentLibrary.D_FACTOR_DISPLAY_KO`. |
| **최종 리스크 시나리오** | 섹션 제목 "Final Ruin Scenario" → "최종 리스크 시나리오". 시너지 라벨·방어적/조작적 등 리포트·결과 페이지 문구 한글화. |
| **결과 페이지 라벨** | Extreme→극단, Elite View→엘리트 뷰, Dark Nature→어두운 이면. |
| **Puppet Master 상세 콘텐츠** | `archetypeContent.ts`에 `PUPPET_MASTER_CONTENT`(title, quote, summary, analysis, traits, dFactor, ruinScenario, strategy), `ARCHETYPE_DETAILED_CONTENT.puppetMaster` 추가. |

### 11.7 문서·산출물

| 파일 | 설명 |
|------|------|
| **docs/mnps_synergy_interpretations.md** | 6가지 시너지 500자 해석(Cold Reading·구체적 상황·칭찬인 듯 욕인 듯). |
| **docs/mnps_deep_dive_5_archetypes.json** | 5종 아키타입 Deep Dive JSON(Block1~3). |
| **docs/mnps_trait_snippet_high_variations.json** | 4특성 High 구간 Clinical/Social/Aggressive 변형. |
| **docs/mnps_d_factor_interpretations.json** | D-Factor 4요인 High/Low Good/Bad 해석. |
| **docs/mnps_final_ruin_scenarios.md** | Final Ruin 3테마 마크다운(본문 500자+·생존 팁). |

---

## 12. 참고 문서

| 문서 | 내용 |
|------|------|
| **MNPS_ALGORITHM_IMPROVEMENTS.md** | 채점·정확도·리포트·규준 개선 항목 및 적용 현황 |
| **MNPS_D_SCORE_CONFIG.md** | D-Total 가중치·Inter-correlation 설정 및 계산식 |
| **QUERY_RESPONSE_ANALYSIS_REPORT.md** | **질의·응답 → 분석 레포트** 파이프라인 정의(입출력·공식·채점·해석·조립) — 프로젝트 핵심 설계 문서 |
| **MNPS_ACCURACY_95_RESEARCH.md** | 질의·응답만으로 분석 정확도 95%에 근접시키는 방법 연구 |
| **MNPS_ACCURACY_ANALYSIS.md** | 채점·해석·검증 문항 활용 현황 및 한계 분석 |
| **mnps_synergy_interpretations.md** | 6가지 시너지 500자 해석 |
| **mnps_final_ruin_scenarios.md** | Final Ruin 3테마 본문·생존 팁 |
| **mnps_d_factor_interpretations.json** | D-Factor 4요인 해석 |

---

## 13. 요약

- MNPS는 **42문항**으로 Dark Tetrad·D-Factor를 측정하고, **가중치·Inter-correlation**으로 **D-Total**(rawDTotal·비선형 표출·isExtremeTop)을, **검증·일관성·쌍 문항·응답 시간·불성실 패턴**으로 **분석 정확도**를 산출합니다.
- **NORM_CONFIG**와 **D_SCORE_CONFIG**로 임계값·가중치·가산 공식을 한곳에서 관리하며, 규준·문헌 데이터 확보 시 설정만 바꾸면 됩니다.
- **Good/Bad 이중 리포트**와 **아키타입·시너지·SubFactor·방어/일관성 경고**가 결합되어, 무료로는 긍정 해석을, 유료(또는 잠금 해제)로는 어두운 이면·최종 리스크 시나리오를 제공합니다.
- **서버 주도 채점**: complete API는 responses·startedAt만 받고 서버에서 채점·저장. 결과 페이지는 assessmentId가 있으면 results API로만 서버 저장 데이터를 표시합니다.
- **RLS**: assessments·responses·results_metadata에 대해 user_id/session_id 기반 접근 제어. results_metadata는 유저 읽기만, 쓰기는 Service Role(`supabaseAdmin`)만. complete API는 Service Role로 저장(RLS 우회).
- **결과 조회**: GET `/api/mnps/results`는 서버 저장 `result_snapshot`을 그대로 반환. 결과 페이지는 이 데이터만 렌더링에 사용. 대안: Service Role로 조회 후 앱 레벨에서 session_id/user_id 검증.
- **제출 회복성**: complete API는 멱등(이미 완료 시 저장 결과만 반환). 테스트 페이지는 네트워크/5xx 시 재시도(최대 3회, 지수 백오프).
- **실시간 백분위**: complete 시 RPC get_d_score_percentile 호출 → percentile_at_creation 저장. 결과 페이지에 "당신은 N%의 위험군입니다" 배지(§9.6).
- **3단계 분할·중간 피드백**: 테스트는 Phase 1(Q1~Q14)·Phase 2(Q15~Q28)·Phase 3(Q29~Q42)로 나뉘며, Q14·Q28 답변 후 InterstitialView(로딩+메시지 변형 3종×2) 표시. 진행 라벨 Step 1/3·2/3·3/3(§11.6).
- **리포트·UI 한글화**: D-Factor(이기주의·권리의식·도덕적 이탈·악의성, 높음/낮음), 최종 리스크 시나리오, 시너지 라벨, 결과 페이지(극단·엘리트 뷰·어두운 이면)(§11.6).
- **리포트 확장**: 아키타입 딥다이브 10종, 시너지 6종, D-Factor 해석, Final Ruin 3테마, 특성 톤 변형, 바넘 효과 마키아벨리즘 서문, Puppet Master 상세 콘텐츠(§11.4, §11.6).
- **이용약관·개인정보처리방침**: `/mnps/terms`, `/mnps/privacy`에서 베타 안내·면책·저작권 및 수집·목적·보관·면책 안내. LegalPageShell 공통 레이아웃, 결과 하단 DisclaimerBanner 링크(§7.3, §11.5).
- **완성도**: 기능 약 94%, 운영 준비 약 90%. 동적 OG·법적 페이지 구현 완료. 결제는 코드 준비·베타 비활성, 규준은 수동(§14.6 참고).
- API는 assessments → responses → complete → results 흐름이며, DB 미사용 시 sessionStorage로 미리보기 결과를 유지합니다.

---

## 14. 완성도 종합 평가

### 14.1 평가 요약

| 관점 | 점수 | 요약 |
|------|------|------|
| **기능 완성도** | **90%** | 테스트·채점·리포트·보안·회복성·백분위·콘텐츠 확장까지 구현 완료. 결제·규준 자동화·OG 미구현. |
| **운영 준비도** | **85%** | DB 마이그레이션·환경 변수만 갖추면 배포 가능. 결제·이용약관·규준 보강 시 상업 서비스 전환 가능. |
| **심리측정 무결성** | **높음** | 서버 주도 채점, 응답 시간·LSI·지그재그 검증, 분석 정확도·불성실 의심 노출. 규준·타당도 연구는 미실시. |
| **콘텐츠·해석 깊이** | **높음** | 10종 아키타입 딥다이브, 6종 시너지(500자), D-Factor 4요인, Final Ruin 3테마, 톤 변형, 바넘 효과 서문. |
| **수긍감·바이럴 설계** | **적극 반영** | 실시간 백분위("상위 N%"), Good→Bad 순서(방어 해제 후 팩트), 시너지·아키타입으로 구체적 통찰. |

### 14.2 강점

1. **정확도와 오락성의 이중 설계**  
   절대 점수만이 아니라 **실시간 백분위(상위 N%)**로 순위를 보여주어 "이건 내 위치야"라는 수긍감을 주고, "상위 1% 위험군" 같은 문구로 공유·재방문 동기를 높였다.  
   **Good 리포트로 무장 해제 → Bad 리포트로 직설**하는 순서가 방어기제를 낮추고 해석 수용도를 높인다.

2. **데이터 품질·신뢰도 반영**  
   응답 시간(문항당 0.8초 미만 페널티), LSI·지그재그 패턴 감지, 검증·일관성·쌍 문항 보너스/패널티로 **분석 정확도(50~99%)**와 **불성실 응답 의심** 태그를 노출한다.  
   서버 주도 채점으로 클라이언트 조작을 차단하고, RLS로 결과 쓰기는 Service Role만 가능하게 설계했다.

3. **입체적 해석 구조**  
   단일 특성이 아니라 **아키타입(10종)·시너지(6조합)·D-Factor(4요인)**로 조합 해석을 제공한다.  
   "나르시시즘 High" 수준을 넘어 "The Puppet Master", "상위 4%", "D-Factor 권리 의식 High"까지 이어지므로 **"이거 내 이야기다"** 체감이 강하다.

4. **상업용 콘텐츠 분량**  
   무료 Good + 유료 Bad, 딥다이브·Final Ruin·D-Factor 해석으로 유료 구간 가치가 분명하다.  
   프리미엄 리포트 한 편으로 쓸 수 있는 텍스트량과 구조를 갖췄다.

### 14.3 약점·갭

1. **결제 미연동**  
   Bad 리포트 잠금/해제·`is_paid`·CTA는 있으나 **실제 결제(Stripe 등)** 연동이 없어, 유료화를 위해서는 결제 플로우·웹훅·`is_paid` 갱신이 필요하다.

2. **규준·임계값이 고정**  
   highCutoff 75, midCutoff 45 등이 **하드코딩**이다.  
   데이터 축적 후 **백분위 기반 규준**과 "한국인 상위 20%" 같은 문구로 바꾸면 신뢰도·가격 정당화가 쉬워진다(규준 루프 미구현).

3. **타당도·신뢰도 미검증**  
   문항이 Dark Tetrad·D-Factor를 실제로 측정하는지(**구인 타당도**), 재검사 시 안정적인지(**신뢰도**)에 대한 실측·논문 수준 검증은 없다.  
   운영 후 데이터로 검증 연구를 진행하는 것을 권장한다.

4. **공유·노출 최적화 부재**  
   **동적 OG 이미지**(아키타입·상위 N% 등)가 없어 SNS 공유 시 클릭률·바이럴 효과가 제한적이다.

### 14.4 정확도 vs 오락성 균형

- **정확도**: 서버 채점, 응답 품질 검증, 분석 정확도·불성실 의심 노출, 백분위로 **상대적 위치** 제시 → "테스트가 나를 제대로 본다"는 인상을 주기에 충분하다.  
- **오락성**: "상위 N% 위험군" 배지, Good/Bad 이중 리포트, 아키타입·시너지·Final Ruin 시나리오 → **공유 욕구·재방문·유료 전환**을 노리기에 적절하다.  
- **균형**: 단순 점수 공개가 아니라 **순위·조합 해석·스토리텔링**으로 정확도 체감과 오락성을 동시에 만족시키는 구조다.

### 14.5 종합 결론 및 런칭 기준 (MVP Checklist)

MNPS는 현재 **정확도·오락성·상업화**를 모두 고려한 **'준완성(Pre-Production)'** 단계입니다. 종합 완성도는 **88%**로 평가되며, 상용 서비스 런칭(Grand Open)을 위한 **필수 선결 과제(Go/No-Go Criteria)**는 다음과 같습니다.

| 우선순위 | 구분 | 체크리스트 항목 | 현재 상태 | 비고 |
|:---:|:---:|:---|:---:|:---|
| **P0** | **바이럴** | **동적 OG 이미지** (공유 시 내 결과/백분위 노출) | 🔴 미구현 | 유입 없이는 데이터도 수익도 없음 |
| **P0** | **수익화** | **PG사 연동 & 결제 검증** (Good → Bad 해제) | 🔴 미구현 | 실제 수익 창출을 위한 필수 관문 |
| **P1** | **법적** | **이용약관 & 면책 조항** (의학적 진단 아님 명시) | 🔴 미구현 | 서비스 리스크 방어 최소 조건 |
| **P1** | **데이터** | **규준 보정** (초기 1,000명 데이터로 컷오프 재산정) | 🟡 수동 | 런칭 직후 수동 대응 가능 |

**결론**: 위 **P0 항목 2가지(OG 이미지, 결제)**가 해결되는 즉시 **MVP 런칭**이 가능하며, 이후 운영 단계에서 규준 자동화와 타당도 검증을 병행하여 완성도를 98%까지 끌어올릴 것입니다.

### 14.6 현재 시점 재평가 (업데이트)

아래는 **실제 코드·구현 기준**으로 §14.5 체크리스트를 재점검한 결과입니다.

| 우선순위 | 구분 | 체크리스트 항목 | 현재 상태 | 비고 |
|:---:|:---:|:---|:---:|:---|
| **P0** | **바이럴** | **동적 OG 이미지** (공유 시 내 결과/백분위 노출) | 🟢 **구현됨** | `app/api/og/route.tsx`(@vercel/og), 결과 페이지 `generateMetadata`에서 OG URL 연결 |
| **P0** | **수익화** | **PG 연동 & 결제 검증** (Good → Bad 해제) | 🟡 **코드 준비, 베타 비활성** | Stripe create-checkout·complete API 존재. UI는 "베타 기간 무료 확인"으로 로컬만 해제, `is_paid` 미갱신 |
| **P1** | **법적** | **이용약관 & 면책 조항** (의학적 진단 아님 명시) | 🟢 **구현됨** | `/mnps/terms`, `/mnps/privacy` 페이지 + 결과 하단 `DisclaimerBanner` |
| **P1** | **데이터** | **규준 보정** (데이터 기반 컷오프 재산정) | 🟡 **수동** | RPC `get_mnps_norm_distribution`, `analyze_mnps_norms` + Admin API 노출. `NORM_CONFIG` 수동 반영 |

**재평가 요약**

| 관점 | 점수 | 설명 |
|------|------|------|
| **기능 완성도** | **약 94%** | 테스트·채점·리포트·OG·결과 API(Service Role)·백분위·이용약관·면책까지 구현. 결제는 코드 있으나 베타에서 비활성, 규준은 수동. |
| **운영 준비도** | **약 90%** | 베타 런칭 가능. DB 마이그레이션(003~007, 005 percentile) 적용·환경 변수만 갖추면 배포 가능. 상업 전환 시 결제 UI 재활성·웹훅 권장. |
| **종합 완성도** | **약 92%** | P0 OG·P1 법적 해결됨. P0 결제는 인프라만 켜면 되는 상태. |

**베타 런칭**: 현재 상태로 **베타/소프트 런칭**에 필요한 구색(테스트 플로우, 결과 저장·공유, 이용약관·면책, OG)은 갖춰진 상태입니다. **상용(Grand Open)** 전에는 결제 재활성·웹훅·이용약관 전문 검토를 권장합니다.
