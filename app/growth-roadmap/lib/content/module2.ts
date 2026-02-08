
// src/lib/content/module2.ts
// DEV_GUIDE 준수: 
// 1. 코드는 효율적인 구조(영어 변수명) 사용
// 2. 사용자에게 노출되는 '데이터 값'은 100% 한국어

export interface ResultItem {
    id: string;
    category: string;
    title: string;
    content: string;
}

type AnalysisType = "HLA" | "HLP" | "HIA" | "HIP" | "LLA" | "LLP" | "LIA" | "LIP";

export const TYPE_DISPLAY_NAMES: Record<AnalysisType, string> = {
    "HLA": "통합적 통제형",
    "HLP": "분석적 관망형",
    "HIA": "유동적 행동형",
    "HIP": "수용적 조화형",
    "LLA": "주도적 원칙형",
    "LLP": "전문적 탐구형",
    "LIA": "직관적 실행형",
    "LIP": "내향적 독립형"
};

// 공통 템플릿 생성을 위한 헬퍼 함수 (실제로는 각 유형별 고유 데이터가 필요하지만, 
// 긴급 복구를 위해 패턴화된 데이터를 생성하되 내용은 충실하게 채웁니다.)
// 주의: 이 프로젝트는 '고정된' 30개 텍스트를 요구하므로, 8개 유형에 대해 하드코딩된 데이터를 제공해야 합니다.
// 여기서는 분량상 생략 없이 8개 타입을 모두 정의합니다.

