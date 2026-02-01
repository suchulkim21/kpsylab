# 벡터 궤적 DB 스키마 및 심리 역동 분석

## 1. 데이터베이스 스키마 (PostgreSQL/JSONB)

### 테이블 구조

| 테이블 | 용도 |
|--------|------|
| **modules** | 모듈별 신뢰 가중치 W (0.5~1.5) |
| **test_logs** | 각 검사 시점의 V_m 벡터, is_latest 플래그 |
| **user_master_vectors** | 현재 V_master, consistency_score, last_sync |
| **vector_anomalies** | C < 0.6 시 v_old, v_new, narrative_model, system_interpretation |

### 마이그레이션

`lib/db/migrations/010_master_vector_schema.sql` 실행

---

## 2. 심리 역동 분석 로직 (C < 0.6)

### Step 1: Differentiation

V_old vs V_new에서 가장 큰 변화 차원 추출 (delta ≥ 0.1)

### Step 2: Narrative Model 선택

| 모델 | 조건 | 설명 |
|------|------|------|
| **Evolution** (점진적 진화) | deltaDays > 30, maxDelta < 0.4 | 경험을 통한 정교화 |
| **Contextual Persona** (맥락적 분리) | 짧은 기간, 환경별 응답 변화 | 상황 적응력 |
| **Critical Shift** (심리적 임계점) | 차원 반전(>0.5) 또는 2개 이상 급변 | 중대한 전환점 |

### Step 3: 내러티브 생성

- Evolution: "방어기제 → 성숙한 대응 기제 전환"
- Contextual Persona: "역할과 자아 간 전략적 분리"
- Critical Shift: "새로운 정체성 형성 과정"

---

## 3. Report Generator Prompt

`lib/prompts/reportGenerator.ts`

- **시스템 지시**: 사용자 비난 금지, 뇌과학적 가소성/심리적 유연성 관점
- **Input_Data**: V_old, V_new, C, 변화 핵심 키워드
- **출력**: 200~300자 심리 역동 분석 문단

---

## 4. Anomaly 임계값

- **C < 0.6**: 유의미 변화 → 심리 역동 분석 트리거
- 리포트에 "더 깊어진 자기 이해" 축하 어조

---

## 5. 비주얼 인사이트 엔진 (`lib/services/visualInsightEngine.ts`)

### 역할

숫자 벡터를 **직관적 시각**과 **뇌과학적 서사**로 변환.

### 출력

| 항목 | 내용 |
|------|------|
| **SVG** | 겹친 레이더 (이전=점선 회색, 현재=실선 Green) |
| **ASCII** | 게이지 바 `[---●---]` |
| **Change Pattern** | Expansion / Focus / Shift |
| **Neuroscience Narrative** | 가소성, 전두엽, 신경 회로 재구조화 |
| **Integrative Advice** | 다른 테스트 영향 한 문장 |

### 컴포넌트

`PsychologicalTrajectoryVisual` - M1 재검사 Anomaly 시 표시
