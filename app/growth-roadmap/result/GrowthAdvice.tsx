import React from 'react';
import { GapAnalysisResult } from '@growth-roadmap/lib/analysis';

interface GrowthAdviceProps {
    result: GapAnalysisResult;
}

const GrowthAdvice: React.FC<GrowthAdviceProps> = ({ result }) => {
    const dimName = (key: string) => {
        switch (key) {
            case 'stability':
                return '안정';
            case 'growth':
                return '성장';
            case 'relation':
                return '관계';
            case 'autonomy':
                return '자율';
            default:
                return key;
        }
        // eslint-disable-next-line @typescript-eslint/no-unreachable-code
    };

    return (
        <div className="glass-panel p-6 rounded-xl overflow-y-auto max-h-[600px]">
            {/* 성장 방안 */}
            <section className="mb-6">
                <h3 className="text-lg font-bold mb-2">성장 방안</h3>
                <p className="text-gray-300">
                    현재 <strong>{dimName(result.dimensions.dominantGap)}</strong> 영역에서 가장 큰 괴리감을 보이고 있습니다.
                    이를 해소하기 위해 다음과 같은 구체적인 실행 단계를 제시합니다.
                    <br />
                    1️⃣ <strong>{dimName(result.dimensions.dominantGap)}</strong> 영역의 일상 습관을 재점검하고, 목표 지향적인 훈련을 적용합니다.
                    <br />
                    2️⃣ 단기 목표를 설정하고, 이를 달성하기 위한 주간/월간 로드맵을 작성합니다.
                    <br />
                    3️⃣ 필요한 자원(시간, 도구, 멘토 등)을 확보하고, 책임자를 지정해 실행을 지속합니다.
                    <br />
                    4️⃣ 정기적인 모니터링과 피드백을 통해 진행 상황을 점검하고, 필요 시 전략을 조정합니다.
                </p>
            </section>

            {/* 피해야 할 행동 */}
            <section className="mb-6">
                <h3 className="text-lg font-bold mb-2">피해야 할 행동</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                    <li>현재의 비효율적인 습관을 그대로 유지하는 것</li>
                    <li>목표를 구체화하지 않고 막연하게만 생각하는 것</li>
                    <li>피드백을 무시하고 자기 판단에만 의존하는 것</li>
                </ul>
            </section>

            {/* 강점 요약 */}
            <section className="mb-6">
                <h3 className="text-lg font-bold mb-2">강점 요약</h3>
                <p className="text-gray-300">
                    현재 <strong>{dimName(result.dimensions.strongestPotential)}</strong> 영역에서 높은 잠재력을 보유하고 있습니다.
                    이 강점을 활용해 다른 영역의 개선을 촉진할 수 있습니다.
                </p>
            </section>

            {/* 헛점 분석 */}
            <section>
                <h3 className="text-lg font-bold mb-2">헛점 분석</h3>
                <p className="text-gray-300">
                    가장 큰 격차는 <strong>{dimName(result.dimensions.dominantGap)}</strong> 영역이며, 이는 현재 행동 패턴이 목표와 크게 어긋나 있음을 의미합니다.
                    해당 영역을 집중적으로 개선하는 것이 전체 성장에 가장 큰 영향을 미칩니다.
                </p>
            </section>
        </div>
    );
};

export default GrowthAdvice;
