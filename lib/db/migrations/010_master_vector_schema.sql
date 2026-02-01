-- Migration 010: Master Vector 스키마 (벡터 궤적 추적)
-- PostgreSQL/JSONB 기준. V_master 가중치 합성 및 Anomaly 기록

-- 1. Modules: 모듈별 신뢰 가중치 W
CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  trust_weight FLOAT NOT NULL CHECK (trust_weight >= 0 AND trust_weight <= 1.5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO modules (id, name, trust_weight) VALUES
  ('Module_1', '무의식 방해 요인 (M1)', 0.9),
  ('Module_2', '사회적 아키타입 (M2)', 0.8),
  ('Module_3', '이상향 vs 잠재력 (M3)', 0.7)
ON CONFLICT (id) DO UPDATE SET trust_weight = EXCLUDED.trust_weight;

-- 2. Test_Logs: 각 검사 시점의 V_m 벡터 및 당시 상태
CREATE TABLE IF NOT EXISTS test_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID,
  module_id TEXT NOT NULL REFERENCES modules(id),
  local_vector JSONB NOT NULL,
  is_latest BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_logs_user_id ON test_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_test_logs_session_id ON test_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_test_logs_module_created ON test_logs(module_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_logs_is_latest ON test_logs(user_id, session_id, module_id) WHERE is_latest = TRUE;

-- 3. User_Master_Vectors: 현재 통합 상태 (V_master)
CREATE TABLE IF NOT EXISTS user_master_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID,
  combined_vector JSONB NOT NULL,
  consistency_score FLOAT,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE NULLS NOT DISTINCT (user_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_user_master_user ON user_master_vectors(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_master_session ON user_master_vectors(session_id) WHERE session_id IS NOT NULL;

-- 4. Vector_Anomalies: 재검사 시 C < 0.6 유의미 변화 및 시스템 해석
CREATE TABLE IF NOT EXISTS vector_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID,
  module_id TEXT NOT NULL REFERENCES modules(id),
  v_old JSONB NOT NULL,
  v_new JSONB NOT NULL,
  cosine_raw FLOAT NOT NULL,
  narrative_model TEXT CHECK (narrative_model IN ('evolution', 'contextual_persona', 'critical_shift')),
  key_deltas JSONB,
  system_interpretation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vector_anomalies_user ON vector_anomalies(user_id);
CREATE INDEX IF NOT EXISTS idx_vector_anomalies_session ON vector_anomalies(session_id);
CREATE INDEX IF NOT EXISTS idx_vector_anomalies_created ON vector_anomalies(created_at DESC);
