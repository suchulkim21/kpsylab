/**
 * KPsyLab - Metacognitive Analysis System
 * TypeScript 타입 정의
 */

// ── 감정 기억 카테고리 ──────────────────────────────────────
export type EmotionalMemoryType =
  | "fear"               // 공포 기반 회피
  | "reward"             // 보상 추구
  | "deprivation"        // 결핍 보상
  | "shame"              // 수치심 회피
  | "attachment"         // 애착 추구
  | "judgment"           // 도덕적 심판
  | "social_desirability" // 사회적 바람직성 편향
  | "self_serving";      // 자기 서빙 편향

export const MEMORY_LABELS: Record<EmotionalMemoryType, string> = {
  fear: "공포/위협 회피",
  reward: "보상 추구",
  deprivation: "결핍 보상",
  shame: "수치심 회피",
  attachment: "애착/인정 추구",
  judgment: "도덕적 심판",
  social_desirability: "사회적 바람직성",
  self_serving: "자기 서빙 편향",
};

// ── 질문 객체 ───────────────────────────────────────────────
export interface QuestionOption {
  id: string;
  text: string;
  linked_memory: EmotionalMemoryType;
  data_weight: number; // 0-100, 데이터 기반 적합도
}

export interface DiagnosticRule {
  bias_name_ko: string;
  bias_name_en: string;
  trigger_option_id: string;
  trigger_type: "fast_reaction" | "high_confidence" | "priming_match_fast";
  trigger_threshold_ms?: number;
  trigger_threshold_confidence?: number;
  diagnosis_template: string;
}

export interface HiddenBiasData {
  dominant_bias: EmotionalMemoryType;
  bias_strength: number; // 0-1
  priming_target_memory: EmotionalMemoryType;
  cognitive_load_level: "low" | "medium" | "high";
  diagnostic_rule?: DiagnosticRule;
}

export interface Question {
  id: string;
  priming_words: string[];
  scenario: string;
  options: QuestionOption[];
  hidden_bias_data: HiddenBiasData;
}

// ── 사용자에게 안전한 뷰 (hidden_bias_data 제외) ────────────
export interface SafeQuestion {
  id: string;
  priming_words: string[];
  scenario: string;
  options: { id: string; text: string }[];
}

// ── 사용자 응답 ─────────────────────────────────────────────
export interface UserResponse {
  question_id: string;
  selected_option_id: string;
  reaction_time_ms: number;
  confidence_level: number; // 0-100
}

// ── 분석 결과 ───────────────────────────────────────────────
export interface OverconfidenceMetrics {
  raw_gap: number;
  overconfidence_index: number;
  calibration_grade: string; // A~F
}

export interface MemoryBiasAnalysis {
  detected_memory_type: EmotionalMemoryType;
  is_primitive_reaction: boolean;
  reaction_speed_category: string;
  priming_alignment: number; // 0-1
}

export interface TotalBiasScore {
  priming_match: number;
  speed_score: number;
  overconfidence_normalized: number;
  weight_priming: number;
  weight_latency: number;
  total: number; // 0-1
}

export interface ScenarioDiagnosis {
  triggered: boolean;
  bias_name?: string;
  diagnosis?: string;
}

export interface AnalysisResult {
  overconfidence: OverconfidenceMetrics;
  memory_bias: MemoryBiasAnalysis;
  total_bias_score: TotalBiasScore;
  scenario_diagnosis: ScenarioDiagnosis;
  structural_analysis: string;
  metacognitive_insight: string;
}

// ── 세션 요약 ───────────────────────────────────────────────
export interface SessionSummaryData {
  total_questions: number;
  dominant_memory_pattern: EmotionalMemoryType;
  dominant_memory_label: string;
  memory_distribution: Record<string, number>;
  avg_overconfidence_index: number;
  avg_total_bias_score: number;
  reflexive_reaction_ratio: number;
  triggered_biases: string[];
  summary: string;
}
