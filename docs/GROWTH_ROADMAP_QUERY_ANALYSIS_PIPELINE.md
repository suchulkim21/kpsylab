# 마인드 아키텍터(성장 로드맵): 질의·응답 → 분석 파이프라인

> MNPS와 동일한 원칙으로, **질의(문항)·응답(선택)** 이 **분석 리포트**로 변환되는 흐름을 정의합니다.  
> 참조: QUERY_RESPONSE_ANALYSIS_REPORT.md, ANALYSIS_ENGINE_OPTIMIZATION_REPORT.md

---

## 1. 파이프라인 개요

```
[질의] 모듈별 문항
  - Module 1: genesis/이상향·잠재력·장애물 질문 (data/questions.ts, lib/module1)
  - Module 2: 시나리오 + 선택지 (data/module2/scenarios.ts, additionalQuestions.ts), 9문항 (data/questions.ts module2Questions)
  - Module 3(Assessment): 이상향·잠재력 문항 (data/module3/questions.ts)
    +
[응답] 문항별 선택 (option id + value: dimension 점수)
    ↓
[채점·분석]
  - Module 1: analysisEngine, contentGenerator
  - Module 2: analysis.ts, consistencyCheck.ts, Module2Engine
  - Module 3: calculateGapAnalysis(ideal, potential) → strategy, alignmentScore, dimensions
    ↓
[리포트] 통합/모듈별 리포트 (UnifiedReportCard, Gap 결과, Good·Bad 관점)
```

---

## 2. 적용 원칙 (MNPS와 동일)

| 원칙 | MNPS에서 한 일 | 마인드 아키텍터 적용 |
|------|----------------|----------------------|
| **점수 표기** | 종합 D 점수 삭제, 의미 불명 숫자 제거 | 종합 분석 점수(totalScore) 표기 삭제, 신뢰도 % 제거·전략만 표기, “20~30점 낮게” 등 구체 점수 문구 완화 |
| **소수점** | 모든 점수 정수로 표기·저장 | syncPercentage·차트 value 정수 반올림 |
| **문항 기술 수정** | 문법·이중구조·모호함 수정 | 장애물/잠재력 문항 문구 정리, 선택지 표현 명확화 |
| **질의·분석 문서화** | QUERY_RESPONSE_ANALYSIS_REPORT.md | 본 문서 (파이프라인·입출력 정의) |

---

## 3. 입출력 요약

- **Module 2**: 시나리오 id + 선택한 option → weight(proactivity, adaptability, socialDistance) 합산 → 정규화(0~100) → 타입 코드·리포트.
- **Module 3(Assessment)**: ideal/potential 벡터(4차원) → calculateGapAnalysis → strategy(Alignment/Expansion/Correction/Pivot), dimensions(dominantGap, strongestPotential). alignmentScore는 내부 로직용, 화면에는 전략만 표기.
- **통합 리포트**: UnifiedReportCard에서 totalScore·상위 N% 표기는 제거됨. 차트·심층 분석·실행 가이드만 유지.

---

## 4. 관련 파일

| 역할 | 파일 |
|------|------|
| 문항(Module 1·2·통합) | app/growth-roadmap/data/questions.ts |
| Module 2 시나리오 | app/growth-roadmap/data/module2/scenarios.ts, additionalQuestions.ts |
| Module 3 문항 | app/growth-roadmap/data/module3/questions.ts |
| 격차 분석 | app/growth-roadmap/lib/analysis.ts |
| Module 2 분석·일관성 | app/growth-roadmap/lib/module2/analysis.ts, consistencyCheck.ts |
| 통합 리포트 카드 | components/report/UnifiedReportCard.tsx |

---

*MNPS 수정 방식을 마인드 아키텍터에도 동일하게 적용한 기준 문서.*
