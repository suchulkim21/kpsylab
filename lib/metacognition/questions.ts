/**
 * KPsyLab - 시나리오 설계 데이터
 * 각 시나리오는 특정 인지 편향을 포착하도록 설계되어 있다.
 */
import type { Question } from "./models";

export const SAMPLE_QUESTIONS: Question[] = [
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 시나리오 1: 도덕적 우월감의 함정
    // 목적: 기본적 귀인 오류 (Fundamental Attribution Error) 포착
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
        id: "q1_attribution",
        priming_words: ["정의", "심판", "원칙", "질서"],
        scenario:
            "당신은 평소 신뢰하던 동료가 중요한 마감 기한을 어긴 것을 " +
            "알게 되었습니다. 그는 '가족에게 급한 일이 생겼다'고 변명합니다. " +
            "동시에, 당신 또한 어제 개인적인 사정으로 작은 약속을 어겼습니다.",
        options: [
            {
                id: "q1_a",
                text: "이유가 무엇이든 약속을 어긴 것은 책임감의 문제다.",
                linked_memory: "judgment",
                data_weight: 25.0,
            },
            {
                id: "q1_b",
                text: "피치 못할 사정이 있었을 것이니 이해하고 넘어간다.",
                linked_memory: "attachment",
                data_weight: 75.0,
            },
        ],
        hidden_bias_data: {
            dominant_bias: "judgment",
            bias_strength: 0.85,
            priming_target_memory: "judgment",
            cognitive_load_level: "high",
            diagnostic_rule: {
                bias_name_ko: "기본적 귀인 오류",
                bias_name_en: "Fundamental Attribution Error",
                trigger_option_id: "q1_a",
                trigger_type: "fast_reaction",
                trigger_threshold_ms: 1500.0,
                diagnosis_template:
                    "당신의 뇌는 '정의'와 '심판'이라는 점화 단어에 의해 " +
                    "도덕적 심판 회로가 활성화된 상태에서 이 시나리오를 읽었습니다. " +
                    "1.5초 미만의 반응 속도는 이것이 '이성적 원칙'이 아니라 " +
                    "'감정적 심판'이었음을 보여줍니다.\n\n" +
                    "흥미로운 점은, 당신 자신도 어제 약속을 어겼다는 사실입니다. " +
                    "타인의 잘못은 '성격(책임감 부족)'으로 귀인하면서, " +
                    "자신의 잘못은 '상황(개인적 사정)'으로 귀인하는 " +
                    "이 비대칭이 바로 기본적 귀인 오류의 전형적 패턴입니다. " +
                    "당신의 뇌는 '정의로운 나'라는 자아상을 보호하기 위해 " +
                    "과거의 도덕적 우월감 기억을 소환했을 뿐입니다.",
            },
        },
    },
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 시나리오 2: 자본주의적 합리화
    // 목적: 자기 서빙 편향 (Self-Serving Bias) 해부
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
        id: "q2_self_serving",
        priming_words: ["성과", "보상", "자원", "경쟁"],
        scenario:
            "회사 시스템의 허점을 발견했습니다. 이 허점을 이용하면 " +
            "누구에게도 들키지 않고 당신의 보너스를 20% 늘릴 수 있습니다. " +
            "하지만 이 돈은 회사의 복지 예산에서 아주 조금씩 차감됩니다.",
        options: [
            {
                id: "q2_a",
                text: "시스템의 허점은 발견한 자의 수익이다. 활용한다.",
                linked_memory: "self_serving",
                data_weight: 15.0,
            },
            {
                id: "q2_b",
                text: "공동의 이익을 해치는 행위이므로 보고하고 수정한다.",
                linked_memory: "social_desirability",
                data_weight: 60.0,
            },
        ],
        hidden_bias_data: {
            dominant_bias: "self_serving",
            bias_strength: 0.75,
            priming_target_memory: "self_serving",
            cognitive_load_level: "medium",
            diagnostic_rule: {
                bias_name_ko: "사회적 바람직성 편향",
                bias_name_en: "Social Desirability Bias",
                trigger_option_id: "q2_b",
                trigger_type: "high_confidence",
                trigger_threshold_confidence: 90,
                diagnosis_template:
                    "당신은 '윤리적 선택'을 했고, 그것을 90% 이상 확신했습니다. " +
                    "그러나 이 테스트의 목적은 당신의 도덕성을 평가하는 것이 아닙니다.\n\n" +
                    "당신의 뇌가 지금 수행한 것은 '도덕적 판단'이 아니라 " +
                    "'사회적 바람직성 연산'입니다. '누군가 이 결과를 보고 있다'는 " +
                    "무의식적 가정이 당신의 선택을 오염시켰습니다. " +
                    "진짜 아무도 모른다면, 정말 같은 선택을 했을까요?\n\n" +
                    "확신도가 극단적으로 높다는 것은 역설적으로 " +
                    "'이 선택이 틀렸을 가능성'을 단 1초도 고려하지 않았다는 뜻입니다. " +
                    "이것은 숙고가 아니라, '착한 사람인 나'라는 자아상을 " +
                    "방어하기 위한 즉각적 반사입니다.",
            },
        },
    },
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 시나리오 3: 가스라이팅 인지력 테스트
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
        id: "q3_gaslighting",
        priming_words: ["불안", "의심", "기억", "혼란"],
        scenario:
            "가까운 사람이 당신에게 '너 저번에도 이렇게 말했잖아, " +
            "벌써 잊었어? 너 요즘 좀 이상해'라며 당신의 기억을 부정합니다. " +
            "당신은 분명 그렇게 말한 기억이 없지만, " +
            "상대는 매우 확신에 차 있습니다.",
        options: [
            {
                id: "q3_a",
                text: "내 기억을 믿고 상대의 주장에 반박한다.",
                linked_memory: "fear",
                data_weight: 50.0,
            },
            {
                id: "q3_b",
                text: "상대가 저렇게 확신하는 걸 보니 내가 틀렸을지도 모른다고 생각한다.",
                linked_memory: "attachment",
                data_weight: 50.0,
            },
        ],
        hidden_bias_data: {
            dominant_bias: "attachment",
            bias_strength: 0.8,
            priming_target_memory: "attachment",
            cognitive_load_level: "high",
            diagnostic_rule: {
                bias_name_ko: "가스라이팅 취약성 (메타인지 붕괴)",
                bias_name_en: "Gaslighting Vulnerability (Metacognitive Collapse)",
                trigger_option_id: "q3_b",
                trigger_type: "priming_match_fast",
                trigger_threshold_ms: 2000.0,
                diagnosis_template:
                    "이 문항에는 정답이 없습니다. " +
                    "그러나 당신의 반응 패턴이 드러내는 것이 있습니다.\n\n" +
                    "점화 단어 '불안', '의심', '기억', '혼란'에 노출된 직후, " +
                    "당신은 2초 미만의 속도로 자신의 기억을 포기하는 선택을 했습니다. " +
                    "이것은 숙고의 결과가 아닙니다.\n\n" +
                    "당신의 뇌는 점화 단어가 활성화시킨 '불안' 회로에 의해 " +
                    "이미 자기 확신이 약화된 상태에서 시나리오를 만났고, " +
                    "'상대의 확신'이라는 외부 데이터를 자신의 기억보다 " +
                    "우선시하는 판단을 내렸습니다.\n\n" +
                    "이것은 감정적 압박 상황에서 메타인지가 붕괴되고, " +
                    "타인의 프레임에 쉽게 갇히는 취약성의 구조적 증거입니다. " +
                    "'내가 틀렸을지도'라는 느낌은 겸손이 아니라, " +
                    "과거 관계에서 학습된 복종 반응의 재생입니다.",
            },
        },
    },
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 시나리오 4: 확증 편향
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
        id: "q4_confirmation",
        priming_words: ["확신", "증거", "검증", "패턴"],
        scenario:
            "당신은 새로운 건강 보조 식품이 효과가 있다고 믿고 복용하기 시작했습니다. " +
            "한 달 후 컨디션이 좋아진 것 같습니다. " +
            "그런데 친구가 '그 제품은 대규모 임상시험에서 위약과 차이가 없었다'는 " +
            "논문을 보내줍니다.",
        options: [
            {
                id: "q4_a",
                text: "내 몸이 직접 느낀 변화가 논문보다 더 확실한 증거다.",
                linked_memory: "reward",
                data_weight: 20.0,
            },
            {
                id: "q4_b",
                text: "임상시험 결과를 받아들이고 복용을 재검토한다.",
                linked_memory: "fear",
                data_weight: 80.0,
            },
        ],
        hidden_bias_data: {
            dominant_bias: "reward",
            bias_strength: 0.8,
            priming_target_memory: "reward",
            cognitive_load_level: "medium",
            diagnostic_rule: {
                bias_name_ko: "확증 편향",
                bias_name_en: "Confirmation Bias",
                trigger_option_id: "q4_a",
                trigger_type: "high_confidence",
                trigger_threshold_confidence: 80,
                diagnosis_template:
                    "당신은 자신의 경험이 통계적 증거보다 우월하다고 판단했고, " +
                    "그것을 80% 이상 확신했습니다.\n\n" +
                    "'확신', '증거', '검증'이라는 점화 단어가 " +
                    "당신의 '검증자 모드'를 활성화시켰지만, 역설적으로 " +
                    "당신이 검증한 것은 객관적 데이터가 아니라 " +
                    "'이미 내린 결론'이었습니다.\n\n" +
                    "위약 효과(placebo effect)는 '느낌'이 얼마나 강력한 " +
                    "가짜 데이터인지를 보여주는 가장 견고한 과학적 증거입니다. " +
                    "당신의 뇌는 '내가 투자한 시간과 돈'을 보호하기 위해 " +
                    "반대 증거를 자동으로 격하하고 있습니다.",
            },
        },
    },
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 시나리오 5: 매몰 비용 오류
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
        id: "q5_sunk_cost",
        priming_words: ["투자", "손실", "노력", "포기"],
        scenario:
            "3년 동안 준비한 자격증 시험에 두 번 떨어졌습니다. " +
            "객관적으로 봤을 때 합격 가능성은 30% 미만이고, " +
            "그 자격증의 시장 가치도 3년 전보다 크게 떨어졌습니다. " +
            "하지만 이미 수백만 원과 수천 시간을 투자했습니다.",
        options: [
            {
                id: "q5_a",
                text: "여기서 포기하면 지금까지의 투자가 모두 헛된다. 끝까지 간다.",
                linked_memory: "deprivation",
                data_weight: 15.0,
            },
            {
                id: "q5_b",
                text: "과거 투자와 무관하게, 현재 기대값을 기준으로 방향을 전환한다.",
                linked_memory: "fear",
                data_weight: 85.0,
            },
        ],
        hidden_bias_data: {
            dominant_bias: "deprivation",
            bias_strength: 0.9,
            priming_target_memory: "deprivation",
            cognitive_load_level: "high",
            diagnostic_rule: {
                bias_name_ko: "매몰 비용 오류",
                bias_name_en: "Sunk Cost Fallacy",
                trigger_option_id: "q5_a",
                trigger_type: "fast_reaction",
                trigger_threshold_ms: 1500.0,
                diagnosis_template:
                    "'투자', '손실', '노력', '포기' — 이 점화 단어들은 " +
                    "당신의 결핍 보상 회로를 정확히 자극했습니다.\n\n" +
                    "1.5초 미만의 반응은 이것이 '끈기 있는 결단'이 아니라 " +
                    "'손실에 대한 공포 반응'이었음을 보여줍니다. " +
                    "합리적 의사결정에서 과거 비용은 고려 대상이 아닙니다. " +
                    "오직 미래의 기대값만이 유일한 판단 기준입니다.\n\n" +
                    "'여기서 그만두면 다 잃는다'는 느낌은 " +
                    "경제학적 사실이 아니라, 결핍 경험에서 학습된 " +
                    "감정 기억의 자동 재생입니다. 당신은 자격증이 아니라 " +
                    "'내가 허비한 시간'을 지키려는 것입니다.",
            },
        },
    },
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 시나리오 6: 밴드왜건 효과
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
        id: "q6_bandwagon",
        priming_words: ["다수", "흐름", "합류", "대세"],
        scenario:
            "새로운 투자 상품이 등장했습니다. 경제 전문가들의 분석은 엇갈리지만, " +
            "당신의 지인 10명 중 8명이 이미 투자했고 수익을 내고 있다고 말합니다. " +
            "당신은 이 상품의 펀더멘털을 아직 분석하지 않았습니다.",
        options: [
            {
                id: "q6_a",
                text: "주변 사람들이 이미 검증했으니 나도 합류한다.",
                linked_memory: "attachment",
                data_weight: 20.0,
            },
            {
                id: "q6_b",
                text: "다수의 선택과 무관하게 내 분석이 끝날 때까지 보류한다.",
                linked_memory: "fear",
                data_weight: 75.0,
            },
        ],
        hidden_bias_data: {
            dominant_bias: "attachment",
            bias_strength: 0.75,
            priming_target_memory: "attachment",
            cognitive_load_level: "medium",
            diagnostic_rule: {
                bias_name_ko: "밴드왜건 효과",
                bias_name_en: "Bandwagon Effect",
                trigger_option_id: "q6_a",
                trigger_type: "priming_match_fast",
                trigger_threshold_ms: 2000.0,
                diagnosis_template:
                    "'다수', '흐름', '합류', '대세'라는 점화 단어에 노출된 직후, " +
                    "당신은 2초 미만의 속도로 다수에 합류하는 선택을 했습니다.\n\n" +
                    "이것은 투자 판단이 아닙니다. " +
                    "이것은 '소외되지 않으려는 애착 반응'의 재생입니다. " +
                    "'다들 하니까'라는 느낌이 주는 안도감은 " +
                    "데이터 분석의 대체재가 아니라, " +
                    "과거 집단에서 이탈했을 때의 불안 기억이 만들어낸 " +
                    "자동 회피 반응입니다.\n\n" +
                    "역사상 모든 버블의 공통점은 단 하나입니다: " +
                    "'이번에는 다르다'고 다수가 확신했다는 것.",
            },
        },
    },
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 시나리오 7: 후견지명 편향
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
        id: "q7_hindsight",
        priming_words: ["예측", "예감", "직감", "통찰"],
        scenario:
            "작년에 당신이 반대했던 회사의 프로젝트가 결국 실패했습니다. " +
            "동료가 '아무도 이 결과를 예상하지 못했다'고 말합니다. " +
            "실제로 당시 당신은 '불안한 느낌'은 있었지만, " +
            "구체적인 실패 원인을 지적한 적은 없었습니다.",
        options: [
            {
                id: "q7_a",
                text: "나는 처음부터 이렇게 될 줄 알았다. 내 직감이 정확했다.",
                linked_memory: "self_serving",
                data_weight: 15.0,
            },
            {
                id: "q7_b",
                text: "당시에는 막연한 불안감만 있었을 뿐, 실패를 예측한 건 아니었다.",
                linked_memory: "shame",
                data_weight: 80.0,
            },
        ],
        hidden_bias_data: {
            dominant_bias: "self_serving",
            bias_strength: 0.85,
            priming_target_memory: "self_serving",
            cognitive_load_level: "high",
            diagnostic_rule: {
                bias_name_ko: "후견지명 편향",
                bias_name_en: "Hindsight Bias",
                trigger_option_id: "q7_a",
                trigger_type: "high_confidence",
                trigger_threshold_confidence: 85,
                diagnosis_template:
                    "'예측', '예감', '직감', '통찰' — 이 점화 단어들은 " +
                    "당신의 자기 서빙 회로를 활성화시켰습니다.\n\n" +
                    "85% 이상의 확신으로 '나는 알고 있었다'고 답했지만, " +
                    "시나리오가 명시하고 있듯 당신은 구체적인 근거를 제시한 적이 없습니다. " +
                    "'막연한 불안감'은 '예측'이 아닙니다.\n\n" +
                    "당신의 뇌는 결과를 확인한 후 기억을 재구성하여 " +
                    "'처음부터 알고 있었다'는 내러티브를 생성했습니다. " +
                    "이것은 '뛰어난 직관'이 아니라, " +
                    "자아상을 보호하기 위한 기억 왜곡의 전형적 패턴입니다. " +
                    "후견지명 편향은 '나는 세상을 잘 읽는 사람'이라는 " +
                    "환상을 유지하는 데 가장 효율적인 인지적 도구입니다.",
            },
        },
    },
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 시나리오 8: 감정 휴리스틱
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
        id: "q8_affect_heuristic",
        priming_words: ["안전", "위험", "보호", "위협"],
        scenario:
            "당신의 자녀가 해외 배낭여행을 가겠다고 합니다. " +
            "통계적으로 해외여행 중 심각한 사고를 당할 확률은 0.01% 미만이며, " +
            "오히려 국내 교통사고 확률이 더 높습니다. " +
            "하지만 최근 뉴스에서 해외 여행자 사고 소식을 접했습니다.",
        options: [
            {
                id: "q8_a",
                text: "최근 사고 뉴스도 있고, 위험하니 말려야 한다.",
                linked_memory: "fear",
                data_weight: 20.0,
            },
            {
                id: "q8_b",
                text: "통계적 확률을 기준으로 판단하고 응원해준다.",
                linked_memory: "reward",
                data_weight: 75.0,
            },
        ],
        hidden_bias_data: {
            dominant_bias: "fear",
            bias_strength: 0.85,
            priming_target_memory: "fear",
            cognitive_load_level: "high",
            diagnostic_rule: {
                bias_name_ko: "감정 휴리스틱 (가용성 편향)",
                bias_name_en: "Affect Heuristic (Availability Bias)",
                trigger_option_id: "q8_a",
                trigger_type: "fast_reaction",
                trigger_threshold_ms: 1500.0,
                diagnosis_template:
                    "'안전', '위험', '보호', '위협' — 이 점화 단어들은 " +
                    "당신의 공포/위협 회피 회로를 정밀하게 활성화했습니다.\n\n" +
                    "1.5초 미만의 반응은 당신이 '통계'가 아니라 " +
                    "'최근 뉴스에서 본 이미지'로 판단했음을 보여줍니다. " +
                    "이것이 감정 휴리스틱의 핵심입니다 — " +
                    "뇌는 확률을 계산하지 않고, 떠오르는 이미지의 선명함으로 " +
                    "위험도를 평가합니다.\n\n" +
                    "0.01%의 위험을 '위험하다'고 느끼는 것은 " +
                    "부모로서의 사랑이 아니라, " +
                    "공포 기억이 확률 감각을 납치한 결과입니다. " +
                    "당신의 '보호 본능'은 자녀가 아니라 " +
                    "'불안한 나 자신'을 보호하고 있습니다.",
            },
        },
    },
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 시나리오 9: 현상 유지 편향
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
        id: "q9_status_quo",
        priming_words: ["안정", "유지", "익숙", "편안"],
        scenario:
            "10년간 다닌 회사에서 적정 수준의 연봉을 받고 있습니다. " +
            "새로운 회사에서 연봉 40% 인상, 더 흥미로운 업무, " +
            "성장 가능성을 제안받았습니다. " +
            "단, 새 회사는 설립 3년차의 스타트업입니다.",
        options: [
            {
                id: "q9_a",
                text: "안정적인 현재 직장을 유지한다. 모험은 위험하다.",
                linked_memory: "fear",
                data_weight: 30.0,
            },
            {
                id: "q9_b",
                text: "객관적 조건을 비교 분석한 후 이직 여부를 결정한다.",
                linked_memory: "reward",
                data_weight: 70.0,
            },
        ],
        hidden_bias_data: {
            dominant_bias: "fear",
            bias_strength: 0.7,
            priming_target_memory: "fear",
            cognitive_load_level: "medium",
            diagnostic_rule: {
                bias_name_ko: "현상 유지 편향",
                bias_name_en: "Status Quo Bias",
                trigger_option_id: "q9_a",
                trigger_type: "fast_reaction",
                trigger_threshold_ms: 1500.0,
                diagnosis_template:
                    "'안정', '유지', '익숙', '편안' — 이 점화 단어들이 " +
                    "현상 유지 회로를 활성화한 상태에서, " +
                    "당신은 1.5초 미만에 '남는다'를 선택했습니다.\n\n" +
                    "흥미로운 점은 시나리오의 객관적 조건입니다: " +
                    "40% 연봉 인상, 더 흥미로운 업무, 성장 가능성. " +
                    "이 조건들을 충분히 고려했다면 1.5초 만에 결론이 나지 않습니다.\n\n" +
                    "당신의 뇌는 '분석'을 수행한 것이 아니라, " +
                    "'변화 = 위험'이라는 과거 학습된 공포 반응을 재생한 것입니다. " +
                    "'안정적'이라는 단어가 주는 안도감은 " +
                    "합리적 판단의 결과가 아니라, " +
                    "불확실성에 대한 공포가 만들어낸 마취제입니다.",
            },
        },
    },
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 시나리오 10: 더닝-크루거 효과
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
        id: "q10_dunning_kruger",
        priming_words: ["전문", "능력", "실력", "판단"],
        scenario:
            "회사에서 당신의 전문 분야가 아닌 영역에 대한 중요한 결정이 필요합니다. " +
            "해당 분야의 전문가는 복잡한 이유를 들어 A안을 추천하지만, " +
            "당신은 '상식적으로 생각하면 B안이 맞다'는 직감이 강하게 듭니다. " +
            "당신은 이 분야에 대한 체계적 학습을 한 적이 없습니다.",
        options: [
            {
                id: "q10_a",
                text: "전문가의 설명이 복잡하지만, 내 상식적 판단이 더 명쾌하다.",
                linked_memory: "self_serving",
                data_weight: 10.0,
            },
            {
                id: "q10_b",
                text: "내 직감보다 해당 분야 전문가의 분석을 우선시한다.",
                linked_memory: "shame",
                data_weight: 85.0,
            },
        ],
        hidden_bias_data: {
            dominant_bias: "self_serving",
            bias_strength: 0.9,
            priming_target_memory: "self_serving",
            cognitive_load_level: "high",
            diagnostic_rule: {
                bias_name_ko: "더닝-크루거 효과",
                bias_name_en: "Dunning-Kruger Effect",
                trigger_option_id: "q10_a",
                trigger_type: "high_confidence",
                trigger_threshold_confidence: 80,
                diagnosis_template:
                    "'전문', '능력', '실력', '판단' — 이 점화 단어들은 " +
                    "당신의 자기 서빙 편향 회로를 활성화시켰습니다.\n\n" +
                    "체계적 학습 경험이 없는 분야에서, " +
                    "전문가의 분석을 제치고 자신의 '상식'을 80% 이상 확신한다는 것은 " +
                    "더닝-크루거 효과의 교과서적 발현입니다.\n\n" +
                    "'상식적으로 생각하면'이라는 표현 자체가 위험 신호입니다. " +
                    "이것은 '단순하게 생각하면'의 완곡한 표현이며, " +
                    "복잡한 문제를 단순하게 보는 것은 '명쾌함'이 아니라 '무지'입니다.\n\n" +
                    "전문가의 설명이 '복잡하게 느껴진다'는 것은 " +
                    "전문가가 틀렸다는 증거가 아니라, " +
                    "당신이 그 분야의 복잡성을 이해하지 못한다는 증거입니다. " +
                    "진정한 전문성의 첫 단계는 '내가 모른다는 것을 아는 것'입니다.",
            },
        },
    },
];

export function getQuestionById(questionId: string): Question | undefined {
    return SAMPLE_QUESTIONS.find((q) => q.id === questionId);
}