const DATA: Record<AnalysisType, ResultItem[]> = {
    "HLA": [
        { id: "M2_HLA_01", category: "심층 분석", title: "핵심 욕구", content: "환경과 사람을 통제하여 예측 가능한 질서를 만들고자 합니다." },
        { id: "M2_HLA_02", category: "심층 분석", title: "두려움", content: "주도권을 잃고 무력해지는 상황을 견디지 못합니다." },
        { id: "M2_HLA_03", category: "심층 분석", title: "그림자 자아", content: "'독재자'. 자신의 뜻대로 되지 않으면 분노하는 억압된 자아입니다." },
        { id: "M2_HLA_04", category: "심층 분석", title: "방어 기제", content: "통제와 합리화. 불안할수록 더 강하게 주변을 옥죕니다." },
        { id: "M2_HLA_05", category: "심층 분석", title: "자아 분열", content: "완벽한 리더상과 고립된 내면 사이의 괴리." },
        { id: "M2_HLA_06", category: "심층 분석", title: "에너지 원천", content: "계획대로 성과가 도출될 때." },
        { id: "M2_HLA_07", category: "인지 프로세스", title: "정보 처리", content: "필요한 정보만 빠르게 취사선택하여 구조화합니다." },
        { id: "M2_HLA_08", category: "인지 프로세스", title: "의사결정", content: "리스크를 최소화하는 방향으로 신속하게 결단합니다." },
        { id: "M2_HLA_09", category: "인지 프로세스", title: "인지 오류", content: "흑백 논리. 내 편이 아니면 적이라고 생각하기 쉽습니다." },
        { id: "M2_HLA_10", category: "인지 프로세스", title: "몰입", content: "조직 시스템 설계 및 대형 프로젝트." },
        { id: "M2_HLA_11", category: "인지 프로세스", title: "학습", content: "목표 지향적 학습. 써먹을 수 있는 지식만 배웁니다." },
        { id: "M2_HLA_12", category: "인지 프로세스", title: "창의성", content: "서로 다른 자원을 결합하여 효율을 극대화할 때." },
        { id: "M2_HLA_13", category: "인지 프로세스", title: "판단 속도", content: "매우 빠름. 직관과 경험을 결합해 즉시 판단합니다." },
        { id: "M2_HLA_14", category: "인지 프로세스", title: "직관 활용", content: "자신의 '감'을 논리로 포장하여 설득합니다." },
        { id: "M2_HLA_15", category: "행동 패턴", title: "행동 특징", content: "지시하고, 점검하고, 피드백을 줍니다." },
        { id: "M2_HLA_16", category: "행동 패턴", title: "스트레스", content: "간섭이 심해지고 언성이 높아집니다." },
        { id: "M2_HLA_17", category: "행동 패턴", title: "시간 관리", content: "분 단위로 계획하며 빈틈을 허용하지 않습니다." },
        { id: "M2_HLA_18", category: "행동 패턴", title: "소비", content: "지위를 나타내거나 성능이 검증된 명품을 선호합니다." },
        { id: "M2_HLA_19", category: "행동 패턴", title: "휴식", content: "휴식도 업무의 연장선상에서 효율적으로 관리합니다." },
        { id: "M2_HLA_20", category: "행동 패턴", title: "환경 통제", content: "모든 물건이 제자리에 정리되어 있어야 합니다." },
        { id: "M2_HLA_21", category: "사회적 역동", title: "리더십", content: "카리스마형. 따르지 않으면 가차 없이 배제합니다." },
        { id: "M2_HLA_22", category: "사회적 역동", title: "팔로워십", content: "존경할 수 없는 상사 밑에서는 반역을 꿈꿉니다." },
        { id: "M2_HLA_23", category: "사회적 역동", title: "갈등 해결", content: "힘의 논리로 제압하거나 논리로 굴복시킵니다." },
        { id: "M2_HLA_24", category: "사회적 역동", title: "대화법", content: "단정적, 지시적, 결론 중심." },
        { id: "M2_HLA_25", category: "사회적 역동", title: "걸림돌", content: "독단적인 태도로 인한 주변의 반발." },
        { id: "M2_HLA_26", category: "사회적 역동", title: "파트너", content: "자신의 비전을 믿고 따라주는 충직한 참모." },
        { id: "M2_HLA_27", category: "임상 솔루션", title: "미션", content: "오늘 하루, 타인의 의견을 반박 없이 경청하기." },
        { id: "M2_HLA_28", category: "임상 솔루션", title: "로드맵", content: "권한 위임을 통해 타인을 성장시키는 리더가 되십시오." },
        { id: "M2_HLA_29", category: "임상 솔루션", title: "확언", content: "내가 통제하지 않아도 세상은 안전하다." },
        { id: "M2_HLA_30", category: "임상 솔루션", title: "질문", content: "내가 두려워하는 것은 실패인가, 통제 상실인가?" }
    ],
    "HLP": [
        { id: "M2_HLP_01", category: "심층 분석", title: "핵심 욕구", content: "세상을 관찰하고 분석하여 이해하고자 하는 지적 욕구." },
        { id: "M2_HLP_02", category: "심층 분석", title: "두려움", content: "무지한 상태로 노출되거나 감정적으로 휘말리는 것." },
        { id: "M2_HLP_03", category: "심층 분석", title: "그림자 자아", content: "'방관자'. 현실에 참여하지 않고 평가만 하려는 자아." },
        { id: "M2_HLP_04", category: "심층 분석", title: "방어 기제", content: "지적화. 감정을 이론으로 분석하여 거리를 둡니다." },
        { id: "M2_HLP_05", category: "심층 분석", title: "자아 분열", content: "참여하고 싶은 욕구와 상처받기 싫은 회피의 갈등." },
        { id: "M2_HLP_06", category: "심층 분석", title: "에너지 원천", content: "혼자만의 공간에서 지적 탐구에 몰입할 때." },
        { id: "M2_HLP_07", category: "인지 프로세스", title: "정보 처리", content: "모든 디테일을 놓치지 않고 수집하여 분석합니다." },
        { id: "M2_HLP_08", category: "인지 프로세스", title: "의사결정", content: "정보가 완벽해질 때까지 결정을 유보합니다." },
        { id: "M2_HLP_09", category: "인지 프로세스", title: "인지 오류", content: "분석 마비. 생각만 하다가 행동하지 못합니다." },
        { id: "M2_HLP_10", category: "인지 프로세스", title: "몰입", content: "데이터 분석, 전략 시뮬레이션, 철학적 사색." },
        { id: "M2_HLP_11", category: "인지 프로세스", title: "학습", content: "원리부터 파고드는 심층 학습." },
        { id: "M2_HLP_12", category: "인지 프로세스", title: "창의성", content: "기존 이론의 모순을 해결하는 새로운 모델 제시." },
        { id: "M2_HLP_13", category: "인지 프로세스", title: "판단 속도", content: "신중함. 섣부른 판단을 경계합니다." },
        { id: "M2_HLP_14", category: "인지 프로세스", title: "직관 활용", content: "직관을 불신하며 데이터로 검증하려 합니다." },
        { id: "M2_HLP_15", category: "행동 패턴", title: "행동 특징", content: "관찰하고, 기록하고, 분석합니다." },
        { id: "M2_HLP_16", category: "행동 패턴", title: "스트레스", content: "외부와 단절하고 동굴로 숨어버립니다." },
        { id: "M2_HLP_17", category: "행동 패턴", title: "시간 관리", content: "여유로운 일정을 선호하며 독촉을 싫어합니다." },
        { id: "M2_HLP_18", category: "행동 패턴", title: "소비", content: "철저한 비교 분석 후 합리적 구매." },
        { id: "M2_HLP_19", category: "행동 패턴", title: "휴식", content: "완벽한 고립과 침묵." },
        { id: "M2_HLP_20", category: "행동 패턴", title: "환경 통제", content: "프라이버시 침해를 절대 용납하지 않습니다." },
        { id: "M2_HLP_21", category: "사회적 역동", title: "리더십", content: "전략가형. 뒤에서 방향을 제시합니다." },
        { id: "M2_HLP_22", category: "사회적 역동", title: "팔로워십", content: "전문성을 인정해주는 리더에게 헌신합니다." },
        { id: "M2_HLP_23", category: "사회적 역동", title: "갈등 해결", content: "회피하거나 논리적으로 반박하고 끝냅니다." },
        { id: "M2_HLP_24", category: "사회적 역동", title: "대화법", content: "신중, 객관적, 질문 중심." },
        { id: "M2_HLP_25", category: "사회적 역동", title: "걸림돌", content: "지나친 신중함이 무능이나 무관심으로 비칠 수 있음." },
        { id: "M2_HLP_26", category: "사회적 역동", title: "파트너", content: "자신의 분석을 실행에 옮겨줄 행동가." },
        { id: "M2_HLP_27", category: "임상 솔루션", title: "미션", content: "70% 확신이 들면 즉시 실행에 옮기기." },
        { id: "M2_HLP_28", category: "임상 솔루션", title: "로드맵", content: "관찰자에서 참여자로, 세상 속으로 뛰어드십시오." },
        { id: "M2_HLP_29", category: "임상 솔루션", title: "확언", content: "행동하지 않는 지식은 힘이 없다." },
        { id: "M2_HLP_30", category: "임상 솔루션", title: "질문", content: "나는 준비하고 있는가, 아니면 미루고 있는가?" }
    ],
    "HIA": [
        { id: "M2_HIA_01", category: "심층 분석", title: "핵심 욕구", content: "자유롭게 탐험하고 새로운 가능성을 실현하는 것." },
        { id: "M2_HIA_02", category: "심층 분석", title: "두려움", content: "구속받는 것, 지루함, 가능성이 차단되는 것." },
        { id: "M2_HIA_03", category: "심층 분석", title: "그림자 자아", content: "'피터팬'. 책임을 회피하고 영원히 즐거움만 좇으려는 자아." },
        // ... (이하 동일 패턴으로 30개 항목 채움)
        { id: "M2_HIA_04", category: "심층 분석", title: "방어 기제", content: "유머와 화제 전환. 심각한 상황을 농담으로 넘깁니다." },
        { id: "M2_HIA_05", category: "심층 분석", title: "자아 분열", content: "진지한 성취와 가벼운 쾌락 사이의 갈등." },
        { id: "M2_HIA_06", category: "심층 분석", title: "에너지 원천", content: "새로운 사람, 새로운 장소, 새로운 아이디어." },
        { id: "M2_HIA_07", category: "인지 프로세스", title: "정보 처리", content: "직관적으로 전체 패턴을 파악합니다." },
        { id: "M2_HIA_08", category: "인지 프로세스", title: "의사결정", content: "흥미와 가능성을 중심으로 빠르게 결정합니다." },
        { id: "M2_HIA_09", category: "인지 프로세스", title: "인지 오류", content: "낙관 편향. 잘 될 것이라고 막연히 믿습니다." },
        { id: "M2_HIA_10", category: "인지 프로세스", title: "몰입", content: "브레인스토밍, 초기 기획 단계." },
        { id: "M2_HIA_11", category: "인지 프로세스", title: "학습", content: "놀이처럼 즐겁게, 체험하며 배우는 방식." },
        { id: "M2_HIA_12", category: "인지 프로세스", title: "창의성", content: "전혀 다른 분야를 연결하여 혁신을 만듭니다." },
        { id: "M2_HIA_13", category: "인지 프로세스", title: "판단 속도", content: "매우 빠름. 영감이 오면 바로 움직입니다." },
        { id: "M2_HIA_14", category: "인지 프로세스", title: "직관 활용", content: "직관을 전적으로 신뢰합니다." },
        { id: "M2_HIA_15", category: "행동 패턴", title: "행동 특징", content: "활발하게 움직이며 동시에 여러 일을 벌입니다." },
        { id: "M2_HIA_16", category: "행동 패턴", title: "스트레스", content: "산만해지고 충동적인 행동을 합니다." },
        { id: "M2_HIA_17", category: "행동 패턴", title: "시간 관리", content: "유동적임. 계획보다는 흐름을 따릅니다." },
        { id: "M2_HIA_18", category: "행동 패턴", title: "소비", content: "경험과 즐거움을 위한 충동적 소비." },
        { id: "M2_HIA_19", category: "행동 패턴", title: "휴식", content: "여행이나 파티 등 활동적인 휴식." },
        { id: "M2_HIA_20", category: "행동 패턴", title: "환경 통제", content: "자유분방. 정리에 크게 신경 쓰지 않습니다." },
        { id: "M2_HIA_21", category: "사회적 역동", title: "리더십", content: "비전 제시형. 꿈을 심어주어 이끕니다." },
        { id: "M2_HIA_22", category: "사회적 역동", title: "팔로워십", content: "자율성을 보장해주면 열정적으로 일합니다." },
        { id: "M2_HIA_23", category: "사회적 역동", title: "갈등 해결", content: "긍정적으로 무마하거나 자리를 피합니다." },
        { id: "M2_HIA_24", category: "사회적 역동", title: "대화법", content: "열정적, 은유적, 과장 섞인 표현." },
        { id: "M2_HIA_25", category: "사회적 역동", title: "걸림돌", content: "마무리가 약하고 약속을 잊기 쉽습니다." },
        { id: "M2_HIA_26", category: "사회적 역동", title: "파트너", content: "현실적인 디테일을 챙겨줄 꼼꼼한 관리자." },
        { id: "M2_HIA_27", category: "임상 솔루션", title: "미션", content: "시작한 일 중 하나는 반드시 끝맺음하기." },
        { id: "M2_HIA_28", category: "임상 솔루션", title: "로드맵", content: "열정을 구체적인 성과로 연결하는 끈기를 기르세요." },
        { id: "M2_HIA_29", category: "임상 솔루션", title: "확언", content: "자유는 규율 안에서 더 빛난다." },
        { id: "M2_HIA_30", category: "임상 솔루션", title: "질문", content: "나는 도망치고 있는가, 모험하고 있는가?" }
    ],
    "HIP": [
        { id: "M2_HIP_01", category: "심층 분석", title: "핵심 욕구", content: "내면의 평화와 조화를 유지하는 것." },
        { id: "M2_HIP_02", category: "심층 분석", title: "두려움", content: "갈등, 분리, 연결이 끊어지는 것." },
        { id: "M2_HIP_03", category: "심층 분석", title: "그림자 자아", content: "'희생자'. 남을 위해 나를 지우며 억울해하는 자아." },
        { id: "M2_HIP_04", category: "심층 분석", title: "방어 기제", content: "융합. 타인의 의견에 동조하여 갈등을 없앱니다." },
        { id: "M2_HIP_05", category: "심층 분석", title: "자아 분열", content: "자신을 주장하고픈 욕구와 관계를 지키고픈 욕구." },
        { id: "M2_HIP_06", category: "심층 분석", title: "에너지 원천", content: "따뜻한 관계 속에서 수용받는 느낌." },
        { id: "M2_HIP_07", category: "인지 프로세스", title: "정보 처리", content: "사람과 감정을 중심으로 정보를 받아들입니다." },
        { id: "M2_HIP_08", category: "인지 프로세스", title: "의사결정", content: "모두가 만족할 수 있는 방향을 찾느라 느립니다." },
        { id: "M2_HIP_09", category: "인지 프로세스", title: "인지 오류", content: "독심술. 상대의 기분을 내 멋대로 추측하고 걱정합니다." },
        { id: "M2_HIP_10", category: "인지 프로세스", title: "몰입", content: "상담, 치유, 예술 감상." },
        { id: "M2_HIP_11", category: "인지 프로세스", title: "학습", content: "함께 토론하고 교감하며 배우는 방식." },
        { id: "M2_HIP_12", category: "인지 프로세스", title: "창의성", content: "사람들의 숨겨진 니즈를 읽어낼 때." },
        { id: "M2_HIP_13", category: "인지 프로세스", title: "판단 속도", content: "느림. 주변 눈치를 보느라 지체됩니다." },
        { id: "M2_HIP_14", category: "인지 프로세스", title: "직관 활용", content: "관계의 기류를 읽는 직관이 발달했습니다." },
        { id: "M2_HIP_15", category: "행동 패턴", title: "행동 특징", content: "잘 웃고, 고개를 끄덕이며, 맞장구를 칩니다." },
        { id: "M2_HIP_16", category: "행동 패턴", title: "스트레스", content: "지나치게 위축되거나 감정적으로 폭발합니다." },
        { id: "M2_HIP_17", category: "행동 패턴", title: "시간 관리", content: "타인의 요청에 응하느라 내 시간을 뺏기기 쉽습니다." },
        { id: "M2_HIP_18", category: "행동 패턴", title: "소비", content: "타인을 위한 선물이나 관계 유지를 위한 지출." },
        { id: "M2_HIP_19", category: "행동 패턴", title: "휴식", content: "친한 사람들과의 편안한 수다." },
        { id: "M2_HIP_20", category: "행동 패턴", title: "환경 통제", content: "아늑하고 편안한 분위기를 선호합니다." },
        { id: "M2_HIP_21", category: "사회적 역동", title: "리더십", content: "서번트 리더십. 구성원을 살뜰히 챙깁니다." },
        { id: "M2_HIP_22", category: "사회적 역동", title: "팔로워십", content: "팀워크를 중시하며 궂은 일을 도맡아 합니다." },
        { id: "M2_HIP_23", category: "사회적 역동", title: "갈등 해결", content: "무조건 양보하거나 좋은 게 좋은 거라고 덮습니다." },
        { id: "M2_HIP_24", category: "사회적 역동", title: "대화법", content: "공감적, 우회적, 부드러운 말투." },
        { id: "M2_HIP_25", category: "사회적 역동", title: "걸림돌", content: "거절하지 못해 이용당하거나 번아웃이 옵니다." },
        { id: "M2_HIP_26", category: "사회적 역동", title: "파트너", content: "자신을 보호해주고 결정을 대신해줄 강한 리더." },
        { id: "M2_HIP_27", category: "임상 솔루션", title: "미션", content: "하루에 한 번, 명확하게 'No'라고 말하기." },
        { id: "M2_HIP_28", category: "임상 솔루션", title: "로드맵", content: "자신의 욕구를 표현하는 것이 관계를 해치지 않음을 깨닫기." },
        { id: "M2_HIP_29", category: "임상 솔루션", title: "확언", content: "나를 돌보는 것이 타인을 돕는 첫걸음이다." },
        { id: "M2_HIP_30", category: "임상 솔루션", title: "질문", content: "내가 희생함으로써 얻고자 하는 것은 사랑인가?" }
    ],
    "LLA": [
        { id: "M2_LLA_01", category: "심층 분석", title: "핵심 욕구", content: "자신의 힘으로 상황을 장악하고 승리하는 것." },
        { id: "M2_LLA_02", category: "심층 분석", title: "두려움", content: "약해보이는 것, 통제당하는 것, 패배." },
        { id: "M2_LLA_03", category: "심층 분석", title: "그림자 자아", content: "'폭군'. 힘으로 모든 것을 깔아뭉개려는 잔혹함." },
        { id: "M2_LLA_04", category: "심층 분석", title: "방어 기제", content: "행동화. 불안하면 일단 저지르고 봅니다." },
        { id: "M2_LLA_05", category: "심층 분석", title: "자아 분열", content: "강해보이고 싶은 외면과 의존하고 싶은 내면." },
        { id: "M2_LLA_06", category: "심층 분석", title: "에너지 원천", content: "난관을 극복하고 성취를 이뤄냈을 때." },
        { id: "M2_LLA_07", category: "인지 프로세스", title: "정보 처리", content: "본능적으로 힘의 우위를 파악합니다." },
        { id: "M2_LLA_08", category: "인지 프로세스", title: "의사결정", content: "직관적이고 즉각적입니다. 생각보다 행동이 앞섭니다." },
        { id: "M2_LLA_09", category: "인지 프로세스", title: "인지 오류", content: "일방적 사고. 내 입장이 곧 진실이라고 믿습니다." },
        { id: "M2_LLA_10", category: "인지 프로세스", title: "몰입", content: "경쟁, 승부, 위기 상황 해결." },
        { id: "M2_LLA_11", category: "인지 프로세스", title: "학습", content: "실전을 통해 몸으로 부딪히며 배웁니다." },
        { id: "M2_LLA_12", category: "인지 프로세스", title: "창의성", content: "막힌 길을 뚫어내는 돌파력에서 나옵니다." },
        { id: "M2_LLA_13", category: "인지 프로세스", title: "판단 속도", content: "가장 빠름. 망설임이 없습니다." },
        { id: "M2_LLA_14", category: "인지 프로세스", title: "직관 활용", content: "동물적인 감각을 믿고 따릅니다." },
        { id: "M2_LLA_15", category: "행동 패턴", title: "행동 특징", content: "목소리가 크고, 제스처가 크며, 공간을 장악합니다." },
        { id: "M2_LLA_16", category: "행동 패턴", title: "스트레스", content: "공격적이고 파괴적인 행동을 보입니다." },
        { id: "M2_LLA_17", category: "행동 패턴", title: "시간 관리", content: "급합니다. 모든 것이 당장 이루어져야 합니다." },
        { id: "M2_LLA_18", category: "행동 패턴", title: "소비", content: "과시적 소비, 혹은 충동적인 큰 지출." },
        { id: "M2_LLA_19", category: "행동 패턴", title: "휴식", content: "격렬한 운동이나 활동적인 취미." },
        { id: "M2_LLA_20", category: "행동 패턴", title: "환경 통제", content: "자기 마음대로 배치하고 바꿉니다." },
        { id: "M2_LLA_21", category: "사회적 역동", title: "리더십", content: "보스형. 나를 따르라." },
        { id: "M2_LLA_22", category: "사회적 역동", title: "팔로워십", content: "강한 자에게는 복종하지만 약한 리더는 무시합니다." },
        { id: "M2_LLA_23", category: "사회적 역동", title: "갈등 해결", content: "정면 돌파. 싸워서 이겨야 끝납니다." },
        { id: "M2_LLA_24", category: "사회적 역동", title: "대화법", content: "직설적, 명령조, 단호함." },
        { id: "M2_LLA_25", category: "사회적 역동", title: "걸림돌", content: "타인에게 상처를 주고도 모르는 둔감함." },
        { id: "M2_LLA_26", category: "사회적 역동", title: "파트너", content: "자신의 성격을 받아주는 유하고 침착한 사람." },
        { id: "M2_LLA_27", category: "임상 솔루션", title: "미션", content: "화가 날 때 10초 세고 말하기." },
        { id: "M2_LLA_28", category: "임상 솔루션", title: "로드맵", content: "힘이 아닌 덕으로 사람을 얻는 법을 배우십시오." },
        { id: "M2_LLA_29", category: "임상 솔루션", title: "확언", content: "진정한 강함은 부드러움에서 나온다." },
        { id: "M2_LLA_30", category: "임상 솔루션", title: "질문", content: "내가 이기려고 하는 대상은 적인가 동료인가?" }
    ],
    "LLP": [
        { id: "M2_LLP_01", category: "심층 분석", title: "핵심 욕구", content: "유능함을 증명하고 전문성을 인정받는 것." },
        { id: "M2_LLP_02", category: "심층 분석", title: "두려움", content: "무능해 보이는 것, 쓸모없는 사람이 되는 것." },
        { id: "M2_LLP_03", category: "심층 분석", title: "그림자 자아", content: "'기계'. 감정이 없는 로봇처럼 기능적 효율만 따지는 자아." },
        { id: "M2_LLP_04", category: "심층 분석", title: "방어 기제", content: "일 중독. 불안하면 일에 파묻혀 자신을 증명하려 합니다." },
        { id: "M2_LLP_05", category: "심층 분석", title: "자아 분열", content: "성공 지향적 자아와 휴식을 원하는 자아의 충돌." },
        { id: "M2_LLP_06", category: "심층 분석", title: "에너지 원천", content: "구체적인 성과를 내고 인정을 받았을 때." },
        { id: "M2_LLP_07", category: "인지 프로세스", title: "정보 처리", content: "실용성과 효율성 기준으로 정보를 분류합니다." },
        { id: "M2_LLP_08", category: "인지 프로세스", title: "의사결정", content: "목표 달성에 가장 유리한 쪽으로 합리적 결정을 내립니다." },
        { id: "M2_LLP_09", category: "인지 프로세스", title: "인지 오류", content: "목표가 수단을 정당화한다는 생각." },
        { id: "M2_LLP_10", category: "인지 프로세스", title: "몰입", content: "업무, 기술 연마, 커리어 계발." },
        { id: "M2_LLP_11", category: "인지 프로세스", title: "학습", content: "즉각적인 결과물이 나오는 실용적 학습." },
        { id: "M2_LLP_12", category: "인지 프로세스", title: "창의성", content: "기존 방식을 개선하여 효율을 높일 때." },
        { id: "M2_LLP_13", category: "인지 프로세스", title: "판단 속도", content: "빠름. 효율적이지 않은 것은 즉시 폐기합니다." },
        { id: "M2_LLP_14", category: "인지 프로세스", title: "직관 활용", content: "경험적 데이터를 바탕으로 한 실용적 직관." },
        { id: "M2_LLP_15", category: "행동 패턴", title: "행동 특징", content: "바쁘게 움직이며 항상 무언가를 하고 있습니다." },
        { id: "M2_LLP_16", category: "행동 패턴", title: "스트레스", content: "성과가 나오지 않으면 초조해하고 자신을 비난합니다." },
        { id: "M2_LLP_17", category: "행동 패턴", title: "시간 관리", content: "철저한 스케줄링. 시간 낭비를 죄악시합니다." },
        { id: "M2_LLP_18", category: "행동 패턴", title: "소비", content: "자신을 업그레이드할 수 있는 자기계발 투자." },
        { id: "M2_LLP_19", category: "행동 패턴", title: "휴식", content: "휴식도 '재충전'이라는 명목하의 업무입니다." },
        { id: "M2_LLP_20", category: "행동 패턴", title: "환경 통제", content: "최적의 작업 효율을 낼 수 있는 환경 세팅." },
        { id: "M2_LLP_21", category: "사회적 역동", title: "리더십", content: "실무형 리더. 솔선수범하여 성과를 보여줍니다." },
        { id: "M2_LLP_22", category: "사회적 역동", title: "팔로워십", content: "배울 점이 있는 유능한 리더를 선호합니다." },
        { id: "M2_LLP_23", category: "사회적 역동", title: "갈등 해결", content: "실리적으로 접근하여 타협점을 찾습니다." },
        { id: "M2_LLP_24", category: "사회적 역동", title: "대화법", content: "간결, 명확, 비즈니스적." },
        { id: "M2_LLP_25", category: "사회적 역동", title: "걸림돌", content: "일 중독으로 인한 인간관계 소홀." },
        { id: "M2_LLP_26", category: "사회적 역동", title: "파트너", content: "자신의 성공을 지원해주고 내조/외조해주는 사람." },
        { id: "M2_LLP_27", category: "임상 솔루션", title: "미션", content: "일주일에 하루는 아무 성과 없이 멍때리기." },
        { id: "M2_LLP_28", category: "임상 솔루션", title: "로드맵", content: "Being(존재)과 Doing(행위)을 분리하십시오." },
        { id: "M2_LLP_29", category: "임상 솔루션", title: "확언", content: "나는 성과와 무관하게 사랑받을 자격이 있다." },
        { id: "M2_LLP_30", category: "임상 솔루션", title: "질문", content: "일을 하지 않는 나는 누구인가?" }
    ],
    "LIA": [
        { id: "M2_LIA_01", category: "심층 분석", title: "핵심 욕구", content: "특별한 존재가 되고 싶은 욕구, 자아 실현." },
        { id: "M2_LIA_02", category: "심층 분석", title: "두려움", content: "평범해지는 것, 감정적으로 단절되는 것." },
        { id: "M2_LIA_03", category: "심층 분석", title: "그림자 자아", content: "'비련의 주인공'. 자신의 고통에 심취하는 자아." },
        { id: "M2_LIA_04", category: "심층 분석", title: "방어 기제", content: "내사. 외부의 문제를 자신의 탓으려 돌리며 우울해합니다." },
        { id: "M2_LIA_05", category: "심층 분석", title: "자아 분열", content: "특별한 이상적 자아와 초라한 현실 자아의 괴리." },
        { id: "M2_LIA_06", category: "심층 분석", title: "에너지 원천", content: "깊은 감정적 교류, 예술적 영감." },
        { id: "M2_LIA_07", category: "인지 프로세스", title: "정보 처리", content: "주관적 의미와 상징을 중심으로 해석합니다." },
        { id: "M2_LIA_08", category: "인지 프로세스", title: "의사결정", content: "기분과 감정에 따라 결정이 오락가락합니다." },
        { id: "M2_LIA_09", category: "인지 프로세스", title: "인지 오류", content: "감정적 추론. 내가 슬프니 상황이 절망적이라고 믿습니다." },
        { id: "M2_LIA_10", category: "인지 프로세스", title: "몰입", content: "예술, 창작, 자기 탐구." },
        { id: "M2_LIA_11", category: "인지 프로세스", title: "학습", content: "감동을 주거나 영감을 주는 스승에게 배웁니다." },
        { id: "M2_LIA_12", category: "인지 프로세스", title: "창의성", content: "개인적인 고통을 보편적인 예술로 승화할 때." },
        { id: "M2_LIA_13", category: "인지 프로세스", title: "판단 속도", content: "변덕스러움. 순식간에 바뀌기도 하고 오래 끌기도 합니다." },
        { id: "M2_LIA_14", category: "인지 프로세스", title: "직관 활용", content: "영감과 꿈 등 무의식적 메시지를 중시합니다." },
        { id: "M2_LIA_15", category: "행동 패턴", title: "행동 특징", content: "개성 있는 옷차림, 감성적인 표현." },
        { id: "M2_LIA_16", category: "행동 패턴", title: "스트레스", content: "감정 기복이 심해지고 히스테릭해질 수 있습니다." },
        { id: "M2_LIA_17", category: "행동 패턴", title: "시간 관리", content: "기분에 따라 들쑥날쑥합니다." },
        { id: "M2_LIA_18", category: "행동 패턴", title: "소비", content: "자신의 취향을 표현하는 유니크한 아이템 구매." },
        { id: "M2_LIA_19", category: "행동 패턴", title: "휴식", content: "음악 감상, 산책, 일기 쓰기." },
        { id: "M2_LIA_20", category: "행동 패턴", title: "환경 통제", content: "자신의 감성을 담은 공간 꾸미기." },
        { id: "M2_LIA_21", category: "사회적 역동", title: "리더십", content: "영감형 리더. 정서적 호소력으로 이끕니다." },
        { id: "M2_LIA_22", category: "사회적 역동", title: "팔로워십", content: "자신의 독특함을 인정해주는 리더를 따릅니다." },
        { id: "M2_LIA_23", category: "사회적 역동", title: "갈등 해결", content: "감정적으로 호소하거나 삐져서 잠적합니다." },
        { id: "M2_LIA_24", category: "사회적 역동", title: "대화법", content: "감성적, 주관적, 자기중심적." },
        { id: "M2_LIA_25", category: "사회적 역동", title: "걸림돌", content: "과도한 자의식과 감정 과잉." },
        { id: "M2_LIA_26", category: "사회적 역동", title: "파트너", content: "자신의 감정을 섬세하게 읽어주고 공감해주는 소울메이트." },
        { id: "M2_LIA_27", category: "임상 솔루션", title: "미션", content: "감정에서 빠져나와 객관적인 사실 하나만 보기." },
        { id: "M2_LIA_28", category: "임상 솔루션", title: "로드맵", content: "평범함 속의 비범함을 발견하는 눈을 기르십시오." },
        { id: "M2_LIA_29", category: "임상 솔루션", title: "확언", content: "내 감정은 나 자신이 아니다." },
        { id: "M2_LIA_30", category: "임상 솔루션", title: "질문", content: "나는 특별해지려 하는가, 아니면 진실해지려 하는가?" }
    ],
    "LIP": [
        { id: "M2_LIP_01", category: "심층 분석", title: "핵심 욕구", content: "내면의 안정을 지키고 침해받지 않는 것. 요구와 간섭이 없는 상태에서만 에너지가 회복되며, 그 경계가 무너질 때 강한 불안을 느낍니다." },
        { id: "M2_LIP_02", category: "심층 분석", title: "두려움", content: "세상의 압력, 갈등, 평온이 깨지는 것. 그래서 '참여'보다 '거리 두기'를 선택하고, 기대와 요구가 쏟아지는 상황을 회피하려 합니다." },
        { id: "M2_LIP_03", category: "심층 분석", title: "그림자 자아", content: "'게으름뱅이'. 아무것도 하지 않고 흘러가고 싶은 타성. 움직이지 않음이 안전이라 믿는 만큼, 작은 행동 개시가 가장 어려운 과제가 됩니다." },
        { id: "M2_LIP_04", category: "심층 분석", title: "방어 기제", content: "마비. 스트레스를 받으면 멍해지거나 잠을 잡습니다. 감정을 처리하지 않고 꺼두거나 미루는 방식이 습관화되면, 행동력이 더 떨어질 수 있습니다." },
        { id: "M2_LIP_05", category: "심층 분석", title: "자아 분열", content: "세상과 연결되고 싶은 마음과 귀찮은 마음의 충돌." },
        { id: "M2_LIP_06", category: "심층 분석", title: "에너지 원천", content: "아무런 요구도 없는 상태에서의 완전한 휴식." },
        { id: "M2_LIP_07", category: "인지 프로세스", title: "정보 처리", content: "수동적으로 수용하며 거름망 없이 흘려보냅니다." },
        { id: "M2_LIP_08", category: "인지 프로세스", title: "의사결정", content: "결정을 미루거나 흐름에 맡깁니다." },
        { id: "M2_LIP_09", category: "인지 프로세스", title: "인지 오류", content: "체념. 어차피 해도 안 된다는 생각." },
        { id: "M2_LIP_10", category: "인지 프로세스", title: "몰입", content: "반복적인 단순 작업, 혹은 공상." },
        { id: "M2_LIP_11", category: "인지 프로세스", title: "학습", content: "강요하지 않는 편안한 분위기에서 서서히 습득." },
        { id: "M2_LIP_12", category: "인지 프로세스", title: "창의성", content: "무심코 툭 던진 생각에서 획기적인 것이 나옵니다." },
        { id: "M2_LIP_13", category: "인지 프로세스", title: "판단 속도", content: "느림. 애써 판단하려 들지 않습니다." },
        { id: "M2_LIP_14", category: "인지 프로세스", title: "직관 활용", content: "본능적인 감각이 발달해 있으나 무시하곤 합니다." },
        { id: "M2_LIP_15", category: "행동 패턴", title: "행동 특징", content: "움직임을 최소화하고 느릿느릿합니다." },
        { id: "M2_LIP_16", category: "행동 패턴", title: "스트레스", content: "고집불통이 되어 요지부동 자세를 취합니다." },
        { id: "M2_LIP_17", category: "행동 패턴", title: "시간 관리", content: "느긋합니다. 시간에 쫓기는 것을 싫어합니다." },
        { id: "M2_LIP_18", category: "행동 패턴", title: "소비", content: "꼭 필요한 것만 최소한으로 소비합니다." },
        { id: "M2_LIP_19", category: "행동 패턴", title: "휴식", content: "하루 종일 누워있기, TV 시청." },
        { id: "M2_LIP_20", category: "행동 패턴", title: "환경 통제", content: "변화를 싫어하며 익숙한 것을 고집합니다." },
        { id: "M2_LIP_21", category: "사회적 역동", title: "리더십", content: "조정한형 리더. 갈등을 중재하고 평화를 만듭니다." },
        { id: "M2_LIP_22", category: "사회적 역동", title: "팔로워십", content: "시키지 않아도 묵묵히 제 할 일을 합니다." },
        { id: "M2_LIP_23", category: "사회적 역동", title: "갈등 해결", content: "수동 공격. 겉으론 동의하고 뒤에선 안 합니다." },
        { id: "M2_LIP_24", category: "사회적 역동", title: "대화법", content: "수용적, 단답형, 침묵." },
        { id: "M2_LIP_25", category: "사회적 역동", title: "걸림돌", content: "지나친 수동성으로 인한 답답함 유발." },
        { id: "M2_LIP_26", category: "사회적 역동", title: "파트너", content: "나를 움직이게 자극해주는 활기찬 사람." },
        { id: "M2_LIP_27", category: "임상 솔루션", title: "미션", content: "생각나면 3초 안에 몸을 일으키기." },
        { id: "M2_LIP_28", category: "임상 솔루션", title: "로드맵", content: "자신의 목소리를 내고 세상에 영향력을 미치십시오." },
        { id: "M2_LIP_29", category: "임상 솔루션", title: "확언", content: "나의 행동은 세상에 변화를 만든다." },
        { id: "M2_LIP_30", category: "임상 솔루션", title: "질문", content: "내가 평화라고 믿는 것이 사실은 도피가 아닌가?" }
    ]
};

