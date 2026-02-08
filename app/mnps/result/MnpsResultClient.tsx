"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { Trophy, Skull } from "lucide-react";
import { parseMarkdown } from "@/lib/utils/parseMarkdown";
import DisclaimerBanner from "./DisclaimerBanner";

/** API 또는 sessionStorage에서 오는 결과 타입 */
type MnpsResultData = {
  archetype?: string;
  dTotal?: number;
  rawDTotal?: number;
  isExtremeTop?: boolean;
  traitScores?: {
    machiavellianism?: number;
    narcissism?: number;
    psychopathy?: number;
    sadism?: number;
  };
  analysisAccuracy?: number;
  responseTimePenalty?: boolean;
  insincereResponsePattern?: boolean;
  percentileAtCreation?: number;
  goodReport?: string | null;
  badReport?: string | null;
  badTeaser?: string | null;
  radarChartData?: { label?: string; value?: number }[] | null;
};

const MIN_REPORT_CHARS = 2000;

/** good/bad 리포트가 최소 2천 자 미만이면 추가 심화 문단을 붙여 2천 자 이상으로 맞춤 */
function ensureMinLength(
  text: string,
  type: "good" | "bad"
): string {
  if (!text || text.length >= MIN_REPORT_CHARS) return text;
  const goodPad =
    "\n\n---\n\n### 추가 심화 해석\n\n" +
    "본 프로파일은 다크 테트라드(마키아벨리즘·나르시시즘·사이코패시·가학성)와 D요인(일반적 어두운 성향: 이기주의·권리의식·도덕적 이탈·악의성)을 종합하여 산출되었습니다. " +
    "엘리트 뷰는 당신의 전략적·실행적 강점을 강조하며, 고위험·고수익 환경에서의 활용 가능성을 해석합니다. " +
    "실제 의사결정에서는 규칙과 신뢰를 지키는 쪽으로 에너지를 쓰는지, 단기 이익과 조작에 쓰는지에 따라 결과가 달라집니다. " +
    "정기적으로 \"지금 나는 누구의 신뢰를 쓰고 있는가\", \"이 선택이 5년 후 어떤 관계를 남기는가\"를 점검하는 습관이 장기적 영향력을 높입니다. " +
    "낮은 강도는 \"없다\"가 아니라 \"잠재적·선택적\"이라는 뜻이며, 통제된 상태에서 유연성으로 작동할 수 있습니다. " +
    "조직의 최상위 의사결정, M&A·인수합병, 규제와 리스크가 복잡한 사업, 공공 정책 설계 같은 영역에서 이 프로파일은 핵심 자산으로 작용할 수 있으며, " +
    "상대방의 감정과 이해관계를 변수로 읽어 내고 장기 게임을 설계하는 능력은 소수의 엘리트만이 가진 재능입니다. " +
    "위기·구조조정·갈등 국면에서는 냉정함이 팀의 나침반이 되고, 일상의 협업·멘토링·감정적 지지가 필요한 순간에는 선택적 개입과 역할 분리가 효과적입니다.";
  const badPad =
    "\n\n---\n\n### 추가 리스크 심화\n\n" +
    "본 프로파일은 사회적·윤리적 관점에서 잠재적 위험과 갈등 요인을 직접적으로 다룹니다. " +
    "높은 Dark Nature 점수는 특정 상황에서 타인에게 해를 끼치거나 신뢰를 손상시킬 위험이 있으며, 한 번 무너진 신뢰는 복구가 거의 불가능합니다. " +
    "법의 테두리 안에서도 불공정 거래, 정보 비대칭, 정서적 착취는 평판과 협력을 파괴합니다. " +
    "의사결정 전에 \"이것이 공개되면 나는 어떻게 설명할 수 있을까?\"를 스스로에게 묻는 습관을 권합니다. " +
    "이 리포트는 당신을 규정하기 위한 것이 아니라, 에너지의 방향을 인식하고 \"언제 멈출 것인가\"를 선택하는 데 활용하시기 바랍니다. " +
    "관계 측면에서는 신뢰가 한 번에 쌓이지 않으며, 핵심 관계(파트너, 동료, 가족)에서는 \"지금 내가 무엇을 숨기고 있는가\"를 꼭 점검하시기 바랍니다. " +
    "장기적으로는 진심을 보여 준 사람만이 위기 때 곁에 남으며, 법·윤리 측면에서 \"합법적\"인 선과 \"도덕적\"인 선은 다르다는 점을 인식하시기 바랍니다.";
  return text + (type === "good" ? goodPad : badPad);
}

const stripBold = (s: string) => s.replace(/\*\*/g, "");

