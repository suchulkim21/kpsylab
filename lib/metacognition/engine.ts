/**
 * KPsyLab - Metacognitive Analysis Engine
 * 핵심 분석 로직: Total Bias Score 산출, 시나리오별 인지 편향 진단, 구조적 메시지 생성
 *
 * 수식:
 *   Total_Bias_Score = (W_priming × Match + W_latency × Speed + Overconfidence) / 3
 */
import type {
    Question,
    QuestionOption,
    UserResponse,
    AnalysisResult,
    OverconfidenceMetrics,
    TotalBiasScore,
    ScenarioDiagnosis,
    EmotionalMemoryType,
} from "./models";
import { MEMORY_LABELS } from "./models";

// 반응 시간 임계값 (ms)
const REFLEXIVE_THRESHOLD_MS = 1500;
const DELIBERATE_THRESHOLD_MS = 4000;
const HESITANT_THRESHOLD_MS = 7000;

// Total Bias Score 가중치
const W_PRIMING = 1.0;
const W_LATENCY = 1.0;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. 반응 속도 분류
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function classifyReactionSpeed(reactionTimeMs: number): string {
    if (reactionTimeMs < REFLEXIVE_THRESHOLD_MS) return "reflexive";
    if (reactionTimeMs > HESITANT_THRESHOLD_MS) return "hesitant";
    if (reactionTimeMs > DELIBERATE_THRESHOLD_MS) return "deliberate";
    return "moderate";
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. 인지적 오만 지수
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function computeOverconfidence(
    confidence: number,
    dataWeight: number
): OverconfidenceMetrics {
    const rawGap = confidence - dataWeight;
    const index = Math.max(0, Math.min(100, rawGap));

    let grade: string;
    if (index <= 10) grade = "A";
    else if (index <= 25) grade = "B";
    else if (index <= 45) grade = "C";
    else if (index <= 65) grade = "D";
    else grade = "F";

    return {
        raw_gap: Math.round(rawGap * 10) / 10,
        overconfidence_index: Math.round(index * 10) / 10,
        calibration_grade: grade,
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. 점화 단어 ↔ 선택 일치도
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function computePrimingMatch(
    question: Question,
    selectedOption: QuestionOption
): number {
    return selectedOption.linked_memory ===
        question.hidden_bias_data.priming_target_memory
        ? 1.0
        : 0.0;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. Total Bias Score 산출
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function computeTotalBiasScore(
    primingMatch: number,
    reactionTimeMs: number,
    overconfidenceIndex: number
): TotalBiasScore {
    const matchVal = primingMatch;
    const speedVal = reactionTimeMs < REFLEXIVE_THRESHOLD_MS ? 1.0 : 0.0;
    const ocNormalized = overconfidenceIndex / 100.0;

    let total =
        (W_PRIMING * matchVal + W_LATENCY * speedVal + ocNormalized) / 3.0;
    total = Math.round(Math.min(1.0, Math.max(0.0, total)) * 1000) / 1000;

    return {
        priming_match: matchVal,
        speed_score: speedVal,
        overconfidence_normalized: Math.round(ocNormalized * 1000) / 1000,
        weight_priming: W_PRIMING,
        weight_latency: W_LATENCY,
        total,
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. 시나리오별 특수 진단
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function evaluateDiagnosticRule(
    question: Question,
    selectedOption: QuestionOption,
    reactionTimeMs: number,
    confidence: number
): ScenarioDiagnosis {
    const rule = question.hidden_bias_data.diagnostic_rule;
    if (!rule) return { triggered: false };
    if (selectedOption.id !== rule.trigger_option_id) return { triggered: false };

    let triggered = false;

    if (rule.trigger_type === "fast_reaction") {
        triggered = reactionTimeMs < (rule.trigger_threshold_ms ?? 1500);
    } else if (rule.trigger_type === "high_confidence") {
        triggered = confidence >= (rule.trigger_threshold_confidence ?? 90);
    } else if (rule.trigger_type === "priming_match_fast") {
        const target = question.hidden_bias_data.priming_target_memory;
        const isMatch = selectedOption.linked_memory === target;
        const isFast = reactionTimeMs < (rule.trigger_threshold_ms ?? 2000);
        triggered = isMatch && isFast;
    }

    if (triggered) {
        return {
            triggered: true,
            bias_name: `${rule.bias_name_ko} (${rule.bias_name_en})`,
            diagnosis: rule.diagnosis_template,
        };
    }

    return { triggered: false };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. 구조적 분석 메시지 생성
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function generateStructuralAnalysis(
    memoryType: EmotionalMemoryType,
    speedCat: string,
    primingMatch: number,
    overconfidence: OverconfidenceMetrics,
    totalBias: TotalBiasScore,
    scenarioDiag: ScenarioDiagnosis,
    question: Question,
    reactionTimeMs: number
): string {
    const memoryLabel = MEMORY_LABELS[memoryType];
    const primingWordsStr = question.priming_words
        .map((w) => `'${w}'`)
        .join(", ");
    const reactionSec = Math.round((reactionTimeMs / 1000) * 10) / 10;

    const sections: string[] = [];

    // ── 반응 속도 분석 ──
    if (speedCat === "reflexive") {
        sections.push(
            `[반응 속도: ${reactionSec}초 — 반사적]\n` +
            `당신의 뇌는 이 시나리오를 '분석'한 것이 아니라 ` +
            `과거 기억 데이터베이스에서 패턴 매칭을 수행했습니다. ` +
            `1.5초 미만의 반응은 전두엽 피질(이성)이 개입하기 전에 ` +
            `편도체(감정)가 이미 결론을 내렸다는 신경과학적 증거입니다.`
        );
    } else if (speedCat === "hesitant") {
        sections.push(
            `[반응 속도: ${reactionSec}초 — 망설임]\n` +
            `7초 이상의 지연이 감지되었습니다. ` +
            `두 개의 상충하는 기억 패턴이 동시에 활성화되어 ` +
            `인지적 갈등(cognitive conflict)이 발생했습니다. ` +
            `당신은 '신중하게 생각한 것'이 아니라 ` +
            `'어떤 과거의 감정을 따를지 몰라서 멈춘 것'입니다.`
        );
    } else if (speedCat === "moderate") {
        sections.push(
            `[반응 속도: ${reactionSec}초 — 중간]\n` +
            `반응 시간은 반사도 숙고도 아닌 중간 영역에 있습니다. ` +
            `이것이 이성적 판단이었는지, 아니면 ` +
            `기억 기반 직관을 '합리화'하는 데 시간을 소비한 것인지는 ` +
            `아래 분석이 판별합니다.`
        );
    } else {
        sections.push(
            `[반응 속도: ${reactionSec}초 — 숙고적]\n` +
            `충분한 숙고 시간을 가졌습니다. ` +
            `그러나 '오래 생각했다'는 것이 '정확하게 생각했다'는 의미는 아닙니다. ` +
            `숙고 시간의 대부분이 '이미 내린 결론을 정당화하는 데' ` +
            `사용되었을 가능성을 배제할 수 없습니다.`
        );
    }

    // ── 점화 효과 분석 ──
    if (primingMatch === 1.0) {
        sections.push(
            `[점화 효과: 적중]\n` +
            `시나리오 전에 노출된 점화 단어(${primingWordsStr})는 ` +
            `당신의 '${memoryLabel}' 기억 회로를 정확히 활성화시켰고, ` +
            `당신은 그 유도에 100% 일치하는 선택을 했습니다. ` +
            `당신이 '자유의지로 선택했다'고 느끼는 바로 그 감각이 ` +
            `점화 효과가 성공했다는 증거입니다.`
        );
    } else {
        sections.push(
            `[점화 효과: 불일치]\n` +
            `점화 단어(${primingWordsStr})가 유도한 방향과 ` +
            `당신의 선택은 일치하지 않았습니다. ` +
            `이것이 자율적 판단의 증거는 아닙니다 — ` +
            `다른 감정 기억이 점화 유도보다 더 강하게 작동했거나, ` +
            `점화에 대한 '반발 반응(reactance)'이 발생했을 수 있습니다.`
        );
    }

    // ── 인지적 오만 분석 ──
    const oc = overconfidence;
    if (oc.calibration_grade === "D" || oc.calibration_grade === "F") {
        sections.push(
            `[인지적 오만: ${oc.overconfidence_index}점 — 등급 ${oc.calibration_grade}]\n` +
            `당신은 ${Math.round(oc.raw_gap)}%p만큼 자신의 판단을 과대평가하고 있습니다. ` +
            `이 수준의 과신은 '느낌이 맞다'는 감각 자체가 ` +
            `왜곡된 기억 데이터에 의해 생성된 것임을 보여줍니다. ` +
            `당신의 확신은 정확성의 지표가 아니라, ` +
            `과거 감정 각인의 강도를 반영할 뿐입니다.`
        );
    } else if (oc.calibration_grade === "C") {
        sections.push(
            `[인지적 오만: ${oc.overconfidence_index}점 — 등급 ${oc.calibration_grade}]\n` +
            `보정이 필요한 수준입니다. ` +
            `당신의 '확신감'은 실제 데이터와 상당한 괴리가 있으며, ` +
            `이 괴리가 존재한다는 사실 자체를 인식하지 못했다는 점이 ` +
            `메타인지 부재의 증거입니다.`
        );
    } else {
        sections.push(
            `[인지적 오만: ${oc.overconfidence_index}점 — 등급 ${oc.calibration_grade}]\n` +
            `확신도와 실제 데이터의 괴리가 비교적 작습니다. ` +
            `그러나 '보정이 잘 된 것'과 '올바른 판단을 한 것'은 ` +
            `별개의 문제입니다.`
        );
    }

    // ── Total Bias Score ──
    const tbs = totalBias;
    const biasPct = Math.round(tbs.total * 100);
    let biasLevel: string;
    if (tbs.total >= 0.7) biasLevel = "위험";
    else if (tbs.total >= 0.4) biasLevel = "경고";
    else biasLevel = "관찰";

    sections.push(
        `[Total Bias Score: ${tbs.total.toFixed(3)} (${biasPct}%) — ${biasLevel}]\n` +
        `점화일치(Match)=${Math.round(tbs.priming_match)} × W=${tbs.weight_priming}, ` +
        `충동성(Speed)=${Math.round(tbs.speed_score)} × W=${tbs.weight_latency}, ` +
        `과신도(OC)=${tbs.overconfidence_normalized.toFixed(2)}\n` +
        `→ (${tbs.weight_priming}×${Math.round(tbs.priming_match)} + ` +
        `${tbs.weight_latency}×${Math.round(tbs.speed_score)} + ` +
        `${tbs.overconfidence_normalized.toFixed(2)}) / 3 = ${tbs.total.toFixed(3)}`
    );

    // ── 시나리오 고유 진단 ──
    if (scenarioDiag.triggered && scenarioDiag.diagnosis) {
        sections.push(
            `[특수 진단: ${scenarioDiag.bias_name}]\n${scenarioDiag.diagnosis}`
        );
    }

    return sections.join("\n\n");
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. 메타인지 통찰 요약
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function generateInsight(
    memoryType: EmotionalMemoryType,
    totalBias: TotalBiasScore,
    scenarioDiag: ScenarioDiagnosis
): string {
    const label = MEMORY_LABELS[memoryType];

    let core =
        `당신의 뇌는 '${label}' 패턴에 기반하여 현재 상황을 해석했습니다. ` +
        `지금 느끼는 '직관'은 현재에 대한 정확한 판단이 아니라, ` +
        `과거에 각인된 감정 반응의 재생(replay)입니다.`;

    if (totalBias.total >= 0.7) {
        core +=
            `\n\nTotal Bias Score ${Math.round(totalBias.total * 100)}% — ` +
            `이것은 가장 위험한 상태입니다. ` +
            `점화 유도에 적중하고, 반사적으로 반응했으며, 그것을 확신합니다. ` +
            `당신은 '선택'한 것이 아니라 '반응'한 것이며, ` +
            `그 반응이 옳다고 '느끼는 것'마저 과거 기억이 만들어낸 환상입니다.`;
    } else if (totalBias.total >= 0.4) {
        core +=
            `\n\nTotal Bias Score ${Math.round(totalBias.total * 100)}% — ` +
            `무의식적 편향이 판단에 상당한 영향을 미치고 있습니다. ` +
            `3개 지표(점화·충동·과신) 중 다수가 활성화된 상태입니다.`;
    }

    if (scenarioDiag.triggered && scenarioDiag.bias_name) {
        core +=
            `\n\n감지된 인지 편향: ${scenarioDiag.bias_name}. ` +
            `이 편향은 당신이 '의식적으로' 통제할 수 있다고 믿는 영역에서 ` +
            `가장 강력하게 작동합니다. 메타인지의 첫 단계는 ` +
            `'나는 이미 오염되어 있다'는 사실을 인정하는 것입니다.`;
    }

    return core;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 메인 분석 파이프라인
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function analyze(
    question: Question,
    response: UserResponse
): AnalysisResult {
    const selected = question.options.find(
        (opt) => opt.id === response.selected_option_id
    );
    if (!selected) throw new Error("유효하지 않은 옵션입니다");

    const speedCat = classifyReactionSpeed(response.reaction_time_ms);
    const isPrimitive = speedCat === "reflexive";

    const overconfidence = computeOverconfidence(
        response.confidence_level,
        selected.data_weight
    );

    const primingMatch = computePrimingMatch(question, selected);

    const totalBias = computeTotalBiasScore(
        primingMatch,
        response.reaction_time_ms,
        overconfidence.overconfidence_index
    );

    const scenarioDiag = evaluateDiagnosticRule(
        question,
        selected,
        response.reaction_time_ms,
        response.confidence_level
    );

    const primingAlignment =
        primingMatch === 1.0 ? question.hidden_bias_data.bias_strength : 0.0;

    const structural = generateStructuralAnalysis(
        selected.linked_memory,
        speedCat,
        primingMatch,
        overconfidence,
        totalBias,
        scenarioDiag,
        question,
        response.reaction_time_ms
    );

    const insight = generateInsight(
        selected.linked_memory,
        totalBias,
        scenarioDiag
    );

    return {
        overconfidence,
        memory_bias: {
            detected_memory_type: selected.linked_memory,
            is_primitive_reaction: isPrimitive,
            reaction_speed_category: speedCat,
            priming_alignment: Math.round(primingAlignment * 100) / 100,
        },
        total_bias_score: totalBias,
        scenario_diagnosis: scenarioDiag,
        structural_analysis: structural,
        metacognitive_insight: insight,
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 세션 요약 생성
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function generateSessionSummary(
    entries: { result: AnalysisResult }[]
): {
    total_questions: number;
    dominant_memory_pattern: EmotionalMemoryType;
    dominant_memory_label: string;
    memory_distribution: Record<string, number>;
    avg_overconfidence_index: number;
    avg_total_bias_score: number;
    reflexive_reaction_ratio: number;
    triggered_biases: string[];
    summary: string;
} {
    const total = entries.length;
    const memoryCounts: Record<string, number> = {};
    let totalOverconfidence = 0;
    let totalBiasSum = 0;
    let reflexiveCount = 0;
    const triggeredBiases: string[] = [];

    for (const entry of entries) {
        const r = entry.result;
        const mem = r.memory_bias.detected_memory_type;
        memoryCounts[mem] = (memoryCounts[mem] || 0) + 1;
        totalOverconfidence += r.overconfidence.overconfidence_index;
        totalBiasSum += r.total_bias_score.total;
        if (r.memory_bias.is_primitive_reaction) reflexiveCount++;
        if (r.scenario_diagnosis.triggered && r.scenario_diagnosis.bias_name) {
            triggeredBiases.push(r.scenario_diagnosis.bias_name);
        }
    }

    const dominantMemory = Object.entries(memoryCounts).reduce((a, b) =>
        a[1] >= b[1] ? a : b
    )[0] as EmotionalMemoryType;
    const avgOverconfidence = Math.round((totalOverconfidence / total) * 10) / 10;
    const avgBiasScore = Math.round((totalBiasSum / total) * 1000) / 1000;
    const reflexiveRatio =
        Math.round((reflexiveCount / total) * 1000) / 10;
    const dominantLabel = MEMORY_LABELS[dominantMemory];

    let summaryMsg =
        `총 ${total}개 시나리오 분석 결과:\n\n` +
        `당신의 판단을 지배하는 감정 기억 패턴: '${dominantLabel}'\n` +
        `(${total}개 중 ${memoryCounts[dominantMemory]}개 선택에서 감지)\n\n` +
        `평균 인지적 오만 지수: ${avgOverconfidence}점\n` +
        `평균 Total Bias Score: ${Math.round(avgBiasScore * 100)}%\n` +
        `반사적(1.5초 미만) 반응 비율: ${reflexiveRatio}%\n\n`;

    if (triggeredBiases.length > 0) {
        summaryMsg += "감지된 인지 편향:\n";
        for (const bias of triggeredBiases) {
            summaryMsg += `  · ${bias}\n`;
        }
        summaryMsg += "\n";
    }

    if (avgBiasScore >= 0.6) {
        summaryMsg +=
            "종합 판정: 당신의 의사결정 시스템은 현재 '자동 조종 모드'에 " +
            "가깝습니다. 대부분의 선택에서 점화 유도에 적중하고, " +
            "반사적으로 반응했으며, 그것을 높은 확신으로 포장했습니다. " +
            "느낌은 데이터가 아닙니다. 느낌은 과거의 메아리입니다.\n\n" +
            "'나는 합리적인 사람이다'라는 믿음이 강할수록, " +
            "무의식적 편향은 더 은밀하게 작동합니다. " +
            "메타인지의 시작은 '나도 틀릴 수 있다'가 아니라 " +
            "'나는 이미 틀려 있다'를 받아들이는 것입니다.";
    } else if (avgBiasScore >= 0.35) {
        summaryMsg +=
            "종합 판정: 부분적인 자기 인식은 작동하고 있으나, " +
            "핵심 지점에서 과거 감정 기억이 판단을 왜곡하고 있습니다. " +
            "'오래 생각했으니 맞을 것이다'라는 믿음 자체가 " +
            "메타인지의 사각지대입니다.";
    } else {
        summaryMsg +=
            "종합 판정: 상대적으로 보정된 판단 패턴을 보이고 있으나, " +
            `'${dominantLabel}' 패턴의 반복적 영향은 주시할 필요가 있습니다. ` +
            "메타인지는 '한 번 깨달으면 끝'이 아니라 지속적 모니터링입니다.";
    }

    return {
        total_questions: total,
        dominant_memory_pattern: dominantMemory,
        dominant_memory_label: dominantLabel,
        memory_distribution: memoryCounts,
        avg_overconfidence_index: avgOverconfidence,
        avg_total_bias_score: avgBiasScore,
        reflexive_reaction_ratio: reflexiveRatio,
        triggered_biases: triggeredBiases,
        summary: summaryMsg,
    };
}