// --- 유형별 시스템 해석 (도면용 2~3문장) ---
const MODULE2_SYSTEM_SUMMARY: Record<AnalysisType, string> = {
    "HLA": "이 유형은 **입력·처리·출력**이 모두 높은 축에 있어, 외부 정보를 넓게 받아들이고 논리로 정리한 뒤 주도적으로 실행합니다. '통제와 질서'를 통해 불안을 다스리며, 그만큼 주도권 상실과 무력감을 가장 경계합니다. 시스템 도면으로 보면, '모든 변수를 내가 설계해야 안전하다'는 전제가 동작의 핵심입니다.",
    "HLP": "넓게 수용(입력)하고 냉철하게 분석(처리)하지만, 행동(출력)은 신중하게 잡는 유형입니다. '확실할 때만 움직인다'는 전략이 장점이자 함정이 되어, 관찰자에 머무르는 시간이 길어질 수 있습니다. 도면상으로는 **정보→판단** 구간은 발달해 있으나 **실행** 구간이 억제되어 있는 구조입니다.",
    "HIA": "입력과 출력이 높고 처리(원칙·규칙)는 유연합니다. 직관과 행동이 강하게 연결되어 '일단 움직이면서 맞춘다'는 스타일이며, 반복·지루함·구속을 견디기 어렵습니다. 시스템은 **탐험과 실행**에 최적화되어 있고, '끝맺음'과 '일관성'은 의도적으로 보강할 필요가 있습니다.",
    "HIP": "입력을 넓게 받아들이고, 처리·출력은 부드럽게 조율하는 유형입니다. 갈등보다 조화, 결론보다 관계를 중시하며, 타인의 감정에 쉽게 공명합니다. 도면상 **연결과 수용**이 강하고, '나 하나 희생해도 평화면 된다'는 전제가 내면에 있어, 경계 설정이 재설계 포인트입니다.",
    "LLA": "입력은 선택적(필요한 것만), 처리와 출력은 강하게 밀어붙이는 구조입니다. 원칙과 신념에 따라 단호하게 행동하며, 간섭과 타협을 싫어합니다. '내가 옳다'는 확신이 시스템의 중심이므로, **정보의 다양성**과 **타인 시각 수용**을 의도적으로 넣으면 균형이 잡힙니다.",
    "LLP": "입력·처리 모두 선택적이고 집중적이며, 출력은 낮아 행동보다 관찰·분석에 머무릅니다. 전문성과 완벽을 추구하나, 불확실할 때는 움직이지 않는 편입니다. 도면상 **깊이**는 있으나 **외부로의 방출**이 적어, '70% 확신이면 실행'이 재설계 레버입니다.",
    "LIA": "입력은 선택적, 처리(직관)는 빠르고, 출력은 높아 '판단은 간단히, 행동은 과감히'입니다. 복잡한 분석보다 감각과 타협을 믿으며, 위기 시 빠르게 대응합니다. **반응 속도**가 강점이나, 충동과 일관성 부족이 그림자이므로 '한 번 멈추기'가 도면에 추가할 습관입니다.",
    "LIP": "입력·처리·출력이 모두 '에너지 절약' 쪽에 가깝게 설계된 유형입니다. 외부 요구를 최소화하고, 내면의 평온을 지키려 하며, 행동은 필요 최소한으로 유지합니다. **안정과 휴식**이 시스템의 핵심 가치이나, 그 경계가 지나치면 '도피'와 '마비'로 고착될 수 있어, '작은 행동 개시'가 재설계의 첫 단계입니다.",
};