/** good 하이라이트 중 특정 문장을 소제목+하위 콘텐츠로 확장 */
const GOOD_HIGHLIGHT_SUBTOPICS: {
  match: (h: string) => boolean;
  title: string;
  content: string;
}[] = [
  {
    match: (h) => /탁월한 전략적 실행력|전략적 실행력/.test(stripBold(h)),
    title: "탁월한 전략적 실행력: 목표 달성을 위해 자원을 효율적으로 배치하고 정치적 흐름을 읽는 능력이 뛰어납니다.",
    content:
      "제한된 자원과 복잡한 이해관계 속에서 목표에 맞는 우선순위를 정하고, 사람과 정보를 적재적소에 배치하는 능력이 뛰어납니다. " +
      "조직의 비공식적 권력 구조와 정치적 흐름을 읽어 내어, 실행 단계에서 발생할 저항과 기회를 미리 고려할 수 있습니다. " +
      "이런 전략적 실행력은 M&A, 구조조정, 신규 사업 추진처럼 자원 재배치가 중요한 국면에서 핵심 자산이 됩니다. " +
      "목표와 수단의 정합성을 유지하고, 장기적 신뢰를 훼손하지 않는 선에서 활용할 때 지속 가능한 성과로 이어집니다.",
  },
  {
    match: (h) => /전략적 판단력/.test(stripBold(h)),
    title: "복잡한 인간관계와 조직 내 정치 상황을 읽어내는 전략적 판단력이 뛰어납니다.",
    content:
      "표면적인 말과 실제 의도, 공식 구조와 비공식 동맹을 구분하며 상황을 판단하는 능력이 있습니다. " +
      "누가 어떤 동기로 움직이는지, 어떤 제약과 기회가 있는지를 읽어 내어, 개입 시점과 방식을 선택할 수 있습니다. " +
      "이 판단력은 협상·영향력 발휘·갈등 조정이 필요한 상황에서 유리하게 작용하며, " +
      "단기 이익만이 아니라 관계와 평판을 고려한 선택을 할 때 더욱 효과적입니다.",
  },
  {
    match: (h) => /적응력/.test(stripBold(h)),
    title: "상황에 맞는 유연한 접근 방식을 취할 수 있는 적응력을 보입니다.",
    content:
      "변화하는 환경과 요구에 맞춰 전략과 행동을 조정할 수 있는 능력이 뛰어납니다. " +
      "고정된 방식에 매이기보다 상황을 읽고 필요한 만큼 유연하게 대응하며, " +
      "다양한 이해관계와 제약 조건 안에서도 실질적인 결과를 만들어 내는 데 강점이 있습니다. " +
      "이 적응력은 단순한 수동적 순응이 아니라, 목표를 유지하면서 수단과 경로를 유연하게 바꾸는 전략적 유연성으로 이해할 수 있습니다.",
  },
  {
    match: (h) => /강력한 자기 확신과 리더십|강한 자기 확신과 리더십 잠재력/.test(stripBold(h)),
    title: "스스로를 믿고 앞으로 밀어붙일 수 있는 강한 자기 확신과 리더십 잠재력이 있습니다.",
    content:
      "자신의 판단과 방향에 대한 확신이 있어, 불확실한 상황에서도 결정을 내리고 팀을 이끌어 나갈 수 있는 기반이 됩니다. " +
      "이런 자기 확신은 위기나 반대 의견이 있을 때도 침착하게 목표를 설명하고 동기를 부여하는 데 도움이 됩니다. " +
      "리더십 잠재력은 권위가 아니라 영향력과 설득으로 사람들을 움직일 때 발휘되며, " +
      "타인의 의견을 경청하고 필요 시 방향을 수정할 여지를 남겨 두면 지속 가능한 리더십으로 자리 잡습니다.",
  },
  {
    match: (h) => /건강한 자존감|자기 가치/.test(stripBold(h)),
    title: "자기 가치를 인정하고 목표를 향해 나아가는 건강한 자존감을 보입니다.",
    content:
      "자신의 가치와 능력을 현실적으로 인정하면서도 과도한 자기 과시나 타인 비하에 의존하지 않습니다. " +
      "목표를 설정하고 그에 맞춰 꾸준히 나아가는 모습은 내적 기준이 분명하고, " +
      "실패나 비판을 경험해도 회복력 있게 대처할 수 있는 기반이 됩니다. " +
      "이런 자존감은 관계와 협업에서도 건설적인 역할을 하며, 상대방을 존중하는 태도와 균형을 이룹니다.",
  },
  {
    match: (h) => /압박 상황에서의 뛰어난 침착함|위험을 감수하고 빠르게 결단/.test(stripBold(h)),
    title: "압박 상황에서도 감정에 휘둘리지 않고 빠르게 결단하는 실행력을 보입니다.",
    content:
      "위기나 시간 압박이 있는 상황에서도 감정보다 상황 판단에 집중하여 결정을 내리는 편입니다. " +
      "위험을 인식하면서도 필요하다면 감수하고 행동으로 옮기는 실행력이 있으며, " +
      "이 특성은 긴급 대응, 협상, 경쟁 국면에서 강점이 됩니다. " +
      "중요한 것은 단기 결과뿐 아니라 관계와 윤리적 경계를 함께 고려하는 것이며, 팀과의 신뢰를 유지할 때 장기적으로 더 큰 영향력을 발휘합니다.",
  },
  {
    match: (h) => /모험적 정신|새로운 도전/.test(stripBold(h)),
    title: "새로운 도전을 두려워하지 않고 모험적 정신을 지니고 있습니다.",
    content:
      "익숙한 영역을 벗어난 도전과 불확실성을 기회로 받아들이는 경향이 있습니다. " +
      "실패 가능성을 인정하면서도 시도하는 것을 마다하지 않으며, " +
      "새로운 환경·역할·과제에서 학습하고 성과를 내는 데 에너지를 씁니다. " +
      "이 모험적 정신은 혁신과 성장을 이끄는 동력이 되며, 위험을 관리할 줄 아는 판단력과 결합될 때 더욱 효과적입니다.",
  },
  {
    match: (h) => /지배적인 영향력과 회복탄력성|강한 승부욕/.test(stripBold(h)),
    title: "경쟁 상황에서 뒤로 물러서지 않고, 상대보다 앞서가려는 강한 승부욕을 지니고 있습니다.",
    content:
      "갈등이나 경쟁이 있는 상황에서 위축되기보다는 오히려 에너지를 얻고, 영향력을 발휘하여 결과를 이끌어 내려는 경향이 있습니다. " +
      "좌절이나 반대에 부딪혀도 빠르게 회복하고 다시 나서는 회복탄력성이 있으며, " +
      "이 특성은 영업·경쟁 입찰·위기 관리 같은 국면에서 강점이 됩니다. " +
      "승부욕이 팀의 목표와 공정한 규칙 안에서 발휘될 때, 지속 가능한 성과와 리더십으로 이어집니다.",
  },
  {
    match: (h) => /적극적이고 단호한 태도|경쟁 상황/.test(stripBold(h)),
    title: "경쟁 상황에서 적극적이고 단호한 태도를 보입니다.",
    content:
      "경쟁이나 압박이 있는 상황에서 주도적으로 나서고 명확한 방향을 제시하는 편입니다. " +
      "우유부단함보다는 결정을 내리고 실행에 옮기는 데 거리낌이 없으며, " +
      "목표 달성을 위해 필요한 경우 단호한 선택과 커뮤니케이션을 할 수 있습니다. " +
      "이 태도는 팀의 방향을 잡거나 협상·경쟁 국면에서 강점이 되며, 공정성과 투명성을 유지할 때 지속 가능한 리더십으로 이어집니다.",
  },
  {
    match: (h) => /자기주도성/.test(stripBold(h)),
    title: "자신의 목표와 이익을 명확히 인식하고 추진하는 자기주도성이 강합니다.",
    content:
      "자신이 원하는 결과와 그에 필요한 행동을 스스로 설정하고 추진하는 편입니다. " +
      "외부의 인정이나 지시를 기다리기보다는 목표를 정한 뒤 단계적으로 실행에 옮기며, " +
      "이 특성은 창업·신규 사업·주도적 역할 수행에서 강점이 됩니다. " +
      "자기주도성이 타인의 기여와 협력을 인정하는 태도와 결합될 때, 팀과 조직 안에서도 효과적으로 발휘됩니다.",
  },
  {
    match: (h) => /자기 확신/.test(stripBold(h)),
    title: "자신의 가치를 높게 평가하고 적절한 보상을 기대하는 자기 확신을 보입니다.",
    content:
      "자신의 기여와 가치에 대한 인식이 분명하여, 그에 걸맞은 역할과 보상을 요구하는 데 거리낌이 적습니다. " +
      "이 확신은 협상이나 연봉·역할 논의에서 자신의 입장을 분명히 하는 데 도움이 되며, " +
      "과도하지 않은 선에서 발휘될 때 관계와 협업을 해치지 않으면서도 경계를 지키는 데 기여합니다. " +
      "상대방의 가치와 기여도 함께 인정할 때, 자기 확신은 건설적인 자기주장으로 자리 잡습니다.",
  },
  {
    match: (h) => /균형 잡힌 자기 보호 전략/.test(stripBold(h)),
    title: "극단적인 성향보다는 균형 잡힌 자기 보호 전략을 사용하려는 경향이 보입니다.",
    content:
      "자신을 지키되 상대를 무너뜨리기보다는, 상황에 맞는 방어와 협력의 균형을 추구하는 편입니다. " +
      "완전한 경쟁이나 완전한 양보가 아니라, 필요한 만큼 단호하게 하고 필요한 만큼 양보하는 전략을 택할 수 있으며, " +
      "이런 균형은 장기적인 관계와 신뢰를 유지하는 데 유리합니다. " +
      "자기 보호와 협력 사이의 선을 의식적으로 조정하는 습관이 있으면, 다양한 상황에서 더 안정적으로 대처할 수 있습니다.",
  },
];

