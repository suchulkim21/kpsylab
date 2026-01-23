// src/lib/module3/resultFormatter.ts
/**
 * Module 3 분석 결과를 피검자에게 친절히 전달하는 문자열 포맷터.
 * energy, focus, creativity 세 가지 차원을 바탕으로 dominant trait와 설명을 반환합니다.
 */
export function formatResult(result: {
    dominantTrait: string;
    description: string;
    scores: { energy: number; focus: number; creativity: number };
}): string {
    const { dominantTrait, description, scores } = result;
    const { energy, focus, creativity } = scores;

    const tips: string[] = [];
    if (energy >= 70) {
        tips.push('에너지가 높으니 활발한 활동과 운동을 지속하세요.');
    } else if (energy <= 30) {
        tips.push('에너지 보충을 위해 충분한 휴식과 영양을 챙기세요.');
    }

    if (focus >= 70) {
        tips.push('집중력이 뛰어나니 깊이 있는 작업에 집중해 보세요.');
    } else if (focus <= 30) {
        tips.push('집중을 높이려면 방해 요소를 최소화하고 짧은 휴식을 활용하세요.');
    }

    if (creativity >= 70) {
        tips.push('창의성이 강하니 새로운 아이디어를 자유롭게 시도해 보세요.');
    } else if (creativity <= 30) {
        tips.push('창의성을 키우려면 다양한 경험과 영감을 찾아보세요.');
    }

    const summary = `
🔎 <strong>${dominantTrait}</strong> 유형
${description}

📊 점수
- 에너지 (Energy) : ${energy}
- 집중력 (Focus) : ${focus}
- 창의성 (Creativity) : ${creativity}

💡 실생활 적용 팁
${tips.map(t => `• ${t}`).join('\n')}
`.trim();

    return summary;
}