const CATEGORY_FOCUS: Record<ResultItem["category"], string> = {
    "심층 분석": "내면의 동기와 방어가 드러나는 구간",
    "인지 프로세스": "정보 처리와 판단의 규칙이 굳어지는 구간",
    "행동 패턴": "행동 루틴이 결과를 고정하는 구간",
    "사회적 역동": "관계에서 역할이 고착되는 구간",
    "임상 솔루션": "행동을 재설계하는 실행 구간",
};

const TYPE_PROFILES: Record<AnalysisType, {
    observation: string;
    mechanism: string;
    adjustment: string;
    survival: string;
}> = {
    HLA: {
        observation: "지시와 점검으로 질서를 유지하며, 불확실성이 커질수록 통제 강도가 상승합니다.",
        mechanism: "불안이 커질수록 뇌가 ‘통제’를 안전장치로 쓰면서, 규칙과 점검이 과해집니다.",
        adjustment: "잠재력 = 실행력 − 방해 요인에서 간섭은 과잉 통제입니다. 결정 기준 2가지만 남기고 위임 비율을 30%까지 올려 간섭을 줄이십시오.",
        survival: "혼란 속에서 질서를 세우려는 생존 전략이었습니다.",
    },
    HLP: {
        observation: "관찰과 분석에 몰입하며, 결정을 미루는 시간이 길어질수록 실행 에너지가 줄어듭니다.",
        mechanism: "정보 수집이 안정감을 주다 보니, 행동 전환이 늦어지는 경향이 생깁니다.",
        adjustment: "잠재력 = 실행력 − 방해 요인에서 간섭은 과잉 분석입니다. 70% 정보에서 프로토타입을 실행하고, 실행 후 피드백 1개만 수집해 루프를 닫으십시오.",
        survival: "실수와 손상을 피하려는 생존 전략으로 굳어졌습니다.",
    },
    HIA: {
        observation: "흥미와 자극이 높을 때 급가속하며, 마무리 국면에서 속도가 급격히 떨어집니다.",
        mechanism: "새로움에 반응하는 보상 신호가 강하고, 반복 구간에서는 동력이 급격히 약해집니다.",
        adjustment: "잠재력 = 실행력 − 방해 요인에서 간섭은 흥분의 소실입니다. 시작 전에 종료 조건 1개를 고정하고, 중간 이탈을 막는 체크포인트 2개를 배치하십시오.",
        survival: "정체를 피하고 기회를 쫓는 생존 전략이었습니다.",
    },
    HIP: {
        observation: "관계의 균형을 우선하며 갈등을 피하려다 의사결정이 흐려집니다.",
        mechanism: "타인의 반응을 먼저 살피는 습관이 강해, 갈등 신호가 나오면 회피 쪽으로 기울어집니다.",
        adjustment: "잠재력 = 실행력 − 방해 요인에서 간섭은 과도한 조율입니다. 요청을 받을 때 ‘예/아니오/보류’ 중 하나를 10초 안에 선택해 결정 지연을 끊으십시오.",
        survival: "관계를 지키기 위한 생존 전략이었습니다.",
    },
    LLA: {
        observation: "불필요한 입력을 차단하고 목표에 직진하며, 반대가 생기면 강하게 밀어붙입니다.",
        mechanism: "위협을 느끼면 ‘빠른 결정’이 안전장치가 되어 타협 신호가 약해집니다.",
        adjustment: "잠재력 = 실행력 − 방해 요인에서 간섭은 강압과 단절입니다. 반대 의견 1개를 요약해 재진술한 뒤 실행을 재개해 마찰 비용을 낮추십시오.",
        survival: "위기에서 빠르게 장악하려는 생존 전략이었습니다.",
    },
    LLP: {
        observation: "성과 기준이 높고 검증에 몰입하며, 실행보다 완성도를 우선합니다.",
        mechanism: "오류를 피하려는 습관이 강해, 실행 전환이 늦어지는 경향이 있습니다.",
        adjustment: "잠재력 = 실행력 − 방해 요인에서 간섭은 완벽주의입니다. 산출물의 1차 버전을 48시간 안에 공개해 피드백 루프를 강제로 시작하십시오.",
        survival: "실패를 줄이기 위한 생존 전략으로 굳어졌습니다.",
    },
    LIA: {
        observation: "판단은 빠르고 행동은 강하지만, 변동성이 커서 일관성이 흔들립니다.",
        mechanism: "즉각 반응이 보상으로 연결되어, 멈추고 점검하는 시간이 줄어듭니다.",
        adjustment: "잠재력 = 실행력 − 방해 요인에서 간섭은 충동입니다. 결정 직후 90초 정지 규칙을 넣고, 실행 전에 ‘리스크 1개/완충 1개’를 기록하십시오.",
        survival: "빠른 대응으로 살아남아야 했던 전략의 흔적입니다.",
    },
    LIP: {
        observation: "에너지 절약을 최우선으로 두고 최소 행동을 유지하며, 외부 요구를 회피합니다.",
        mechanism: "자극이 많을 때 불안을 느껴, 뇌가 ‘정지’ 쪽을 안전한 선택으로 굳혀 버립니다.",
        adjustment: "잠재력 = 실행력 − 방해 요인에서 간섭은 정지 상태입니다. 하루 3회 ‘3초 행동’을 강제로 넣어 개시 저항을 분산시키십시오.",
        survival: "과자극 환경에서 자신을 보호하던 생존 전략이었습니다.",
    },
};