function formatGoodHighlight(h: string): string {
  const subtopic = GOOD_HIGHLIGHT_SUBTOPICS.find((s) => s.match(h));
  if (subtopic) return `### ${subtopic.title}\n\n${subtopic.content}`;
  return `- ${h}`;
}

/** bad 하이라이트를 소제목+하위 콘텐츠로 확장 */
const BAD_HIGHLIGHT_SUBTOPICS: {
  match: (h: string) => boolean;
  title: string;
  content: string;
}[] = [
  {
    match: (h) => /냉혹한 체스 플레이어|도구로 보며/.test(stripBold(h)),
    title: "냉혹한 체스 플레이어: 타인을 감정을 가진 인격체가 아니라 도구로 보며, 자신의 이익을 위해 기꺼이 기만합니다.",
    content:
      "목표 달성을 위해 타인의 감정과 신뢰를 전략적 변수로만 다루는 경향이 강합니다. " +
      "장기적으로는 신뢰 파괴와 관계 단절로 이어질 수 있으며, 한 번 잃은 신뢰는 되찾기 어렵습니다. " +
      "의사결정 전에 \"이 선택이 상대방에게 어떤 경험을 남기는가\", \"나를 믿는 사람을 어떻게 대하고 있는가\"를 스스로에게 묻는 습관을 권합니다. " +
      "전략적 사고와 실행력은 윤리적 경계 안에서 발휘할 때 지속 가능한 영향력으로 남습니다.",
  },
  {
    match: (h) => /도구적 가치|목적을 위해 사람을 수단/.test(stripBold(h)),
    title: "목적을 위해 사람을 수단으로 보는 경향이 강하며, 관계를 장기적인 신뢰보다 도구적 가치로 평가할 수 있습니다.",
    content:
      "관계를 이익·정보·영향력의 관점에서만 보면, 상대방은 배신감과 소외를 느끼고 결국 거리를 두게 됩니다. " +
      "핵심 관계(파트너, 동료, 협력자)에서는 \"지금 내가 이 사람을 수단으로만 대하고 있지는 않은가\"를 점검하는 것이 중요합니다. " +
      "단기 성과보다 장기적 신뢰와 협력을 함께 고려할 때, 전략적 능력이 더 안정적인 성과로 이어집니다.",
  },
  {
    match: (h) => /정보를 조정하거나 숨기는|계산적으로 움직이는/.test(stripBold(h)),
    title: "상황에 따라 계산적으로 움직이는 편이며, 필요하다면 정보를 조정하거나 숨기는 선택을 할 수 있습니다.",
    content:
      "정보 비대칭을 활용하는 것이 유리한 상황에서 그런 선택을 할 수 있는 가능성이 있습니다. " +
      "한 번 드러난 기만이나 정보 은폐는 평판과 신뢰를 크게 손상시키므로, " +
      "\"이것이 공개되면 나는 어떻게 설명할 수 있을까\"를 미리 자문하는 습관이 위험을 줄입니다. " +
      "투명성과 일관된 커뮤니케이션은 장기적으로 더 큰 협력과 기회를 불러옵니다.",
  },
  {
    match: (h) => /과도한 자기중심성|자기중심성이 강해/.test(stripBold(h)),
    title: "비판을 개인에 대한 공격으로 과장 해석하며, 자신의 가치를 과대평가하는 경향이 강합니다.",
    content:
      "비판이나 피드백을 \"나를 공격하는 것\"으로 받아들이면, 개선할 기회를 놓치고 관계만 손상됩니다. " +
      "자신의 기여를 과대평가하면 팀원들의 노력을 보지 못하고 협업이 흔들릴 수 있습니다. " +
      "비판을 \"정보\"로 받아들이는 연습과, \"이번에 내가 배울 수 있는 것은 무엇인가\"를 묻는 습관이 도움이 됩니다. " +
      "인정 욕구는 자연스럽지만, 타인의 기여를 인정하는 것이 장기적으로 더 큰 신뢰와 협력을 가져옵니다.",
  },
  {
    match: (h) => /자신의 기여를 과대평가|다른 사람의 노력을 인정하지/.test(stripBold(h)),
    title: "자신의 기여를 과대평가하거나, 다른 사람의 노력을 인정하지 않는 경향이 있습니다.",
    content:
      "자신의 역할과 기여를 크게 보는 반면 상대의 기여는 줄여 보면, 팀 내 불만과 갈등이 쌓입니다. " +
      "\"이번 결과에 상대방이 어떤 부분을 기여했는가\"를 구체적으로 떠올리는 습관이 균형을 맞추는 데 도움이 됩니다. " +
      "인정과 칭찬을 나누는 것이 협업과 동기 부여에 얼마나 중요한지 의식할 때, 관계와 성과가 함께 개선됩니다.",
  },
  {
    match: (h) => /낮은 공감과 높은 충동성|충동성과 낮은 공감/.test(stripBold(h)),
    title: "타인의 감정이나 결과를 거의 고려하지 않고, 즉각적인 만족을 추구하는 경향이 강합니다.",
    content:
      "결정을 내릴 때 상대방의 감정과 장기적 결과를 충분히 고려하지 않으면, 관계 손상과 예상치 못한 비용이 따를 수 있습니다. " +
      "중요한 결정 전에 \"이 선택이 1년 후, 5년 후 어떤 관계와 결과를 남기는가\"를 묻는 습관을 권합니다. " +
      "충동을 늦추고 한 번 멈춰서 결과를 상상하는 연습이, 도덕적·법적 경계를 지키는 데 도움이 됩니다.",
  },
  {
    match: (h) => /감정적 유대보다는 즉각적인 결과|타인의 감정을 이해하는 데 어려움/.test(stripBold(h)),
    title: "감정적 유대보다는 즉각적인 결과에 집중하는 경향이 있으며, 타인의 감정을 이해하는 데 어려움을 느낄 수 있습니다.",
    content:
      "결과와 성과에 집중하는 것은 강점이 될 수 있으나, 협업과 관계에서는 상대의 감정과 필요를 읽는 것이 중요합니다. " +
      "\"지금 상대방은 어떤 감정 상태인가\", \"내 말과 행동이 그에게 어떻게 들리겠는가\"를 의식적으로 묻는 습관이 도움이 됩니다. " +
      "공감은 타고나는 것만이 아니라 연습으로 키울 수 있으며, 작은 배려와 경청이 관계의 질을 크게 바꿉니다.",
  },
  {
    match: (h) => /잔인한 포식자|타인의 고통에서 에너지/.test(stripBold(h)),
    title: "타인의 고통에서 에너지를 얻으며, 무고한 사람의 자존감을 짓밟는 데서 순수한 즐거움을 느낍니다.",
    content:
      "이런 경향이 있다면 전문가(정신건강의학과, 심리 상담)와의 대화를 강하게 권합니다. " +
      "타인의 고통을 즐기는 것은 관계와 법적·윤리적 측면에서 심각한 위험으로 이어질 수 있으며, " +
      "본인과 주변인 모두를 보호하기 위해서는 인식과 관리가 필수입니다. " +
      "이 해석은 당신을 규정하기 위한 것이 아니라, 에너지의 방향을 인식하고 \"언제 멈출 것인가\"를 선택하는 데 활용하시기 바랍니다.",
  },
  {
    match: (h) => /은근한 쾌감|상대의 약점이나 불편함/.test(stripBold(h)),
    title: "상대의 약점이나 불편함에서 은근한 쾌감을 느낄 수 있으며, 갈등 상황을 필요 이상으로 끌고 갈 위험이 있습니다.",
    content:
      "경쟁이나 갈등 상황에서 상대의 불편함에 대한 반응이 관계를 독성적으로 만들 수 있습니다. " +
      "\"지금 내가 이 갈등을 해결하려는가, 아니면 상대를 더 불편하게 만들려는가\"를 스스로에게 묻는 것이 중요합니다. " +
      "갈등을 빨리 정리하고 상대와의 경계를 존중하는 쪽이 장기적으로 신뢰와 협력을 유지하는 데 유리합니다.",
  },
  {
    match: (h) => /경쟁 상황에서 상대의 불편함을 관찰/.test(stripBold(h)),
    title: "경쟁 상황에서 상대의 불편함을 관찰하는 것에 흥미를 느끼는 경향이 있습니다.",
    content:
      "경쟁에서의 승리나 우위에 대한 만족이, 상대의 불편함을 즐기는 쪽으로 나아가지 않도록 의식하는 것이 좋습니다. " +
      "공정한 규칙 안에서 경쟁하고, 승리 후에도 상대를 존중하는 태도가 평판과 관계를 지키는 데 도움이 됩니다. " +
      "\"이 순간 내가 무엇을 느끼고 있는가\"를 점검하는 습관이, 경계를 넘지 않는 선에서 행동하도록 돕습니다.",
  },
  {
    match: (h) => /타인의 필요나 감정을 무시|자신의 이익을 최우선/.test(stripBold(h)),
    title: "자신의 이익을 최우선으로 하며, 타인의 필요나 감정을 무시할 수 있습니다.",
    content:
      "자기 이익을 추구하는 것은 자연스럽지만, 타인의 필요를 완전히 무시하면 협력이 깨지고 관계가 손상됩니다. " +
      "중요한 결정 전에 \"이 선택이 영향을 미치는 사람들에게 어떤 결과를 주는가\"를 한 번씩 고려하는 습관을 권합니다. " +
      "자기 이익과 타인에 대한 배려의 균형을 찾을 때, 장기적으로 더 큰 신뢰와 기회가 열립니다.",
  },
  {
    match: (h) => /불공평한 요구나 기대|과도한 권리 의식/.test(stripBold(h)),
    title: "과도한 권리 의식으로 인해 불공평한 요구나 기대를 할 수 있습니다.",
    content:
      "자신이 받아야 마땅하다고 느끼는 것과, 상대방이 줄 수 있는 것·주고 싶어 하는 것 사이에 간극이 생기면 갈등이 납니다. " +
      "\"내 기대가 이 관계/상황에서 공정한가\", \"상대방의 입장에서는 어떻게 보일까\"를 묻는 습관이 도움이 됩니다. " +
      "적절한 경계와 요구는 필요하되, 일방적인 권리 주장은 관계를 해치고 협력을 줄입니다.",
  },
  {
    match: (h) => /윤리적 경계를 넘는 행동|도덕적 기준을 상황에 따라/.test(stripBold(h)),
    title: "도덕적 기준을 상황에 따라 유연하게 변경하여, 윤리적 경계를 넘는 행동을 정당화할 수 있습니다.",
    content:
      "상황에 따라 \"이번만\", \"특별한 경우\"로 자신의 행동을 정당화하면, 점점 경계가 흐려질 위험이 있습니다. " +
      "\"이 행동이 공개되면 나는 어떻게 설명할 수 있을까\", \"5년 후에도 이 선택을 후회하지 않을까\"를 자문하는 것이 중요합니다. " +
      "법의 테두리 안에서도 불공정·기만·정서적 착취는 평판과 신뢰를 파괴하므로, 일관된 윤리적 기준을 유지하는 것이 장기적 이익에 부합합니다.",
  },
  {
    match: (h) => /앙심 기반 행동|손해를 감수하면서까지 상대를 곤란/.test(stripBold(h)),
    title: "손해를 감수하면서까지 상대를 곤란하게 만들려는 앙심 기반 행동이 나타날 수 있습니다.",
    content:
      "복수나 보복에 에너지를 쓰면 단기적으로는 쾌감을 줄 수 있으나, 관계와 평판이 크게 손상되고 회복이 어렵습니다. " +
      "\"지금 내가 원하는 것은 정말 공정한 해결인가, 아니면 상대를 해치려는 것인가\"를 스스로에게 묻는 습관을 권합니다. " +
      "갈등을 정리하고 거리를 두는 쪽이 장기적으로 본인과 주변인 모두를 보호하는 데 유리합니다.",
  },
  {
    match: (h) => /극단적인 Dark 성향이 두드러지지|방어적\/공격적 패턴이 나타날 여지/.test(stripBold(h)),
    title: "현재 프로파일은 극단적인 Dark 성향이 두드러지지는 않지만, 특정 상황에서 방어적/공격적 패턴이 나타날 여지는 존재합니다.",
    content:
      "일상에서는 협력적이고 신뢰를 중시하는 모습을 보일 수 있으나, 압박·갈등·불공정하다고 느껴지는 상황에서는 방어적이거나 공격적으로 반응할 수 있습니다. " +
      "그런 순간에 \"지금 내 반응이 상황을 나아지게 하는가, 악화시키는가\"를 스스로 점검하는 것이 도움이 됩니다. " +
      "스트레스와 유발 상황을 미리 알고 있어야, 선택적으로 대응하고 관계를 지키는 데 유리합니다.",
  },
];

/** bad 리스크를 소제목+하위 콘텐츠로 확장 */
const BAD_RISK_SUBTOPICS: {
  match: (r: string) => boolean;
  title: string;
  content: string;
}[] = [
  {
    match: (r) => /강한 불신과 거리감|신뢰가 필요한 상황/.test(stripBold(r)),
    title: "장기적인 신뢰 관계 구축이 어렵고, 주변 사람들의 강한 불신과 거리감을 불러올 수 있습니다.",
    content:
      "타인을 수단으로 보거나 정보를 조정하는 패턴이 반복되면, 주변은 경계하고 거리를 둡니다. " +
      "신뢰는 한 번에 쌓이지 않으며, 한 번 무너지면 복구가 매우 어렵습니다. " +
      "핵심 관계(동료, 파트너, 협력자)에서는 투명성과 일관된 행동을 유지하는 것이 장기적 협력과 기회로 이어집니다.",
  },
  {
    match: (r) => /협업보다는 인정 욕구|팀워크를 해칠/.test(stripBold(r)),
    title: "조직 내에서 협업보다는 인정 욕구 중심으로 행동할 가능성이 크며, 팀워크를 해칠 수 있습니다.",
    content:
      "자신의 공로를 강조하고 타인의 기여를 줄여 보면, 팀원들의 동기와 협력이 떨어집니다. " +
      "\"지금 나는 팀의 목표에 집중하고 있는가, 아니면 내가 인정받는 것에 더 집중하고 있는가\"를 점검하는 것이 도움이 됩니다. " +
      "인정은 협업과 성과를 나눌 때 자연스럽게 따라오며, 팀의 성공을 함께 축하하는 태도가 관계와 평판을 돕습니다.",
  },
  {
    match: (r) => /도덕적·법적 경계선을 넘는 행동|위험 감수 성향/.test(stripBold(r)),
    title: "위험 감수 성향이 강해 도덕적·법적 경계선을 넘는 행동으로 이어질 수 있으며, 장기적 결과를 무시할 위험이 있습니다.",
    content:
      "즉각적인 결과나 쾌감을 추구하다 보면 법과 윤리의 경계를 넘는 선택을 할 위험이 있습니다. " +
      "중요한 결정 전에 \"이 행동이 법적으로, 윤리적으로 선을 넘는 것은 아닌가\"를 반드시 자문하시기 바랍니다. " +
      "장기적 결과를 한 번 상상해 보는 습관이, 본인과 주변인을 보호하는 데 도움이 됩니다.",
  },
  {
    match: (r) => /타인에게 정서적·심리적 피해|갈등 상황을 필요 이상으로 악화/.test(stripBold(r)),
    title: "갈등 상황을 필요 이상으로 악화시키고, 타인에게 정서적·심리적 피해를 줄 수 있습니다.",
    content:
      "상대의 고통이나 불편함에서 에너지를 얻는 패턴은 관계를 독성적으로 만들고, 법적·윤리적 문제로 이어질 수 있습니다. " +
      "\"지금 내가 이 갈등을 해결하려는가, 상대를 더 손상시키려는가\"를 스스로에게 묻는 것이 중요합니다. " +
      "전문가(상담, 심리)와의 대화를 통해 이런 패턴을 인식하고 조절하는 것을 권합니다.",
  },
  {
    match: (r) => /독성적이고 해로운 패턴|타인과의 관계에서/.test(stripBold(r)),
    title: "타인과의 관계에서 독성적이고 해로운 패턴이 나타날 수 있습니다.",
    content:
      "상대의 약점을 이용하거나, 갈등을 필요 이상으로 끌어가면 관계가 독성적으로 변하여 결국 단절로 이어질 수 있습니다. " +
      "건강한 관계는 상호 존중과 경계 안에서 유지됩니다. " +
      "\"지금 이 관계에서 나는 상대방에게 어떤 경험을 주고 있는가\"를 점검하는 습관이 도움이 됩니다.",
  },
  {
    match: (r) => /장기적인 관계 손상|복수나 보복/.test(stripBold(r)),
    title: "복수나 보복 행동으로 인해 장기적인 관계 손상이 발생할 수 있습니다.",
    content:
      "앙심에 따른 행동은 일시적인 만족을 줄 수 있으나, 관계와 평판을 크게 손상시키고 회복이 어렵습니다. " +
      "갈등을 정리하고 거리를 두는 방식이, 복수보다 본인과 주변인을 보호하는 데 유리합니다. " +
      "\"지금 내가 원하는 것은 공정한 해결인가, 상대를 해치려는 것인가\"를 묻는 습관을 권합니다.",
  },
];