/** 점수 구간별 입력/처리/출력 한 줄 해석 (리포트 상단용) */
function interpretMetric(score: number, kind: "input" | "processing" | "output"): string {
    const high = score >= 65;
    const low = score <= 35;
    if (kind === "input") {
        if (high) return "외부 자극을 적극 수용하며, 타인의 감정과 변화를 예민하게 감지합니다.";
        if (low) return "필요한 정보에만 집중하고 불필요한 노이즈를 차단하는 편입니다.";
        return "상황에 따라 정보를 받아들이거나 걸러내는 조절이 가능합니다.";
    }
    if (kind === "processing") {
        if (high) return "데이터와 원칙을 중시하며, 확실한 계획이 있을 때 안정을 느낍니다.";
        if (low) return "고정된 규칙보다 상황에 맞는 답을 직관적으로 찾는 편입니다.";
        return "원칙은 지키되 상황이 바뀌면 유연하게 대처합니다.";
    }
    if (kind === "output") {
        if (high) return "상황을 이끌고 먼저 행동하는 리더형에 가깝습니다.";
        if (low) return "흐름을 지켜보며 안전한 타이밍에 움직이는 편입니다.";
        return "필요하면 리더가 되고, 아니면 조용히 제 몫을 합니다.";
    }
    return "";
}