function formatBadHighlight(h: string): string {
  const subtopic = BAD_HIGHLIGHT_SUBTOPICS.find((s) => s.match(h));
  if (subtopic) return `### ${subtopic.title}\n\n${subtopic.content}`;
  return `- ${h}`;
}

function formatBadRisk(r: string): string {
  const subtopic = BAD_RISK_SUBTOPICS.find((s) => s.match(r));
  if (subtopic) return `### ${subtopic.title}\n\n${subtopic.content}`;
  return `- ${r}`;
}

/** interpretation 블록을 마크다운 리포트 문자열로 변환 (로컬 저장 결과용) */
function interpretationToReportStrings(interpretation: {
  good?: { title?: string; summary?: string; highlights?: string[] };
  bad?: { title?: string; summary?: string; highlights?: string[]; risks?: string[] };
}): { good: string; bad: string; badTeaser: string } {
  let good = "";
  if (interpretation.good) {
    const g = interpretation.good;
    if (g.title) good += `### ${g.title}\n\n`;
    if (g.summary) good += `${g.summary}\n\n`;
    if (g.highlights?.length)
      good += g.highlights.map((h) => formatGoodHighlight(h)).join("\n\n") + "\n";
  }
  let bad = "";
  let badTeaser = "";
  if (interpretation.bad) {
    const b = interpretation.bad;
    if (b.title) bad += `### ${b.title}\n\n`;
    if (b.summary) {
      bad += `${b.summary}\n\n`;
      badTeaser = b.summary.slice(0, 200) + (b.summary.length > 200 ? "…" : "");
    }
    if (b.highlights?.length)
      bad += b.highlights.map((h) => formatBadHighlight(h)).join("\n\n") + "\n";
    if (b.risks?.length)
      bad += "\n**리스크:**\n\n" + b.risks.map((r) => formatBadRisk(r)).join("\n\n") + "\n";
  }
  return { good, bad, badTeaser };
}

async function fetchResult(assessmentId?: string | null, localId?: string | null): Promise<{
  data: MnpsResultData | null;
  isPaid?: boolean;
}> {
  if (typeof window !== "undefined" && localId) {
    const stored =
      sessionStorage.getItem(`mnps_result_local_${localId}`) ??
      localStorage.getItem(`mnps_result_local_${localId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          result?: {
            dTotal?: number;
            rawDTotal?: number;
            isExtremeTop?: boolean;
            traitScores?: MnpsResultData["traitScores"];
            archetype?: string;
          };
          interpretation?: Parameters<typeof interpretationToReportStrings>[0];
          goodReportFull?: string;
          badReportFull?: string;
          badTeaserFull?: string;
        };
        const r = parsed.result;
        if (r) {
          let good = "";
          let bad = "";
          let badTeaser = "";
          if (parsed.goodReportFull != null && parsed.badReportFull != null) {
            good = parsed.goodReportFull;
            bad = parsed.badReportFull;
            badTeaser = parsed.badTeaserFull ?? bad.slice(0, 200) + (bad.length > 200 ? "…" : "");
          } else if (parsed.interpretation) {
            const reports = interpretationToReportStrings(parsed.interpretation);
            good = reports.good;
            bad = reports.bad;
            badTeaser = reports.badTeaser;
          }
          good = ensureMinLength(good, "good");
          bad = ensureMinLength(bad, "bad");
          return {
            data: {
              archetype: r.archetype,
              dTotal: r.dTotal ?? 0,
              rawDTotal: r.rawDTotal,
              isExtremeTop: r.isExtremeTop,
              traitScores: r.traitScores ?? {},
              goodReport: good || null,
              badReport: bad || null,
              badTeaser: badTeaser || null,
            },
            isPaid: false,
          };
        }
      } catch {
        // ignore
      }
    }
    return { data: null };
  }

  if (assessmentId) {
    try {
      const response = await fetch(
        `/api/mnps/results?assessmentId=${assessmentId}`
      );
      const json = await response.json();
      if (json.success && json.result) {
        const r = json.result;
        const traitScores =
          r.traitScores && typeof r.traitScores === "object"
            ? r.traitScores
            : Array.isArray(r.radarChartData) && r.radarChartData.length >= 4
            ? {
                  machiavellianism: Number(r.radarChartData[0]?.value) ?? 0,
                  narcissism: Number(r.radarChartData[1]?.value) ?? 0,
                  psychopathy: Number(r.radarChartData[2]?.value) ?? 0,
                  sadism: Number(r.radarChartData[3]?.value) ?? 0,
                }
              : undefined;
        const goodReport = ensureMinLength(r.goodReport ?? "", "good") || null;
        const badReport = ensureMinLength(r.badReport ?? "", "bad") || null;
        return {
          data: {
          archetype: r.archetype,
            dTotal: r.dTotal ?? 0,
            rawDTotal: r.rawDTotal,
            isExtremeTop: r.isExtremeTop,
            traitScores,
            analysisAccuracy: r.analysisAccuracy,
            responseTimePenalty: r.responseTimePenalty,
            insincereResponsePattern: r.insincereResponsePattern,
            percentileAtCreation: r.percentileAtCreation,
            goodReport,
            badReport,
            badTeaser: r.badTeaser ?? null,
            radarChartData: r.radarChartData,
          },
          isPaid: json.isPaid === true,
        };
      }
    } catch (err) {
      console.error("MNPS 서버 결과 요청 실패:", err);
    }
    return { data: null };
  }

  if (typeof window !== "undefined") {
    const stored =
      sessionStorage.getItem("darkNatureResult") ??
      localStorage.getItem("darkNatureResult");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          result?: { dTotal?: number; rawDTotal?: number; isExtremeTop?: boolean; traitScores?: MnpsResultData["traitScores"]; archetype?: string };
          interpretation?: Parameters<typeof interpretationToReportStrings>[0];
          goodReportFull?: string;
          badReportFull?: string;
          badTeaserFull?: string;
        };
        const r = parsed.result;
        if (r) {
          let good = "";
          let bad = "";
          let badTeaser = "";
          if (parsed.goodReportFull != null && parsed.badReportFull != null) {
            good = parsed.goodReportFull;
            bad = parsed.badReportFull;
            badTeaser = parsed.badTeaserFull ?? bad.slice(0, 200) + (bad.length > 200 ? "…" : "");
          } else if (parsed.interpretation) {
            const reports = interpretationToReportStrings(parsed.interpretation);
            good = reports.good;
            bad = reports.bad;
            badTeaser = reports.badTeaser;
          }
          good = ensureMinLength(good, "good");
          bad = ensureMinLength(bad, "bad");
      return {
            data: {
              archetype: r.archetype,
              dTotal: r.dTotal ?? 0,
              rawDTotal: r.rawDTotal,
              isExtremeTop: r.isExtremeTop,
              traitScores: r.traitScores ?? {},
              goodReport: good || null,
              badReport: bad || null,
              badTeaser: badTeaser || null,
            },
            isPaid: false,
          };
        }
      } catch {
        // ignore
      }
    }
  }

  return { data: null };
}

function radarDataFromTraitScores(traitScores: MnpsResultData["traitScores"]) {
  const t = traitScores ?? {};
  return [
    { label: "마키아벨리즘", value: Math.round(t.machiavellianism ?? 0) },
    { label: "나르시시즘", value: Math.round(t.narcissism ?? 0) },
    { label: "사이코패시", value: Math.round(t.psychopathy ?? 0) },
    { label: "가학성", value: Math.round(t.sadism ?? 0) },
  ];
}

export default function MnpsResultClient() {
  const [result, setResult] = useState<MnpsResultData | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
      );
      const assessmentId = params.get("assessmentId");
      const localId = params.get("localId");
      const { data, isPaid: paid } = await fetchResult(assessmentId, localId);
      if (!data) {
        setError("결과를 불러올 수 없습니다.");
        setLoading(false);
        return;
      }
      setResult(data);
      setIsPaid(paid ?? false);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
        <p className="text-cyan-400/90 font-medium">무의식 패턴 대조 중...</p>
        <p className="text-xs text-gray-500">
          당신만의 리포트를 생성하고 있습니다.
        </p>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4 px-6 text-center">
        <p className="text-red-400">{error ?? "결과를 찾을 수 없습니다."}</p>
        <Link href="/mnps/test" className="report-btn-secondary">
          테스트 다시 시작
        </Link>
      </main>
    );
  }

  const goodText =
    typeof result.goodReport === "string"
      ? result.goodReport
      : result.goodReport != null
        ? String(result.goodReport)
        : "";
  const badText =
    typeof result.badReport === "string"
      ? result.badReport
      : result.badReport != null
        ? String(result.badReport)
        : "";
  const badTeaserText =
    typeof result.badTeaser === "string"
      ? result.badTeaser
      : result.badTeaser != null
        ? String(result.badTeaser)
        : "";
  const radarData =
    result.radarChartData && result.radarChartData.length >= 4
      ? result.radarChartData.map((d) => ({
          label: d.label ?? "",
          value: Number(d.value) || 0,
        }))
      : radarDataFromTraitScores(result.traitScores);
  const accuracy = result.analysisAccuracy ?? 0;
  const percentile = result.percentileAtCreation;

  return (
    <main className="min-h-screen bg-black text-white py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* 맥락 안내: 결과는 고정된 정답이 아닌 이번 응답 맥락에서의 한 도면임을 명시 */}
        <p className="text-gray-400 text-sm text-center leading-relaxed">
          이 결과는 당신의 <strong className="text-gray-300">현재 응답 맥락</strong>에서 나온 한 장의 지도입니다.
          시점이나 상황이 바뀌면 다르게 읽힐 수 있으며, 진단이 아닌 참고용 해석입니다.
          해석은 누적 응답 기반 규준(백분위)을 참고하며, 규준은 주기적으로 갱신될 수 있습니다.
        </p>
        {/* 상단: 극단 태그, 분석 정확도 */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-center">
          {result.isExtremeTop && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
              (극단)
            </span>
          )}
          {accuracy > 0 && (
            <div>
              <span className="text-gray-500 text-sm block mb-1">
                분석 정확도
              </span>
              <span
                className={
                  accuracy >= 90
                    ? "text-emerald-400 font-bold"
                    : accuracy >= 75
                      ? "text-amber-400 font-bold"
                      : "text-red-400 font-bold"
                }
              >
                {accuracy}%
              </span>
            </div>
          )}
        </div>

        {/* 실시간 백분위 배지 */}
        {percentile != null && (
          <p
            className={
              "text-center text-sm font-medium rounded-full px-4 py-2 inline-block w-full max-w-md mx-auto " +
              (percentile <= 10
                ? "bg-red-950/50 text-red-400 border border-red-800/60"
                : percentile >= 50
                  ? "bg-emerald-950/30 text-emerald-400 border border-emerald-800/50"
                  : "bg-amber-950/30 text-amber-400 border border-amber-800/50")
            }
          >
            {percentile <= 10
              ? `당신은 상위 ${(100 - percentile).toFixed(1)}% 위험군에 해당합니다.`
              : `검사 시점 기준 상위 ${(100 - percentile).toFixed(1)}% 수준입니다.`}
          </p>
        )}

        {result.responseTimePenalty && (
          <p className="text-center text-xs text-amber-500/90">
            응답 시간이 짧아 분석 정확도에 페널티가 반영되었습니다.
          </p>
        )}
        {result.insincereResponsePattern && (
          <p className="text-center text-xs text-red-400/90">
            동일/지그재그 패턴이 감지되어 결과는 참고용으로만 활용해 주세요.
          </p>
        )}

        {/* 레이더 차트 */}
        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-200 mb-4 text-center">
            다크 테트라드 프로필
          </h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis
                  dataKey="label"
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                />
                <Radar
                  name="점수"
                  dataKey="value"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 엘리트 뷰 (Good Report) */}
        {goodText && (
          <section className="bg-gradient-to-br from-emerald-950/40 to-zinc-900 p-6 sm:p-8 rounded-2xl border border-emerald-800/50 shadow-lg shadow-emerald-900/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-900/60 rounded-lg">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-300">
                  엘리트 뷰 (긍정 해석)
                </h2>
                <p className="text-xs text-emerald-400/70">
                  당신의 강점을 엘리트 관점으로 해석합니다
                </p>
              </div>
            </div>
            <div className="mnps-report-content max-w-3xl text-base leading-loose text-zinc-300 [&_p]:mb-4 [&_ul]:my-4 [&_h3]:mt-8 [&_h3]:mb-3 [&_h4]:mt-6 [&_h4]:mb-2 [&_hr]:my-8 [&_hr]:border-zinc-600">
              {parseMarkdown(goodText)}
            </div>
          </section>
        )}

        {/* sessionStorage 전용: Good 미있을 때 요약 문구 */}
        {!goodText && result.archetype && (
          <section className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
            <p className="text-zinc-400 text-sm">
              전체 긍정·어두운 이면 리포트는 테스트 완료 후 결과 페이지에서 확인하실 수 있습니다.
            </p>
          </section>
        )}

        {/* 어두운 이면 (Bad Report) */}
        <section className="border border-red-800/60 bg-gradient-to-br from-red-950/50 to-zinc-950 shadow-lg shadow-red-900/30 p-6 rounded-2xl relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-red-900/60 rounded-lg">
              <Skull className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-400">어두운 이면</h2>
              <p className="text-xs text-red-400/70">
                가공 없는 어두운 이면
              </p>
            </div>
          </div>

          {badText ? (
            <div className="p-5 sm:p-6 bg-red-950/30 rounded-xl border border-red-900/20">
              <div className="mnps-report-content max-w-3xl text-base leading-loose text-zinc-300 [&_p]:mb-4 [&_ul]:my-4 [&_h3]:mt-8 [&_h3]:mb-3 [&_h4]:mt-6 [&_h4]:mb-2 [&_hr]:my-8 [&_hr]:border-zinc-600">
                {parseMarkdown(badText)}
              </div>
            </div>
          ) : (
            <>
              {badTeaserText && (
                <div className="p-5 sm:p-6 bg-red-950/30 rounded-xl border border-red-900/20 relative">
                  <div className="mnps-report-content max-w-3xl text-base leading-loose text-zinc-300 [&_p]:mb-4 [&_ul]:my-4">
                    {parseMarkdown(badTeaserText)}
                  </div>
                  {isPaid ? null : (
                    <div
                      className="absolute inset-0 rounded-xl bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
                      aria-hidden="true"
                    >
                      <Skull className="w-10 h-10 text-red-400" />
                      <p className="text-red-300 font-semibold text-center px-4">
                        최종 리스크 시나리오는 유료 해제 후 열람할 수 있습니다
                      </p>
                      <p className="text-zinc-400 text-xs">
                        결제 시 어두운 이면 전문이 공개됩니다.
                      </p>
                    </div>
                  )}
                </div>
              )}
              {!badTeaserText && !badText && (
                <p className="text-zinc-500 text-sm">
                  결제 후 어두운 이면 리포트를 확인할 수 있습니다.
                </p>
              )}
            </>
          )}
        </section>

        <DisclaimerBanner />

        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <Link
            href="/mnps/results"
            className="px-6 py-3 rounded-xl border border-zinc-600 bg-zinc-800/50 text-gray-300 hover:bg-zinc-700/50 font-medium transition-colors"
          >
            이전 결과 보기
          </Link>
          <Link
            href="/mnps/test"
            className="px-6 py-3 rounded-xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 font-medium transition-colors"
          >
            재검사
          </Link>
          <Link
            href="/growth-roadmap"
            className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors"
          >
            마인드 아키텍터 이동
          </Link>
        </div>
      </div>
    </main>
  );
}