export function getModule2SystemSummary(typeCode: string): string {
    return MODULE2_SYSTEM_SUMMARY[typeCode as AnalysisType] ?? "이 유형의 대인 행동 시스템이 어떻게 작동하는지, 아래 심층 분석과 실행 가이드를 통해 재설계의 단서를 찾을 수 있습니다.";
}

export function getModule2MetricInterpretation(input: number, processing: number, output: number): string {
    const i = interpretMetric(Math.round(input), "input");
    const p = interpretMetric(Math.round(processing), "processing");
    const o = interpretMetric(Math.round(output), "output");
    return `**입력** ${i}\n\n**처리** ${p}\n\n**출력** ${o}`;
}

// --- Logic Helpers ---

export function getModule2Content(code: string): ResultItem[] {
    const items = DATA[code as AnalysisType] || DATA["HLA"];
    const profile = TYPE_PROFILES[code as AnalysisType] ?? TYPE_PROFILES.HLA;
    return items.map((item) => {
        // 임상 솔루션은 원문 그대로 유지 (미션/로드맵/확언/질문)
        if (item.category === "임상 솔루션") return item;
        // 나머지 카테고리: 원문 + 맥락 보충 (자연스러운 문장)
        const contextLine = `이 패턴은 ${profile.survival} ${profile.adjustment}`;
        return { ...item, content: `${item.content}\n\n${contextLine}` };
    });
}

export function determineTypeCode(scores: { p: number, a: number, sd: number }): AnalysisType {
    const { p, a, sd } = scores;
    const hInput = (100 - sd + a) / 2 >= 50;
    const hProcess = (p + 100 - a) / 2 >= 50;
    const hOutput = p >= 50;

    const key = `${hInput ? 'H' : 'L'}${hProcess ? 'L' : 'I'}${hOutput ? 'A' : 'P'}`;
    return key as AnalysisType;
}

export function getKoreanTypeName(code: string): string {
    return TYPE_DISPLAY_NAMES[code as AnalysisType] || "알 수 없는 유형";
}
